import React from 'react'
import PropTypes from 'prop-types';
import S from './SpotifyLister.css'
import SpotifyService from '../models/service/SpotifyService'
import SpotifyStore from '../models/SpotifyStore';

export default class SpotifyLister extends React.Component {
	static get propTypes() {
		return {
			auth: PropTypes.any
		}
	}

	componentDidMount() {
		this.service = new SpotifyService(this.auth.access_token)
		this.store = new SpotifyStore(this.service)
	}

	get auth() {
		return this.props.auth
	}

	render() {
		return (
			<div className={ S.root }>
				<h1>Spotify Lister</h1>
				<p>{ this.auth.access_token }</p>
			</div>
		)
	}
}