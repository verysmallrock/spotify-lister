import { action, makeAutoObservable } from 'mobx'
import { persist } from 'mobx-persist'
import Album from './Album'

export default class AlbumStore {
	@persist nextPageLink = 'https://api.spotify.com/v1/me/albums?limit=50'
	@persist finished = false
	@persist total = 0
	@persist loadedCount = 0

	@persist('list', Album) models = []

	constructor() {
		makeAutoObservable(this)
		this.modelClass = Album
		this.modelAccessor = 'album'
	}

	setTrackFeatures(dataArray) {
		for (let features of dataArray) {
			let model = this.trackMap[features.id]
			if (model) {
				model.setFeatures(features)
			}
		}
	}

	// === Boilerplate below ===

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
			if (!this.modelMap[model.id])
				newModels.push(model)
		}
		this.models = this.models.concat(newModels)
		this._reindex()
	}

	@action _reindex() {
		this.modelMap = {}
		this.trackMap = {}
		for (let model of this.models) {
			this.modelMap[model.id] = model
			for(let track of model.tracks)
				this.trackMap[track.id] = track
		}
	}
}