import React from 'react'
import SpotifyLister from './SpotifyLister'
import SigninView from './SigninView'
import './ApplicationFrame.css'


import getHashParams from '../utils/hashParams'
let hashParams = getHashParams()

let access_token = hashParams.access_token,
	error = hashParams.error

export default class ApplicationFrame extends React.Component {
	render() {
		return error ? `ERROR: ${error}` : (access_token ? <SpotifyLister auth={ hashParams } /> : <SigninView />)
	}
}