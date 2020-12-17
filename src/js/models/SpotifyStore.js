export default class SpotifyStore  {
	constructor(service) {
		this.service = service // SpotifyService

		this.fetchUserInfo()
	}

	async fetchUserInfo() {
		let href = 'https://api.spotify.com/v1/me'
			
		let json = await this.service.fetchJP(href)
		this.userInfo = json
	}
}