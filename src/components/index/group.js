import React from 'react'
import {List} from 'antd-mobile'
import { connect } from 'react-redux'
import { setPage, setTopBar } from '../../store/action.js'
import axios from '@/service/axios.js'
import { setChatObject } from '@/store/action.js'
let io = require('socket.io-client')
let socket = io('http://localhost:3000')

const Item = List.Item;

class Group extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			groups: []
		}
	}
	componentWillMount () {
		this.props.dispatch(setTopBar(false, true, true));
		this.props.dispatch(setPage('/app/group', '群组列表'));
		axios.post('/group/list')
			.then((data) => {
				this.setState({
					groups: data.groups
				})
			})
	}
	clickGroup (item) {
		this.props.dispatch(setChatObject(item));
		this.props.history.push('/detail');
	}
	render () {
		return (
			<div className="content group">
				<List className="friend-list">
					{this.state.groups.map((item, idx) => (
						<Item
							key={idx}
			        		align="top"
							thumb={item.iconUrl || "https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png"}
							multipleLine
							onClick={() => this.clickGroup(item)}
				        >
				        	{item.nickname}
	        			</Item> 						
					))}
		      	</List>				
			</div>
		)
	}
}

export default connect()(Group)