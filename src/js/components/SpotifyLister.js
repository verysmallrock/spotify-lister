import React from 'react'
import PropTypes from 'prop-types'
import S from './SpotifyLister.css'
import SpotifyService from '../models/service/SpotifyService'
import SpotifyStore from '../models/SpotifyStore';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import UserInfoView from './UserInfoView';
import TrackList from './TrackList';

@observer
class SpotifyLister extends React.Component {
	@observable store;
	static get propTypes() {
		return {
			auth: PropTypes.any
		}
	}

	constructor(props) {
		super(props)
		this.service = new SpotifyService(this.auth.access_token, this.auth.refresh_token)
		this.store = new SpotifyStore(this.service)
	}

	get auth() {
		return this.props.auth
	}

	render() {
		
		return (
			<div className={ S.root }>
				<h1>Spotify Lister</h1>
				<UserInfoView store={ this.store } />
				<TrackList store={ this.store } />
			</div>
		)
	}
}

export default SpotifyLister