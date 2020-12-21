import { action, makeAutoObservable } from 'mobx'

export default class FilterStore  {
	enabled = false

	filters = {
		tempo: { title: 'Tempo', minSlider: 40, maxSlider: 200, minDefault: 85, maxDefault: 95},
		loudness: { title: 'Loudness', minSlider: -20, maxSlider: 0, minDefault: -8.5, maxDefault: 0},
		danceability: { title: 'Danceability', minSlider: 0, maxSlider: 1, minDefault: 0.5, maxDefault: 1, step: 0.1},
	}

	constructor() {
		this.setupFilters()
		makeAutoObservable(this)
	}

	getFilterInfo(filter) {
		let info = Object.assign({}, this.filters[filter])
		let camel = filter.charAt(0).toUpperCase() + filter.slice(1)
		info.minProp = `min${camel}`
		info.maxProp = `max${camel}`
		return info
	}

	setupFilters() {
		let { filters } = this
		for(let key of Object.keys(filters)) {
			let camel = key.charAt(0).toUpperCase() + key.slice(1)
			this[`min${camel}`] = filters[key].minDefault
			this[`max${camel}`] = filters[key].maxDefault
			this[`minSlider${camel}`] = filters[key].maxSlider
			this[`maxSlider${camel}`] = filters[key].maxSlider
		}
	}

	@action setFilter(key, minMax) {
		let camel = key.charAt(0).toUpperCase() + key.slice(1)
		let minProp = `min${camel}`
		let maxProp = `max${camel}`
		let [min, max] = minMax
		this[minProp] = min
		this[maxProp] = max
	}

	filterFunc(model) {
		if (!this.enabled) { return true }
		if (!model.features) { return false }

		let { filters } = this
		for(let key of Object.keys(filters)) {
			let filter = filters[key]
			let value = model.features[key]
			let camel = key.charAt(0).toUpperCase() + key.slice(1)
			let minProp = `min${camel}`
			let maxProp = `max${camel}`
			if (value < filter.minSlider || value > filter.maxSlider) 
				return false
			if (value < this[minProp] || value > this[maxProp]) 
				return false
		}
	
		return true
	}
}