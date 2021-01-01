import React from 'react'
import { action, makeAutoObservable } from 'mobx'
import PropTypes from 'prop-types'
import S from './SpotifyLister.css'
import SpotifyService from '../models/service/SpotifyService'
import SpotifyStore from '../models/SpotifyStore'
import { observer } from 'mobx-react'
import TopControls from './TopControls'
import TrackList from './TrackList'
import SpotifyPlayer from 'react-spotify-web-playback'

class WindowState {
	scrolledDown = false
	playerReady = false
	
	constructor() {
		makeAutoObservable(this)
		window.addEventListener('scroll', ()=> {
			this.setScrollValue(window.pageYOffset > 0)
		});
	}

	@action setScrollValue(value) {
		this.scrolledDown = value
	}
}

@observer
class SpotifyLister extends React.Component {

	static get propTypes() {
		return {
			auth: PropTypes.any
		}
	}

	constructor(props) {
		super(props)
		this.service = new SpotifyService(this.auth.access_token, this.auth.refresh_token)
		this.store = new SpotifyStore(this.service)
		
		window.spotifystore = this.store

		this.store.windowState = new WindowState()
		
		this.setupPlayer()
	}

	async setupPlayer() {
		await window.SpotifyIsReadyJP
		this.store.windowState.playerReady = true
	}

	get auth() {
		return this.props.auth
	}

	// https://www.npmjs.com/package/react-spotify-web-playback
	get playerStyles() {
		return {
			activeColor: '#fff',
			bgColor: '#333',
			color: '#fff',
			loaderColor: '#fff',
			sliderColor: '#1cb954',
			trackArtistColor: '#ccc',
			trackNameColor: '#fff',
		}
	}

	render() {
		return (
			<div className={ S.root } >
				<TopControls store={ this.store }/>
				
				<div className={ S.content }>
					<TrackList store={ this.store } />
				</div>
				{this.store.playingUris?.length > 0 && <div className={ S.player }>
					{ this.store.windowState.playerReady && <SpotifyPlayer 
						uris={ this.store.playingUris } 
						token={ this.auth.access_token } 
						autoPlay={ true }
						persistDeviceSelection={ true }
						magnifySliderOnHover={ true }
						styles={ this.playerStyles }/> 
					}
				</div>
			}
			</div>
		)
	}
}

export default SpotifyLister