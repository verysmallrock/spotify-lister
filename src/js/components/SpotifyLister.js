import React from 'react'
import S from './SpotifyLister.css'

const SpotifyLister = (args) => {
	let auth = args.auth
	return (
		<div className={ S.root }>
			<h1>Spotify Lister</h1>
			<p>{ auth.access_token }</p>
		</div>
	)
}

export default SpotifyLister