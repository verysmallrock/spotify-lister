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

	renderSlider(prop) {
		let filter = this.store.filter.getFilterInfo(prop)
		let title = filter.title

		return <div className={ S.slider }>
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

	render() {
		return <div className={ S.root }>
			<FormControlLabel
				control={<Checkbox checked={this.store.filter.enabled} onChange={() => this.toggleEnabled() } name="enabled" />}
				label="Filter Results"
			/>
			{ this.renderSlider('tempo') }
			{ this.renderSlider('loudness') }
			{ this.renderSlider('danceability') }
			{ this.renderSlider('energy') }
			{ this.renderSlider('valence') }
			{ this.renderSlider('speechiness') }
			
			
		</div>
	}
}

export default FilterControls