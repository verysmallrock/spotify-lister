import { action, makeAutoObservable } from 'mobx'
import { create, persist } from 'mobx-persist'
import localForage from 'localforage'
import PagedList from './service/PagedList'
import FilterStore from './FilterStore'
import TrackStore from './TrackStore'
import AlbumStore from './AlbumStore'
import RecommendationStore from './RecommendationStore'
import PlaylistStore from './PlaylistStore'
import Playlist from './service/Playlist'

const hydrate = create({
	storage: localForage,
	debounce: 1000
})

class UIState {
	playingUris = []
	playerState = null
	currentPlayerTrack = null
	@persist('object', PlaylistStore) playlist = new PlaylistStore()
	@persist('object', RecommendationStore) recommendations = new RecommendationStore()
	@persist selectedTab = 'tracks'
	searchText = ''

	tabs = {
		tracks: {
			title: 'Your Tracks'
		},
		playlist: {
			title: 'Current Playlist'
		},
		similar: {
			title: 'Similar Songs'
		}
	}

	constructor() {
		makeAutoObservable(this)
		this.init()
	}

	async init() {
		await Promise.all([
			hydrate('uiState', this)
		])
		this.playlist.hydrate()
	}

	@action setSelectedTab(tab) {
		this.selectedTab = tab
	}

	@action play(uris) {
		this.playingUris = uris
	}

	@action setSearchText(text) {
		this.searchText = text
	}

	@action setPlayerState(state) {
		this.playerState = state
		this.currentPlayerTrack = state.track
	}

	isPlaying(track) {
		if (!this.currentPlayerTrack?.name)
			return false
		return track?.attributes.id == this.currentPlayerTrack?.id || track?.attributes.name == this.currentPlayerTrack?.name
	}
}

export default class SpotifyStore  {
	// NOTE: ui state is persisted in a different db so it doesn't get
	// blocked by the long persist call for tracks.
	uiState = new UIState()
	isPlayerPaused = false
	loading = true

	@persist hasStoredDatabase = false
	@persist('object') userInfo = {}
	@persist('object', AlbumStore) albums = new AlbumStore()
	@persist('object', TrackStore) tracks = new TrackStore()

	filter = new FilterStore()
	get playlist() { return this.uiState.playlist }

	// paged listers
	savedTracksList = null
	savedAlbumsList = null

	constructor(service) {
		makeAutoObservable(this)
		this.service = service // SpotifyService

		this.init()
	}

	playUris(uris) {
		this.uiState.play(uris)
	}

	updatePlayerState(state) {
		this.uiState.setPlayerState(state)
	}

	isPlaying(track) {
		return this.uiState.isPlaying(track)
	}

	pausePlayer(pause) {
		this.isPlayerPaused = pause
	}

	get playingUris() {
		return this.uiState.playingUris
	}

	savePlaylistJP() {
		let playlist = new Playlist(this, this.service, this.playlist)
		return playlist.saveJP()
	}

	async init() {
		await Promise.all([
			hydrate('store', this)
		])
		// user's saved albums
		this.savedAlbumsList = new PagedList()
		this.savedAlbumsList.hydrate(this.albums, this.service)
		// user's saved tracks
		this.savedTracksList = new PagedList()
		this.savedTracksList.hydrate(this.tracks, this.service)
		// recommendations based on seed track
		this.recommendedTracksList = new PagedList()
		this.recommendedTracksList.hydrate(this.uiState.recommendations, this.service)
		if (!this.hasStoredDatabase) {
			await this.loadAllUserData()
		}
		setTimeout( () => { this.setLoading(false) }, 1000)
		// TODO: Tracks from user's saved playlists

		this.fetchUserInfoJP()
	}

	@action setLoading(loading) {
		this.loading = loading
	}

	async loadAllUserData() {
		await this.fetchSavedTracksJP()
		await this.fetchSavedAlbumsJP()
		await this.fetchAllTrackFeaturesJP()
		this.hasStoredDatabase = true
	}

	resetAllData() {
		console.log(localForage)
		return new Promise((resolve) => {
			localForage.clear(resolve)
		})

	}

	async fetchUserInfoJP() {
		let href = 'https://api.spotify.com/v1/me'

		let json = await this.service.fetchJP(href)
		this.updateUserInfo(json)
		return this.userInfo
	}

	async fetchSavedTracksJP() {
		await this.savedTracksList.fetchJP() // init
		return this.savedTracksList.fetchAllJP()
	}

	async fetchSavedAlbumsJP() {
		await this.savedAlbumsList.fetchJP() // init
		await this.savedAlbumsList.fetchAllJP()
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	async fetchTrackFeaturesJP(tracks = this.currentTracks, recommendationsOnly = false) {
		let href = 'https://api.spotify.com/v1/audio-features'
		let ids = []
		for (let track of tracks) {
			if (Object.keys(track.features).length > 3) { continue }
			if (ids.length >= 100) { break }
			ids.push(track.id)
		}

		if (ids.length == 0) { return false }
		href += `?ids=${ids.join(',')}`
		let json
		try {
			json = await this.service.fetchJP(href)
		}
		catch (errorInfo) {
			console.error(errorInfo.message)
			if(errorInfo.response.status == 429) {
				console.warn('Spotify says SLOW DOWN')
				await this.sleep(3000) // TODO: read Retry-After header
			} else {
				await this.sleep(300)
			}
			// keep trying!
			return true
		}
		let features = json.audio_features
		if (recommendationsOnly)
			this.recommendedTracksList.mapData(features, 'setFeatures')
		else {
			this.savedTracksList.mapData(features, 'setFeatures')
			this.recommendedTracksList.mapData(features, 'setFeatures')
			this.albums.setTrackFeatures(features)
		}
		return true
	}

	async fetchAllTrackFeaturesJP() {
		while (await this.fetchTrackFeaturesJP()) {
			// loop until it returns false
		}
	}

	async getRecommendationsJP(track) {
		this.uiState.recommendations.reset()
		this.uiState.recommendations.setSeedTrack(track)
		await this.recommendedTracksList.fetchJP()
		this.fetchTrackFeaturesJP(this.uiState.recommendations.models, true)
	}

	@action updateUserInfo(userInfo) {
		this.userInfo = userInfo
	}

	get currentTracks() {
		let uiState = this.uiState
		let result = null
		if (uiState.selectedTab == 'playlist') {
			result = this.playlist.models
		}
		else if (uiState.selectedTab == 'similar') {
			result = this.uiState.recommendations.models
		}
		else {
			let trackMap = {}
			let tracks = this.tracks?.models ?? []
			for (let track of tracks) {
				trackMap[track.id] = true
			}
			let albumTracks = []
			for (let album of this.albums.models)
				for (let track of album.tracks)
					if(!trackMap[track.id]) {
						trackMap[track.id] = true
						albumTracks.push(track)
					}

			let models = tracks.concat(albumTracks)
			if (this.filter.enabled) {
				result = models.filter((model) => this.filter.filterFunc(model))
			} else {
				result = models
			}

			if (this.uiState.searchText != null && this.uiState.searchText.length > 0) {
				result = result.filter((model) => model.hasText(this.uiState.searchText))
			}
		}

		return result
	}
}