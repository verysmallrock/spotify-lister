import React from 'react'
import PropTypes from 'prop-types'
import S from './SpotifyLister.css'
import SpotifyService from '../models/service/SpotifyService'
import SpotifyStore from '../models/SpotifyStore';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react'
import UserInfoView from './UserInfoView';
import TrackList from './TrackList';
import SpotifyPlayer from './SpotifyPlayer'

class WindowState {
	scrolledDown = false
	
	constructor() {
		makeAutoObservable(this)
		window.addEventListener('scroll', ()=> {
			this.scrolledDown = window.pageYOffset > 0
		});
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

	render() {
		return (
			<div className={ S.root } >
				<div className={ this.headerClasses }>
						<h1>Spotify Lister</h1>
						<UserInfoView store={ this.store } />
						<SpotifyPlayer store={ this.store } authToken={ this.auth.access_token }/>
				</div>
				<div className={ S.content }>
					<TrackList store={ this.store } />
				</div>
			</div>
		)
	}
}

export default SpotifyLister