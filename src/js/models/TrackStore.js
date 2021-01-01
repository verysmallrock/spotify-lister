import { action, makeAutoObservable } from 'mobx'
import { persist } from 'mobx-persist'
import Track from './Track'

export default class TrackStore {
	@persist nextPageLink = 'https://api.spotify.com/v1/me/tracks?limit=50'
	@persist finished = false
	@persist total = 0
	@persist loadedCount = 0

	@persist('list', Track) models = []

	constructor() {
		makeAutoObservable(this)
		this.modelClass = Track
		this.modelAccessor = 'track'
	}

	// === Boilerplate below

	@action updateTotal(total) {
		this.total = total
	}

	@action setNextPageLink(value) {
		this.nextPageLink = value
	}

	@action setFinished(value) {
		this.finished = value
	}

	@action setLoadedCount(value) {
		this.loadedCount = value
	}
	
	@action _addModels(models) {
		let newModels = []
		for (let model of models) {
			if (this.get(model.id) == null)
				newModels.push(model)
		}
		this.models = this.models.concat(newModels)
		this._reindex()
	}

	get(id) {
		return this.models[this.modelMap[id]]
	}

	@action _reindex() {
		this.modelMap = {}
		let index = 0
		for (let model of this.models) {
			this.modelMap[model.id] = index++
		}
	}
}