import React from 'react'
import { observer } from 'mobx-react'
import CircularProgress from '@material-ui/core/CircularProgress'
import S from './AppLoading.css'

@observer
class AppLoading extends React.Component {

	constructor(props) {
		super(props)
		this.store = props.store
	}

	get loadingString() {
		let str = ''
		if (this.store.hasStoredDatabase){
			return 'Loading Spotify data...'
		}
		if (this.store.tracks.loadedCount > 0)
			str += `Loaded ${this.store.tracks.loadedCount} of ${this.store.tracks.total} saved tracks.\n`
		if (this.store.albums.loadedCount > 0)
			str += `Loaded ${this.store.albums.loadedCount} of ${this.store.albums.total} albums.\n`
		if(this.store.currentTracks && this.store.currentTracks[0] && this.store.currentTracks[0].features?.tempo != null) {
			let numFeaturesLoaded = 0
			for (let track of this.store.currentTracks) {
				// assume one feature means we have all of em for the track
				if (track.features.tempo != null)
					++numFeaturesLoaded
			}
			str += `Loaded ${numFeaturesLoaded} of ${this.store.currentTracks.length} track features (this is the last step).\n`
		}
		return str
	}

	render() {
		return <div className={ S.root } >
			<CircularProgress />
			<p>{ this.loadingString }</p>
		</div>
	}
}

export default AppLoading