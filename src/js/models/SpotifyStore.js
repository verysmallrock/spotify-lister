import { observable, action, makeAutoObservable } from 'mobx'
import { create, persist } from 'mobx-persist'
import Track from './Track'

const hydrate = create({
	storage: localStorage,
	jsonify: true,
	debounce: 500
})

export default class SpotifyStore  {
	@persist('object') @observable userInfo = {}
	@persist('list', Track) @observable savedTracks = []
	@observable trackMap = {}

	constructor(service) {
		makeAutoObservable(this)
		this.service = service // SpotifyService
		this.init()
	}

	async init() {
		await Promise.all([
			hydrate('store', this)
		])
		this._reindex()
		this.fetchUserInfoJP()
	}

	async fetchUserInfoJP() {
		let href = 'https://api.spotify.com/v1/me'
			
		let json = await this.service.fetchJP(href)
		this.updateUserInfo(json)
		return this.userInfo
	}

	async fetchSavedTracksJP() {
		let href = 'https://api.spotify.com/v1/me/tracks'
		let json = await this.service.fetchJP(href)
		// TODO Pagination
		return this.updateSavedTracks(json)
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
		for (let featureInfo of features) {
			this.trackMap[featureInfo.id].setFeatures(featureInfo)
		}
	}

	@action updateUserInfo(userInfo) {
		this.userInfo = userInfo
	}

	@action updateSavedTracks(json) {
		//this.savedTracks = this.savedTracks ?? []
		let tracks = []
		for (let item of json.items) {
			let track = new Track(item.track, item.added_at)
			tracks.push(track)
			
		}
		this.savedTracks = tracks
		this._reindex()
		return this.savedTracks
	}

	_reindex() {
		this.trackMap = {}
		for(let track of this.savedTracks) {
			this.trackMap[track.id] = track
		}
	}
}