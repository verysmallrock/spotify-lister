import React from 'react'
import { observer } from 'mobx-react'

@observer
class TrackList extends React.Component {
	constructor(props) {
		super(props)
		this.store = props.store
	}

	get tracks() {
		return this.store?.savedTracks ?? []
	}

	renderTracks() {
		let list = []
		for (let info of this.tracks) {
			let track = info.track
			list.push(
				<li key={ track.id }>
					{ (track.album?.name ?? 'track') + `, track number: ${track.track_number}` }
				</li>)
		}
		return list
	}

	render() {
		return <div>
			<ul>
				{ this.renderTracks()}
			</ul>
		</div>
	}
}

export default TrackList