import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import S from './TrackInfo.css'

@observer
class TrackInfo extends React.Component {
	info = {}

	static get propTypes() {
		return {
			auth: PropTypes.any,
			trackInfo: PropTypes.any,
			columnInfo: PropTypes.any,
			getDataFunc: PropTypes.any,
			index: PropTypes.any,

		}
	}

	constructor(props) {
		super(props)
		this.info = props.trackInfo
		this.columnInfo = props.columnInfo
		this.getDataFunc = props.getDataFunc
		this.index = props.index
	}

	playTrack() {
		window.playSpotifyUri(this.info.attributes.uri)
	}

	renderData() {
		let spans = []
		for(let key of Object.keys(this.columnInfo)) {
			if (key.startsWith('skip_')) { continue }
			spans.push(<span key={ `${key}_${this.index}`} className={ S.truncate }>{ this.info.getValue(key) }</span>)
		}
		spans.push(<sp-button key={ `debug_${this.index}`} onClick={ () => console.log(this.info) } variant='primary'>Log</sp-button>) // eslint-disable-line no-console
		spans.push(<sp-button key={ `play_${this.index}`} onClick={ () => this.playTrack() } variant='primary'>Play</sp-button>)
		return spans
	}

	render() {
		return <React.Fragment>
			{ this.renderData() }
		</React.Fragment>
	}
}

export default TrackInfo