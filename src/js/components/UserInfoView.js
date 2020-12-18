import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

@observer
class UserInfoView extends React.Component {
	static get propTypes() {
		return {
			store: PropTypes.any
		}
	}

	constructor(props) {
		super(props)
		this.store = props.store
	}

	render() {
		let displayName = this.store?.userInfo?.display_name ?? 'loading...'
		let images = this.store?.userInfo?.images
		let avatarUrl = (images ?? [])[0]?.url

		return <div>
			<p>{"You are: " + displayName }</p>
			<img src={`${avatarUrl}`} />
		</div>
	}
}

export default UserInfoView