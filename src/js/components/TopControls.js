import React from 'react'
import { observer } from 'mobx-react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import UserInfoView from './UserInfoView'
import FilterControls from './FilterControls'
import S from './TopControls.css'

@observer
class TopControls extends React.Component {
	constructor(props) {
		super(props)
		this.store = props.store
	}

	onLoadTracksClicked() {
		this.store.fetchSavedTracksJP()
	}

	onLoadAlbumsClicked() {
		this.store.fetchSavedAlbumsJP()
	}
	
	onLoadDetailsClicked() {
		this.store.fetchTrackFeaturesJP()
	}
	
	onLoadAllDetailsClicked() {
		this.store.fetchAllTrackFeaturesJP()
	}

	onTabChange(e, newTab) {
		let state = this.store.uiState
		let d = Date.now()
		console.log('hey', d);
		state.setSelectedTab(newTab)
		console.log('hey', Date.now() - d);
	}


	get headerClasses() {
		let classes = [ S.root ]
		if (this.store.windowState.scrolledDown) {
			classes.push( S.withShadow )
		}
		return classes.join(' ')
	}

	getProgressString() {
		let str = ''
		if (this.store.tracks.loadedCount > 0)
			str += `Loaded ${this.store.tracks.loadedCount} of ${this.store.tracks.total} saved tracks`
		if (this.store.albums.loadedCount > 0)
			str += `, Loaded ${this.store.albums.loadedCount} of ${this.store.albums.total} albums`
		
		str += `, showing ${this.store.currentTracks.length} tracks`
		return str
	}

	renderTabs() {
		let state = this.store.uiState
		let tabs = []
		for(let tabName of Object.keys(state.tabs)) {
			let tab = state.tabs[tabName]
			let title = tab.title
			if (tabName == 'playlist') {
				title = `${tab.title} (${this.store.playlist.models.length})`
			}
			tabs.push(<Tab key={ `tab_${tabName}` } label={ title } value={ tabName }></Tab>)
		}
		return <Tabs value={ state.selectedTab } indicatorColor="primary"
			onChange={ (e, newTab) => this.onTabChange(e, newTab) }>
			{ tabs }
		</Tabs>
	}
	
	render() {
		return <div className={ this.headerClasses }>
		<div className={ S.row }>
			<div className={ S.left }>
				<h1>Spotify Lister</h1>
				<UserInfoView store={ this.store } />						
			</div>
			<div className={ S.filters }>
				<FilterControls store={ this.store } />
			</div>
		</div>
		<div className={ S.tools }>
			<sp-button onClick={ () => this.onLoadTracksClicked() } variant='primary' >Load Saved Tracks</sp-button>
			<sp-button onClick={ () => this.onLoadAllDetailsClicked() } variant='primary' >Load Trackinfo</sp-button>
			<sp-button onClick={ () => this.onLoadAlbumsClicked() } variant='primary' >Load Albums</sp-button>
			<span>{ this.getProgressString() }</span>
		</div>

		{ this.renderTabs() }
	</div>
	}
}

export default TopControls