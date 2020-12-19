import React from 'react'
import { observer } from 'mobx-react'
import { action, makeAutoObservable } from 'mobx'
import S from './SpotifyPlayer.css'

class EmbedData {
	embedUrl = ''
	embedId = ''

	constructor() {
		makeAutoObservable(this)
	}

	@action setUri(uri) {
		let id = uri.split(':')[2]
		this.embedUrl = `https://open.spotify.com/embed/track/${id}`
		this.embedId = id
	}
}

@observer
class SpotifyPlayer extends React.Component {

	constructor(props) {
		super(props)
		this.authToken = props.authToken
		this.store = props.store
		this.initialize()
	}

	async initialize() {
		this.embedData = new EmbedData()
		await window.SpotifyIsReadyJP
		const player = new Spotify.Player({
			name: 'Spotify-Lister',
			getOAuthToken: cb => { cb(this.authToken); }
		})

		// Error handling
		player.addListener('initialization_error', ({ message }) => { console.error(message); });
		player.addListener('authentication_error', ({ message }) => { console.error(message); });
		player.addListener('account_error', ({ message }) => { console.error(message); });
		player.addListener('playback_error', ({ message }) => { console.error(message); });

		// Playback status updates
		player.addListener('player_state_changed', state => { console.log(state); });

		// Ready
		player.addListener('ready', ({ device_id }) => {
			console.log('Ready with Device ID', device_id);
			this.device_id = device_id
		});

		// Not Ready
		player.addListener('not_ready', ({ device_id }) => {
			console.log('Device ID has gone offline', device_id);
		});

		// Connect to the player!
		player.connect();	
		this.player = player
		this.store.spotifyPlayer = this	
	}

	playSpotifyUri(uri) {
		this.embedData.setUri(uri)
		fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.device_id}`, {
			method: 'PUT',
			body: JSON.stringify({ uris: [uri] }),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.authToken}`
			},
		})
	}

	render() {
		return <div className={ S.root }>
			<iframe src={ this.embedData.embedUrl } width="300" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
		</div>
	}
}

export default SpotifyPlayer