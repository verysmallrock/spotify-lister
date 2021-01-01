export default class Playlist {
	constructor(store, service, playlistStore) {
		this.store = store
		this.service = service
		this.playlistStore = playlistStore
	}

	async saveJP() {		
		// create playlist
		let href = `https://api.spotify.com/v1/users/${this.store.userInfo.id}/playlists`
		let body = {
			name: this.playlistStore.name
		}
		let options = { 
			method: 'POST',
			body: JSON.stringify(body)
		}
		let playlistInfo = await this.service.fetchJP(href, options)

		// add tracks 100 at a time
		href = `https://api.spotify.com/v1/playlists/${playlistInfo.id}/tracks`
		let tracks = [...this.playlistStore.models]
		let position = 0
		while (tracks.length > 0) {
			let tracksToAdd = tracks.splice(0, 100)
			let uris = tracksToAdd.map( (track) => track.attributes.uri )
			body = {
				position: position,
				uris: uris
			}
			options = { 
				method: 'POST',
				body: JSON.stringify(body)
			}
			let addResponse = await this.service.fetchJP(href, options)
			position += tracksToAdd.length
		}
		
	}
}