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
			str += `Loaded ${this.store.tracks.loadedCount} of ${this.store.tracks.total} saved tracks`
		if (this.store.albums.loadedCount > 0)
			str += `, Loaded ${this.store.albums.loadedCount} of ${this.store.albums.total} albums`
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