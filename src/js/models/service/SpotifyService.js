export default class SpotifyService {
	constructor(authToken, refreshToken) {
		this.authToken = authToken
		this.refreshToken = refreshToken
	}

	_setAuthHeader(options) {
		let { authToken } = this

		if (options.headers) {
			options.header.Authorization = `Bearer ${authToken}`
		} else {
			options.headers = {
				'Authorization': `Bearer ${authToken}`
			}
		}
	}

	async fetchJP(href, options = {}) {
		this._setAuthHeader(options)	
		let request = fetch(href, options)
		let response = await request
		if (response.ok) {
			return await response.json()
		} else {
			if (response.status === 401) {
				// refresh token
				return window.location.href = `${window.location.protocol}//${window.location.host}/refresh_token?refresh_token=${this.refreshToken}`
			}
			let error = await response.text()
			throw `Error fetching from Spotify: ${response.status} (${error})`
		}
	}
}