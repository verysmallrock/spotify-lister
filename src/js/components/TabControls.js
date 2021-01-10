import React from 'react'
import { observer } from 'mobx-react'
import TextField from '@material-ui/core/TextField'
import S from './TabControls.css'

@observer
class TabControls extends React.Component {
	constructor(props) {
		super(props)
		this.store = props.store
	}

	async onReloadDataClicked() {
		await this.store.resetAllData()
		window.location.reload()
	}

	onAddAllToPlaylistClicked() {
		this.store.playlist.addTracks(this.store.currentTracks)
	}

	onSavePlaylistClicked() {
		this.store.savePlaylistJP()
	}

	onClearPlaylistClicked() {
		this.store.playlist.clear()
	}

	onPlaylistNameChange(e) {
		this.store.playlist.setName(e.target.value)
	}

	onSearchChange(e) {
		this.store.uiState.setSearchText(e.target.value)
	}

	getProgressString() {
		return `showing ${this.store.currentTracks.length} tracks (You have saved ${this.store.tracks.total} tracks and ${this.store.albums.total} albums, playlist loading TBD)`
	}

	render() {
		if (this.store.uiState.selectedTab == 'tracks') {
			return <div className={ S.root }>
				<TextField id='track-search' label='Search' defaultValue={ this.store.uiState.searchText } onChange={ (e) => this.onSearchChange(e) } />
				<sp-button onClick={ () => this.onReloadDataClicked() } variant='primary' >Reload My Data</sp-button>
				{this.store.filter.enabled && <sp-button onClick={ () => this.onAddAllToPlaylistClicked() } variant='primary' >Add All to Playlist</sp-button>}
				<span>{ this.getProgressString() }</span>
			</div>
		} else if (this.store.uiState.selectedTab == 'playlist') { 
			return <div className={ S.root }>
				<TextField id='playlist-name' defaultValue={ this.store.playlist.name } label='Name' onChange={ (e) => this.onPlaylistNameChange(e) } />
				<sp-button onClick={ () => this.onSavePlaylistClicked() } variant='primary' >Save Playlist</sp-button>
				<sp-button onClick={ () => this.onClearPlaylistClicked() } variant='primary' >Clear Playlist</sp-button>
			</div>
		} else if (this.store.uiState.selectedTab == 'similar') { 
			return <div className={ S.root }>
				<sp-button onClick={ () => this.onAddAllToPlaylistClicked() } variant='primary' >Add All to Playlist</sp-button>
				<span>{ "Use the 'Similar' button to find similar tracks" }</span>
			</div>
		}
	}
}

export default TabControls