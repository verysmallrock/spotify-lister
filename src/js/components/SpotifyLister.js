import React from 'react'
import PropTypes from 'prop-types'
import S from './SpotifyLister.css'
import SpotifyService from '../models/service/SpotifyService'
import SpotifyStore from '../models/SpotifyStore'
import { action, makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import UserInfoView from './UserInfoView'
import TrackList from './TrackList'
import FilterControls from './FilterControls'
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

		this.windowState = new WindowState()
		
		this.setupPlayer()
	}

	async setupPlayer() {
		await window.SpotifyIsReadyJP
		this.windowState.playerReady = true
	}

	onLoadTracksClicked() {
		this.store.fetchSavedTracksJP()
	}

	onLoadAlbumsClicked() {
		this.store.fetchSavedAlbumsJP()
	}
	
	onLoadDetailsClicked() {
		this.store.fetchTrackFeaturesJP()
	}
	
	onLoadAllDetailsClicked() {
		this.store.fetchAllTrackFeaturesJP()
	}

	get auth() {
		return this.props.auth
	}

	get headerClasses() {
		let classes = [ S.topControls ]
		if (this.windowState.scrolledDown) {
			classes.push( S.withShadow )
		}
		return classes.join(' ')
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

	getProgressString() {
		let str = ''
		if (this.store.tracks.loadedCount > 0)
			str += `Loaded ${this.store.tracks.loadedCount} of ${this.store.tracks.total} tracks`
		if (this.store.albums.loadedCount > 0)
			str += `, Loaded ${this.store.albums.loadedCount} of ${this.store.albums.total} albums`
		
		str += `, showing ${this.store.currentTracks.length} tracks`
		return str
	}

	render() {
		return (
			<div className={ S.root } >
				<div className={ this.headerClasses }>
					<div className={ S.row }>
						<div className={ S.left }>
							<h1>Spotify Lister</h1>
							<UserInfoView store={ this.store } />						
						</div>
						<div className={ S.filters }>
							<FilterControls store={ this.store } />
						</div>
					</div>
					<div className={ S.tools }>
						<sp-button onClick={ () => this.onLoadTracksClicked() } variant='primary' >Load Saved Tracks</sp-button>
						<sp-button onClick={ () => this.onLoadAllDetailsClicked() } variant='primary' >Load Trackinfo</sp-button>
						<sp-button onClick={ () => this.onLoadAlbumsClicked() } variant='primary' >Load Albums</sp-button>
					<span>{ this.getProgressString() }</span>
				</div>

				</div>
				
				<div className={ S.content }>
					<TrackList store={ this.store } />
				</div>
				{this.store.playingUris?.length > 0 && <div className={ S.player }>
					{ this.windowState.playerReady && <SpotifyPlayer 
						uris={ this.store.playingUris } 
						token={ this.auth.access_token } 
						autoPlay={ true }
						persistDeviceSelection={ true }
						magnifySliderOnHover={ true }
						styles={ this.playerStyles }/> 
					}
				</div>}
			</div>
		)
	}
}

export default SpotifyLister