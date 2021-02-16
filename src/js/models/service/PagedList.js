export default class PagedList {
	init(store, service) {
		this.store = store
		this.service = service
	}

	hydrate(store, service) {
		this.init(store, service)
		this.store._reindex()
	}

	mapData(dataArray, mapFuncName) {
		for (let data of dataArray) {
			let model = this.store.get(data.id)
			if (model && model[mapFuncName]) {
				model[mapFuncName](data)
			}
		}
	}

	async fetchAllJP() {
		let newModels = []
		while (!this.store.finished) {
			newModels = newModels.concat(await this.fetchJP(false))
		}
		this.store._addModels(newModels)
	}

	async fetchJP(asObservable = true) {
		if (this.finished) {
			return Promise.resolve()
		}

		let json = await this.service.fetchJP(this.store.nextPageLink)
		let newModels = this._storeModels(json, asObservable)
		this.store.setLoadedCount(this.store.loadedCount + newModels.length)
		this.store.updateTotal(json.total)
		if (json.next) {
			this.store.setNextPageLink(json.next)
		} else {
			this.store.setFinished(true)
		}
		return newModels
	}

	_storeModels(json, asObservable = true) {
		let modelClass = this.store.modelClass
		let newModels = []
		let itemAccessor = this.store.itemAccessor ?? 'items'
		for (let item of json[itemAccessor]) {
			let model
			if (this.store.modelAccessor)
				model = new modelClass(item[this.store.modelAccessor], item.added_at)
			else
				model = new modelClass(item, '')
			newModels.push(model)
		}
		if (asObservable)
			this.store._addModels(newModels)
		return newModels
	}
 }