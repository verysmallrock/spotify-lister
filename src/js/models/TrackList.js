import { action, observable, makeAutoObservable } from 'mobx'
import { persist } from 'mobx-persist'
import Track from './Track'

export default class TrackList {
	@persist nextPageLink = ''
	@persist finished = false
	@persist total = 0
	@persist loadedCount = 0

	@persist('list', Track) @observable models = []

	constructor() {
		makeAutoObservable(this)
	}

	fetchInitialPageJP(href, service) {
		this.nextPageLink = href
		this.service = service
		return this.fetchJP()
	}

	hydrationComplete(service) {
		this.service = service
		this._reindex()
	}

	mapData(dataArray, mapFuncName) {
		for (let data of dataArray) {
			let model = this.get(data.id)
			if (model && model[mapFuncName]) {
				model[mapFuncName](data)
			}
		}
	}

	async fetchAllJP() {
		let newModels = []
		while (!this.finished) {
			newModels = newModels.concat(await this.fetchJP(false))
		}
		this._addModels(newModels)
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

	async fetchJP(asObservable = true) {
		if (this.finished) {
			return Promise.resolve()
		}

		let json = await this.service.fetchJP(this.nextPageLink)
		let newModels = this._storeModels(json, asObservable)
		this.loadedCount += newModels.length
		this.updateTotal(json.total)
		if (json.next) {
			this.setNextPageLink(json.next)
		} else {
			this.finished = true
		}
		return newModels
	}

	@action updateTotal(total) {
		this.total = total
	}

	@action setNextPageLink(value) {
		this.nextPageLink = value
	}

	get(id) {
		return this.models[this.modelMap[id]]
	}

	_reindex() {
		this.modelMap = {}
		let index = 0
		for (let model of this.models) {
			this.modelMap[model.id] = index++
		}
	}

	_storeModels(json, asObservable = true) {
		let modelClass = Track
		let newModels = []
		for (let item of json.items) {
			let model = new modelClass(item.track, item.added_at)
			newModels.push(model)
		}
		if (asObservable)
			this._addModels(newModels)
		return newModels
	}
 }