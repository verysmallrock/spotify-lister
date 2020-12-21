import { action, observable, makeAutoObservable } from 'mobx'
import { persist } from 'mobx-persist'
import Track from './Track'

export default class TrackList {
	@persist nextPageLink = ''
	@persist finished = false
	@persist total = 0

	@persist('list', Track) @observable models = []
	@observable modelMap = {}

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
			let model = this.modelMap[data.id]
			if (model && model[mapFuncName]) {
				model[mapFuncName](data)
			}
		}
	}

	async fetchAllJP() {
		while (!this.finished) {
			await this.fetchJP(false)
		}
		this._reindex()
	}

	async fetchJP(reindex = true) {
		if (this.finished) {
			return Promise.resolve()
		}

		let json = await this.service.fetchJP(this.nextPageLink)
		this._storeModels(json, reindex)
		this.total = json.total
		if (json.next) {
			this.setNextPageLink(json.next)
		} else {
			this.finished = true
		}
	}

	@action setNextPageLink(value) {
		this.nextPageLink = value
	}

	get(id) {
		return this.modelMap[id]
	}

	_reindex() {
		this.modelMap = {}
		for (let model of this.models) {
			this.modelMap[model.id] = model
		}
	}

	_storeModels(json, reindex = true) {
		let modelClass = Track
		for (let item of json.items) {
			let model = new modelClass(item.track, item.added_at)
			if (!this.modelMap[model.id])
				this.models.push(model)
		}
		if (reindex)
			this._reindex()
	}
 }