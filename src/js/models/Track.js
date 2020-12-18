import { action, makeAutoObservable } from 'mobx';

export default class Track  {
	features = {}
	attributes = {}
	addedAt = ''

	constructor(attributes, addedAt) {
		makeAutoObservable(this)
		this.attributes = attributes
		this.addedAt = addedAt
		this.id = attributes.id	
	}

	@action setFeatures(features) {
		return this.features = features
	}

	get albumName() {
		return this.attributes.album.name
	}

	get trackNumber() {
		return this.attributes.track_number
	}

	getValue(selector) {
		let selectors = selector.split('.')
		let value = this
		for (let prop of selectors) {
			value = value[prop]
		}
		return value
	}
}