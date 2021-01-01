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

	onTabChange(e, newTab) {
		let state = this.store.uiState
		let d = Date.now()
		state.setSelectedTab(newTab)
	}


	get headerClasses() {
		let classes = [ S.root ]
		if (this.store.windowState.scrolledDown) {
			classes.push( S.withShadow )
		}
		return classes.join(' ')
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

		{ this.renderTabs() }
	</div>
	}
}

export default TopControls