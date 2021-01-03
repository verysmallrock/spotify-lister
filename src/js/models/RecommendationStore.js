import { action, makeAutoObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import Track from './Track'

export default class RecommendationStore  {
	// nextPageLink is a getter in this class
	@persist finished = false
	@persist total = 0
	@persist loadedCount = 0

	@persist('list', Track) models = []
	@persist('object') modelMap = {}

	targets = ['tempo', 'danceability', 'loudness']
	targetRanges = {
		tempo: {
			min: 0,
			below: 8,
			above: 8,
			max: 300
		},
		danceability: {
			min: 0,
			below: 0.2,
			above: 0.8,
			max: 1,
		},
		loudness: {
			min: -50,
			below: 2,
			above: 10,
			max: 0,
		}
	}

	constructor() {
		makeAutoObservable(this)
		this.modelClass = Track
		this.itemAccessor = 'tracks'
	}

	setSeedTrack(track) {
		this.seedTrack = track
	}

	reset() {
		this.models = []
	}

	get nextPageLink() {
		let track = this.seedTrack
		let href = `https://api.spotify.com/v1/recommendations`
		href += `?seed_tracks=${track.id}`

		for (let target of this.targets) {
			let trackValue = track.features[target]
			let range = this.targetRanges[target]
			
			if (range.below != null) {
				let min = Math.max(trackValue - range.below, range.min)
				href += `&min_${target}=${min}`
			}
			if (range.above != null) {
				let max = Math.min(trackValue + range.above, range.max)
				href += `&max_${target}=${max}`
			}
		}
		return href
	}

	set nextPageLink(value) {
		// recommendations only have one page
		return null
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