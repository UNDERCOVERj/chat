import React from 'react'
import store from '../../store/index.js'
import { connect } from 'react-redux'
import { setPage, setTopBar } from '../../store/action.js'
import {List, Badge} from 'antd-mobile'
import axios from '@/service/axios.js'
import {getDateStr} from '@/utils/index.js'
import { setChatObject } from '@/store/action.js'
const Item = List.Item;
const Brief = Item.Brief;

class Dialogue extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			list: []
		}
	}
	componentWillMount () { // 进入每个路由前，改变active路由
		this.props.dispatch(setTopBar(false, true, true))
		this.props.dispatch(setPage('/app/dialogue', '对话列表')) // 对话列表
		axios.post('/dialogue/list')
			.then((data) => {
				this.setState({
					list: data.list
				})
			})
	}
	showDetail (item) {
		this.props.dispatch(setChatObject(item));
		this.props.history.push('/detail');
	}
	render () {
		return (
			<div className="dialogue content">
				<List className="dialogue-list">
					{this.state.list.map((item, idx) => (
						<Item
							key={idx}
							extra={getDateStr(new Date(item.date))}
			        		align="top"
							thumb={item.iconUrl || "https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png"}
							multipleLine
							onClick={() => this.showDetail(item)}
				        >
				        	{item.nickname}<Badge text={77} overflowCount={55} /><Brief>{item.message}</Brief>
	        			</Item> 						
					))}
		      	</List>
			</div>				
		)
	}
}

export default connect()(Dialogue) // container