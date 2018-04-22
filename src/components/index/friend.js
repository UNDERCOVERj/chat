import React from 'react'
import store from '../../store/index.js'
import { connect } from 'react-redux'
import { setPage, setTopBar, setFriendSelectFlag} from '../../store/action.js'
import {Button, List} from 'antd-mobile'
import axios from '../../service/axios.js'
import {DetailModal} from '../common.js'

const Item = List.Item;
const Brief = Item.Brief;

class Dialogue extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			list: [],
			detailData: {},
			isShowDetailModal: false
		}
	}
	getList = () => {
		axios.post('/friend/list')
			.then((data) => {
				this.props.dispatch(setFriendSelectFlag(false, data.list, 'SET_FRIEND_LIST'))
			})
	}
	showDetail = (item) => {
		this.setState({
			detailData: item,
			isShowDetailModal: true
		})
	}
	closeDetailModal = () => {
		this.setState({
			isShowDetailModal: false
		})
	}
	componentWillMount () { // 进入每个路由前，改变active路由
		this.props.dispatch(setTopBar(false, true, true));
		this.props.dispatch(setPage('/app/friend', '好友列表'));
		this.getList();
	}
	render () {
		return (
			<div className="friend content">
				<List className="friend-list">
					{this.props.list.map((item, idx) => (
						<Item
							key={idx}
			        		align="top"
							thumb={item.friend.iconUrl || "https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png"}
							multipleLine
							onClick={() => this.showDetail(item.friend)}
				        >
				        	{item.friend.nickname}
	        			</Item> 						
					))}
		      	</List>
		      	<DetailModal 
		      		history={this.props.history}
		      		data={this.state.detailData}
		      		isShowDetailModal={this.state.isShowDetailModal}
		      		onCloseDetailModal={this.closeDetailModal}>
		      	</DetailModal>
			</div>				
		)
	}
}
const mapStateToProps = state => ({
    list: state.friendSelectState.list
})

export default connect(mapStateToProps)(Dialogue) // container