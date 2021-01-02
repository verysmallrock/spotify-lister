import { action, makeAutoObservable, observable } from 'mobx'
import { create, persist } from 'mobx-persist'
import localForage from 'localforage'
import PagedList from './service/PagedList'
import FilterStore from './FilterStore'
import TrackStore from './TrackStore'
import AlbumStore from './AlbumStore'
import PlaylistStore from './PlaylistStore'
import Playlist from './service/Playlist'

const hydrate = create({
	storage: localForage,
	debounce: 3000
})

class UIState {
	playingUris = []
	@persist('object', PlaylistStore) playlist = new PlaylistStore()
	@persist selectedTab = 'tracks'

	tabs = {
		tracks: {
			title: 'Your Tracks'
		},
		playlist: {
			title: 'Current Playlist'
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

	@action playUri(uri) {
		this.playingUris = [ uri ]
	}

	isPlaying(uri) {
		return this.playingUris.indexOf(uri) >= 0
	}
}

export default class SpotifyStore  {
	// NOTE: ui state is persisted in a different db so it doesn't get 
	// blocked by the long persist call for tracks.
	uiState = new UIState()

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

		setTimeout(() => { this.init() }, 500)
	}

	playUri(uri) {
		this.uiState.playUri(uri)
	}

	isPlaying(uri) {
		return this.uiState.isPlaying(uri)
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
		this.savedAlbumsList = new PagedList()
		this.savedAlbumsList.hydrate(this.albums, this.service)
		this.savedTracksList = new PagedList()
		this.savedTracksList.hydrate(this.tracks, this.service)	
		
		this.fetchUserInfoJP()
	}

	async fetchUserInfoJP() {
		let href = 'https://api.spotify.com/v1/me'
			
		let json = await this.service.fetchJP(href)
		this.updateUserInfo(json)
		return this.userInfo
	}

	async fetchSavedTracksJP() {
		await this.savedTracksList.fetchJP() // init
		this.savedTracksList.fetchAllJP()
	}

	async fetchSavedAlbumsJP() {
		await this.savedAlbumsList.fetchJP() // init
		this.savedAlbumsList.fetchAllJP()
	}

	async fetchTrackFeaturesJP() {
		let href = 'https://api.spotify.com/v1/audio-features'
		let ids = []
		for (let track of this.currentTracks) {
			if (Object.keys(track.features).length > 3) { continue }
			if (ids.length >= 100) { break }
			ids.push(track.id)
		}

		if (ids.length == 0) { return false }
		href += `?ids=${ids.join(',')}`
		let json = await this.service.fetchJP(href)
		let features = json.audio_features
		this.savedTracksList.mapData(features, 'setFeatures')
		this.albums.setTrackFeatures(features)
		return true
	}

	async fetchAllTrackFeaturesJP() {
		while (await this.fetchTrackFeaturesJP()) {
			// loop until it returns false
		}
	}

	@action updateUserInfo(userInfo) {
		this.userInfo = userInfo
	}

	get currentTracks() {
		let uiState = this.uiState
		if (uiState.selectedTab == 'playlist') {
			return this.playlist.models
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
				return models.filter((model) => this.filter.filterFunc(model))
			} else {
				return models
			}
		}
	}
}