import { observable, action, makeAutoObservable } from 'mobx'
import { create, persist } from 'mobx-persist'
import TrackList from './TrackList'

const hydrate = create({
	storage: localStorage,
	jsonify: true,
	debounce: 500
})

export default class SpotifyStore  {
	@persist('object') @observable userInfo = {}
	@persist('object', TrackList) savedTrackList = null

	playingUris = []

	constructor(service) {
		makeAutoObservable(this)
		this.service = service // SpotifyService
		this.init()
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

	fetchSavedTracksJP() {
		let { savedTrackList } = this
		if (savedTrackList) {
			return savedTrackList.fetchJP()
		} else {
			savedTrackList = this.savedTrackList = new TrackList()
			return savedTrackList.fetchInitialPageJP('https://api.spotify.com/v1/me/tracks', this.service)
		}
	}

	async fetchTrackFeaturesJP() {
		let href = 'https://api.spotify.com/v1/audio-features'
		let ids = []
		for (let track of this.savedTracks) {
			if (ids.length >= 100) { break }
			ids.push(track.id)
		}

		href += `?ids=${ids.join(',')}`
		let json = await this.service.fetchJP(href)
		let features = json.audio_features
		this.savedTrackList.mapData(features, 'setFeatures')
	}

	@action updateUserInfo(userInfo) {
		this.userInfo = userInfo
	}

	get savedTracks() {
		return this.savedTrackList?.models ?? []
	}

	_reindex() {
		
	}
}