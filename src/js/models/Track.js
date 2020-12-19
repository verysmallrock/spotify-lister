import { action, makeAutoObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'

export default class Track  {
	@persist('object') @observable features = {}
	@persist('object') @observable attributes = {}
	@persist @observable addedAt = ''
	@persist @observable id = ''

	constructor(attributes = {}, addedAt = '') {
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