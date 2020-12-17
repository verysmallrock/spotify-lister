import { action, makeAutoObservable } from 'mobx';

export default class SpotifyStore  {
	userInfo = {}
	savedTracks = []

	constructor(service) {
		makeAutoObservable(this)
		this.service = service // SpotifyService

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
		return this.updateSavedTracks(json)
	}

	@action updateUserInfo(userInfo) {
		this.userInfo = userInfo
	}

	@action updateSavedTracks(json) {
		this.savedTracks = this.savedTracks ?? []
		let newTracks = []
		for (let item of json.items) {
			this.savedTracks.push(item)
			this.newTracks = []
		}
		return newTracks
	}
}