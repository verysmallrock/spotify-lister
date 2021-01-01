import { action, makeAutoObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import Track from './Track'

export default class Album  {
	@persist('object') @observable attributes = {}
	@persist('list', Track) tracks = []
	@persist @observable addedAt = ''
	@persist @observable id = ''

	trackMap = {}

	constructor(attributes = {}, addedAt = '') {
		makeAutoObservable(this)
		this.attributes = attributes
		this.addedAt = addedAt
		this.id = attributes.id	

		if (attributes.tracks) {
			for (let data of attributes.tracks.items) {
				let albumInfo = Object.assign({}, attributes)
				delete albumInfo.tracks // avoid circular reference
				data.album = albumInfo
				this.tracks.push(new Track(data, addedAt))
			}
		}

		for (let track of this.tracks)
			this.trackMap[track.id] = track
	}

	setTrackFeatures(features) {
		for (let track of this.tracks) {
			if (track.id == features.id) {
				
			}
		}
	}
}