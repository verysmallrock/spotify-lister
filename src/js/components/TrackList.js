import '@spectrum-web-components/button/sp-button'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import TrackInfo from './TrackInfo'
import S from './TrackList.css'


@observer
class TrackList extends React.Component {
	
	columnInfo = {
		'attributes.name': { title: 'Track Name', width: 370 },
		albumName: { title: 'Album Name', width: 370 },
		trackNumber: { title: 'Track Number', width: 200 },
		id: { title: 'id', width: 300 },
		'features.tempo': { title: 'Tempo', width: 60 },
		skip_debug: { title: 'Debug', width: 80 },
		skip_play: { title: 'Play', width: 80 },
	}

	static get propTypes() {
		return {
			store: PropTypes.any
		}
	}

	constructor(props) {
		super(props)
		this.store = props.store
	}

	onListClicked() {
		this.store.fetchSavedTracksJP()
	}
	
	onLoadDetailsClicked() {
		this.store.fetchTrackFeaturesJP()
	}

	get tracks() {
		return this.store?.savedTracks ?? []
	}

	renderTracksHeader() {
		let { columnInfo } = this
		let columns = []
		for (let key of Object.keys(columnInfo)) {
			if (key.startsWith('skip_')) { continue }
			columns.push(<span key={ key }>{ columnInfo[key].title }</span>)
		}
		columns.push(<span key='debug'>Debug</span>)
		columns.push(<span key='play'>Play</span>)
		return columns
	}

	renderTracks() {
		let { columnInfo } = this
 
		let columns = []
		for (let key of Object.keys(columnInfo)) {
			columns.push({
				dataKey: key,
				label: columnInfo[key].title
			})
		}

		let getRowData = (index) => {
			let data = {}
		
			for (let key of Object.keys(columnInfo)) {
				data[key] = this.tracks[index].getValue(key)
			}
			return data
		}

		let list = []
		this.tracks.forEach((track, index) => {
			list.push(<TrackInfo key={track.id} 
				index={ index }
				trackInfo={ track } 
				columnInfo={ columnInfo }
				getDataFunc={ getRowData }
			/>)
		})
		return list
	}

	getGridCss() {
		//grid-template-columns: 370px 200px 300px 60px 80px;
		let { columnInfo } = this
		let widths = []
		for (let key of Object.keys(columnInfo)) {
			widths.push(`${columnInfo[key].width}px`)
		}

		return {
			'gridTemplateColumns': widths.join(' ')
		}
	}

	render() {
		return <div>
			<sp-button onClick={ () => this.onListClicked() } variant='primary' >List Saved Tracks</sp-button>
			<sp-button onClick={ () => this.onLoadDetailsClicked() } variant='primary' >Load Trackinfo</sp-button>
			<div className={ S.tracks } style={ this.getGridCss() }>
				{ this.renderTracksHeader() }
				{ this.renderTracks()}
			</div>
		</div>
	}
}

export default TrackList