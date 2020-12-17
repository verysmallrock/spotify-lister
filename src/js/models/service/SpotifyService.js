export default class SpotifyService {
	constructor(authToken) {
		this.authToken = authToken
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
			let error = await response.text()
			throw `Error fetching from Spotify: ${response.status} (${error})`
		}
	}
}