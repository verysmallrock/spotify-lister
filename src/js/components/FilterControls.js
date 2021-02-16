import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox';
import S from './FilterControls.css'


@observer
class FilterControls extends React.Component {
	filters = [
		'tempo',
		'loudness',
		'danceability',
		'energy',
		'valence',
		'speechiness',
		'popularity',
	]

	static get propTypes() {
		return {
			store: PropTypes.any
		}
	}

	constructor(props) {
		super(props)
		this.store = props.store
	}

	onChange(prop, newValue) {
		this.store.filter.setFilter(prop, newValue)
	}

	toggleEnabled() {
		this.store.filter.enabled = !this.store.filter.enabled
	}

	resetFilters() {
		for (let filter of this.filters) {
			let info = this.store.filter.getFilterInfo(filter)
			this.store.filter.setFilter(filter, [info.minSlider, info.maxSlider])
		}
	}

	renderSlider(prop) {
		let filter = this.store.filter.getFilterInfo(prop)
		let title = filter.title

		return <div key={ prop } className={ S.slider }>
				<Typography id={ `${prop}-range-slider` } gutterBottom>{ `${title} Range` }</Typography>
				<Slider
					value={ [ this.store.filter[filter.minProp], this.store.filter[filter.maxProp]] }
					min={ filter.minSlider }
					max={ filter.maxSlider }
					step={ filter.step }
					onChange={ (e, newValue) => this.onChange(prop, newValue) }
					valueLabelDisplay="auto"
					aria-labelledby={ `${prop}-range-slider` }
				/>
			</div>
	}

	renderSliders() {
		let render = []
		for (let filter of this.filters) 
			render.push(this.renderSlider(filter))
		return render
	}

	render() {
		return <div className={ S.root }>
			<FormControlLabel
				control={<Checkbox checked={this.store.filter.enabled} onChange={() => this.toggleEnabled() } name="enabled" />}
				label="Filter Results"
			/>
			
			{ this.renderSliders() }
			
			<div className={ S.buttons }>
				<sp-button  onClick={ () => this.resetFilters() } variant='primary' >Reset Filters</sp-button>
			</div>
		</div>
	}
}

export default FilterControls