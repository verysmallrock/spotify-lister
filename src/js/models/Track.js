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

	artistHasText(text) {
		for (let artist of this.attributes.artists) {
			if (artist.name.toLowerCase().includes(text))
				return true
		}

		return false
	}

	hasText(text) {
		let search = text.toLowerCase()
		return this.attributes.name.toLowerCase().includes(search) ||
			this.attributes.album.name.toLowerCase().includes(search) ||
			this.artistHasText(search)
	}

	getValue(selector) {
		let selectors = selector.split('.')
		let value = this
		for (let prop of selectors) {
			if (Array.isArray(value)) {
				value = value.map((v) => v[prop])
				value = value.join(',')
				break
			}
			value = value[prop]
		}

		return value
	}
}