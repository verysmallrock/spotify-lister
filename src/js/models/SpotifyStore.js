import { observable, action, makeAutoObservable } from 'mobx'
import { create, persist } from 'mobx-persist'
import localForage from 'localforage'
import TrackList from './TrackList'
import FilterStore from './FilterStore'

const hydrate = create({
	storage: localForage,
	jsonify: true,
	debounce: 1000
})

export default class SpotifyStore  {
	@persist('object') @observable userInfo = {}
	@persist('object', TrackList) savedTrackList = null
	filter = new FilterStore()

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
		this.savedTrackList?.hydrationComplete(this.service)
		this.fetchUserInfoJP()
	}

	async fetchUserInfoJP() {
		let href = 'https://api.spotify.com/v1/me'
			
		let json = await this.service.fetchJP(href)
		this.updateUserInfo(json)
		return this.userInfo
	}

	async fetchPage() {
		let { savedTrackList } = this
		if (savedTrackList) {
			return savedTrackList.fetchJP()
		} else {
			savedTrackList = this.savedTrackList = new TrackList()
			return savedTrackList.fetchInitialPageJP('https://api.spotify.com/v1/me/tracks?limit=50', this.service)
		}
	}

	fetchSavedTracksJP() {
		this.fetchPage()
	}
	
	async fetchAllJP() {
		await this.fetchPage() // init
		this.savedTrackList.fetchAllJP()
	}

	async fetchTrackFeaturesJP() {
		let href = 'https://api.spotify.com/v1/audio-features'
		let ids = []
		for (let track of this.savedTracks) {
			if (Object.keys(track.features).length > 3) { continue }
			if (ids.length >= 100) { break }
			ids.push(track.id)
		}

		if (ids.length == 0) { return false }
		href += `?ids=${ids.join(',')}`
		let json = await this.service.fetchJP(href)
		let features = json.audio_features
		this.savedTrackList.mapData(features, 'setFeatures')
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

	get savedTracks() {
		let models = this.savedTrackList?.models ?? []
		if (this.filter.enabled) {
			return models.filter((model) => this.filter.filterFunc(model))
		} else {
			return models
		}
	}

	_reindex() {
		
	}
}