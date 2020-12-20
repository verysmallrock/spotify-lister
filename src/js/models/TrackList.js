import { observable, makeAutoObservable } from 'mobx'
import { persist } from 'mobx-persist'
import Track from './Track'

export default class TrackList {
	@persist nextPageLink = ''
	@persist finished = false

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

	async fetchJP() {
		if (this.finished) {
			return Promise.resolve()
		}

		let json = await this.service.fetchJP(this.nextPageLink)
		this._storeModels(json)
		if (json.next) {
			this.nextPageLink = json.next
		} else {
			this.finished = true
		}
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

	_storeModels(json) {
		let modelClass = Track
		for (let item of json.items) {
			let model = new modelClass(item.track, item.added_at)
			if (!this.modelMap[model.id])
				this.models.push(model)
		}
		this._reindex()
	}
 }