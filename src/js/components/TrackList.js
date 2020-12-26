import { Table } from  "af-virtual-scroll";
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import S from './TrackList.css'


@observer
class TrackList extends React.Component {
	
	columnInfo = {
		'attributes.name': { title: 'Track Name', width: 270 },
		albumName: { title: 'Album Name', width: 270 },
		'attributes.artists.name': { title: 'Artist', width: 180 },
		'features.tempo': { title: 'Tempo', width: 60 },
		'features.danceability': { title: 'Danceability', width: 85 },
		'features.energy': { title: 'Energy', width: 60 },
		'features.valence': { title: 'Valence', width: 60 },
		'features.speechiness': { title: 'Speechiness', width: 80 },
		'features.loudness': { title: 'Loudness', width: 60 },
		
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

	get tracks() {
		return this.store?.currentTracks ?? []
	}

	playTrack(track) {
		this.store.playUri(track.attributes.uri)
	}

	renderTracks() {
		let { columnInfo } = this
 
		let columns = []
		for (let key of Object.keys(columnInfo)) {
			columns.push({
				dataKey: key,
				label: columnInfo[key].title,
				width: columnInfo[key].width
			})
		}

		let getRowData = (index) => {
			let data = {}
		
			for (let key of Object.keys(columnInfo)) {
				if (key == 'skip_debug') {
					data[key] = <sp-button key={ `debug_${this.index}`} onClick={ () => console.log( this.tracks[index]) } variant='primary'>Log</sp-button> // eslint-disable-line no-console
				} else if (key == 'skip_play') {
					data[key] = <sp-button key={ `play_${this.index}`} onClick={ () => this.playTrack(this.tracks[index]) } variant='primary'>Play</sp-button>
				}
				else {
					data[key] = this.tracks[index].getValue(key)
				}
			}
			return data
		}

		return <Table
			fixed
			className={ S.tracks } 
			rowsQuantity={ this.tracks.length }
			estimatedRowHeight={ 40 }
			getRowData={ getRowData }
			columns={ columns }
		/>
	}

	render() {
		return this.renderTracks()
	}
}

export default TrackList