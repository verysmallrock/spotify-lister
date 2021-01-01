import { action, makeAutoObservable } from 'mobx'

let allFilters = {
	acousticness: { title: 'Acousticness', minSlider: 0, maxSlider: 1, minDefault: 0.2, maxDefault: 1, step: 0.1},
	danceability: { title: 'Danceability', minSlider: 0, maxSlider: 1, minDefault: 0.5, maxDefault: 1, step: 0.1},
	duration_ms: { title: 'Duration (ms)', minSlider: 5000, maxSlider: 0, minDefault: 180000, maxDefault: 6000000},
	energy: { title: 'Energy', minSlider: 0, maxSlider: 1, minDefault: 0.5, maxDefault: 1, step: 0.1},
	instrumentalness: { title: 'Instrumentalness', minSlider: 0, maxSlider: 1, minDefault: 0, maxDefault: 1, step: 0.1},
	liveness: { title: 'Liveness', minSlider: 0, maxSlider: 1, minDefault: 0, maxDefault: 1, step: 0.1},
	loudness: { title: 'Loudness', minSlider: -20, maxSlider: 0, minDefault: -8.5, maxDefault: 0},
	speechiness: { title: 'Speechiness', minSlider: 0, maxSlider: 1, minDefault: 0, maxDefault: 1, step: 0.1},
	tempo: { title: 'Tempo', minSlider: 40, maxSlider: 200, minDefault: 85, maxDefault: 95},
	valence: { title: 'Valence', minSlider: 0, maxSlider: 1, minDefault: 0, maxDefault: 1, step: 0.1},

	// TODO 'key' (need to translate to notes)
	// TODO 'mode' (what is that?)
	// TODO 'popularity' (for seeded search)
	// TODO 'time_signature'
	
}

// Filters show in the UI
let filters = {
	tempo: allFilters.tempo,
	loudness: allFilters.loudness,
	danceability: allFilters.danceability
}

// TODO: 
class SeedSearchStore {
	constructor() {
		
	}
}

export default class FilterStore  {
	enabled = false	

	constructor() {
		this.setupFilters()
		makeAutoObservable(this)
	}

	getFilterInfo(filter) {
		let info = Object.assign({}, filters[filter])
		let camel = filter.charAt(0).toUpperCase() + filter.slice(1)
		info.minProp = `min${camel}`
		info.maxProp = `max${camel}`
		return info
	}

	setupFilters() {
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
		if (!model.features || Object.keys(model.features).length == 0) { return false }

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