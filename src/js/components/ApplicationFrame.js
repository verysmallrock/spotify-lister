import React from 'react'
import SpotifyLister from './SpotifyLister'
import S from './ApplicationFrame.css'

const ApplicationFrame = (args) => {
	let params = args.params
	return (
		<div className={ S.root }>
			<SpotifyLister auth={ params } />	
		</div>
	)
}

export default ApplicationFrame