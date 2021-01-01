import { action, makeAutoObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import Track from './Track'

export default class PlaylistStore {
	@persist name = 'spotify lister playlist'
	@persist nextPageLink = 'https://api.spotify.com/v1/me/tracks?limit=50'
	@persist finished = false
	@persist total = 0
	@persist loadedCount = 0

	@persist('list', Track) models = []
	@persist('object') modelMap = {}

	constructor() {
		makeAutoObservable(this)
		this.modelClass = Track
		this.modelAccessor = 'track'
	}

	hydrate() {
		this._reindex()
	}

	@action setName(name) {
		this.name = name
	}

	@action addTrack(track) {
		this._addModels([track])
	}

	@action addTracks(tracks) {
		this._addModels(tracks)
	}

	@action removeTrack(track) {
		if (this.get(track.id) != null) {
			this.models.splice(this.modelMap[track.id], 1)
		}
		this._reindex()
	}

	@action clear() {
		this.models = []
		this.total = 0
		this.loadedCount = 0
		this._reindex()
	}

	/// === Boilerplate below ===

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