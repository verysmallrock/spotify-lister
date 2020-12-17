import React from 'react'
import S from './SpotifyLister.css'

export default class SpotifyLister extends React.Component {
	render() {
		let auth = this.props.auth
		return (
			<div className={ S.root }>
				<h1>Spotify Lister</h1>
				<p>{ auth.access_token }</p>
			</div>
		)
	}
}