import { Table } from  "af-virtual-scroll";
import React from 'react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import AppSettings from '../utils/AppSettings'
import LinearProgress from '@material-ui/core/LinearProgress'
import S from './TrackList.css'

@observer
class TrackList extends React.Component {
	
	columnInfo = {
		'attributes.name': { title: 'Track Name', width: 270 },
		albumName: { title: 'Album Name', width: 270 },
		'attributes.artists.name': { title: 'Artist', width: 180 },
		btn_play: { title: 'Play', width: 80 },
		'attributes.popularity': { title: 'Popularity', width: 85 },
		'features.tempo': { title: 'Tempo', width: 60 },
		'features.danceability': { title: 'Danceability', width: 85 },
		'features.energy': { title: 'Energy', width: 60 },
		'features.valence': { title: 'Valence', width: 60 },
		'features.speechiness': { title: 'Speechiness', width: 80 },
		'features.loudness': { title: 'Loudness', width: 60 },
		
		btn_debug: { title: 'Debug', width: 80 },
		btn_add: { title: 'Playlist', width: 80 },
		btn_similar: { title: 'Similar', width: 80 },
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

	playFrom(index) {
		let tracks = this.tracks.slice(index, index + 20)
		let uris = tracks.map((track) => track.attributes.uri )
		this.store.playUris(uris)
	}

	didClickPlaylistButton(track) {
		if(this.store.playlist.get(track.id) == null) {
			this.store.playlist.addTrack(track)
		} else {
			this.store.playlist.removeTrack(track)
		}
	}

	async didClickSimilarButton(track) {
		this.store.getRecommendationsJP(track)
		this.store.uiState.setSelectedTab('similar')
	}
	
	getPlaylistButtonText(track) {
		if(this.store.playlist.get(track.id) == null) {
			return 'Add'
		} else {
			return 'Remove'
		}
	}

	getPlayButtonText(track) {
		if(this.store.isPlaying(track.attributes.uri)) {
			return 'Playing'
		} else {
			return 'Play'
		}
	}

	renderTracks() {
		let { columnInfo } = this
 
		let columns = []
		for (let key of Object.keys(columnInfo)) {
			if (key == 'btn_debug' && AppSettings.isProd())
				continue
			columns.push({
				dataKey: key,
				label: columnInfo[key].title,
				width: columnInfo[key].width
			})
		}

		let getRowData = (index) => {
			let data = {}
			let track = this.tracks[index]
			for (let key of Object.keys(columnInfo)) {
				if (key == 'btn_debug' && AppSettings.isDev()) {
					data[key] = <sp-button key={ `debug_${this.index}`} onClick={ () => console.log(track) } variant='primary'>Log</sp-button> // eslint-disable-line no-console
				} else if (key == 'btn_play') {
					data[key] = <Observer>{ () => {
						let className = S.playButton
						if (this.store.isPlaying(track.attributes.uri)) {
							className += ' ' + S.playing
						}
						return <sp-button class={ className } key={ `play_${this.index}`} onClick={ () => this.playFrom(index) } variant='primary'>{ this.getPlayButtonText(track) }</sp-button> 
					}}</Observer>
				}
				else if (key == 'attributes.popularity') {
					data[key] = <Observer>{ () => <LinearProgress variant="determinate" value={track.getValue(key)} /> }</Observer>
				}
				else if (key == 'btn_add') {
					data[key] = <Observer>{ () => <sp-button key={ `add_${this.index}`} onClick={ () => this.didClickPlaylistButton(track) } variant='primary'>{ this.getPlaylistButtonText(track) }</sp-button> }</Observer>
				}
				else if (key == 'btn_similar') {
					data[key] = <Observer>{ () => <sp-button key={ `similar_${this.index}`} onClick={ () => this.didClickSimilarButton(track) } variant='primary'>Similar</sp-button> }</Observer>
				}
				else {
					data[key] = <Observer>{ () => track.getValue(key) ?? <span></span> }</Observer>
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