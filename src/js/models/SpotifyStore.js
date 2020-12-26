import { observable, action, makeAutoObservable } from 'mobx'
import { create, persist } from 'mobx-persist'
import localForage from 'localforage'
import PagedList from './PagedList'
import Album from './Album'
import Track from './Track'
import FilterStore from './FilterStore'

const hydrate = create({
	storage: localForage,
	jsonify: true,
	debounce: 1000
})

class AlbumStore {
	@persist nextPageLink = 'https://api.spotify.com/v1/me/albums?limit=50'
	@persist finished = false
	@persist total = 0
	@persist loadedCount = 0

	@persist('list', Album) models = []
	modelMap = {}
	trackMap = {}

	constructor() {
		makeAutoObservable(this)
		this.modelClass = Album
		this.modelAccessor = 'album'
	}

	@action updateTotal(total) {
		this.total = total
	}

	@action setNextPageLink(value) {
		this.nextPageLink = value
	}

	@action setFinished(value) {
		this.finished = value
	}

	@action setLoadedCount(value) {
		this.loadedCount = value
	}

	@action _addModels(models) {
		let newModels = []
		for (let model of models) {
			if (!this.modelMap[model.id])
				newModels.push(model)
		}
		this.models = this.models.concat(newModels)
		this._reindex()
	}

	@action _reindex() {
		this.modelMap = {}
		this.trackMap = {}
		for (let model of this.models) {
			this.modelMap[model.id] = model
			for(let track of model.tracks)
				this.trackMap[track.id] = track
		}
	}

	setTrackFeatures(dataArray) {
		for (let features of dataArray) {
			let model = this.trackMap[features.id]
			if (model) {
				model.setFeatures(features)
			}
		}
	}
}

class TrackStore {
	@persist nextPageLink = 'https://api.spotify.com/v1/me/tracks?limit=50'
	@persist finished = false
	@persist total = 0
	@persist loadedCount = 0

	@persist('list', Track) models = []
	modelMap = {}

	constructor() {
		makeAutoObservable(this)
		this.modelClass = Track
		this.modelAccessor = 'track'
	}

	@action updateTotal(total) {
		this.total = total
	}

	@action setNextPageLink(value) {
		this.nextPageLink = value
	}

	@action setFinished(value) {
		this.finished = value
	}

	@action setLoadedCount(value) {
		this.loadedCount = value
	}

	
	@action _addModels(models) {
		let newModels = []
		for (let model of models) {
			if (!this.modelMap[model.id])
				newModels.push(model)
		}
		this.models = this.models.concat(newModels)
		this._reindex()
	}

	@action _reindex() {
		this.modelMap = {}
		for (let model of this.models) {
			this.modelMap[model.id] = model
		}
	}
}

export default class SpotifyStore  {
	@persist('object') userInfo = {}
	@persist('object', AlbumStore) albums = new AlbumStore()
	@persist('object', TrackStore) tracks = new TrackStore()

	filter = new FilterStore()

	// paged listers
	savedTracksList = null
	savedAlbumsList = null

	playingUris = []

	constructor(service) {
		makeAutoObservable(this)
		this.service = service // SpotifyService

		setTimeout(() => { this.init() }, 500)
	}

	playUri(uri) {
		this.playingUris = [ uri ]
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
		let tracks = this.tracks?.models ?? []
		let albumTracks = []
		for (let album of this.albums.models)
			albumTracks = albumTracks.concat(album.tracks)

		let models = tracks.concat(albumTracks)
		if (this.filter.enabled) {
			return models.filter((model) => this.filter.filterFunc(model))
		} else {
			return models
		}
	}
}