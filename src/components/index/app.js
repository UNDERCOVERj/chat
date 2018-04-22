import React from 'react';
import {
	HeaderRow, // 标题头
	FooterRow
} from '../common.js'
import {connect} from 'react-redux'
import {Route} from 'react-router-dom'
import {Modal, Toast} from 'antd-mobile'
import Person from './person.js'
import Friend from './friend.js'
import Dialogue from './dialogue.js'
import Group from './group.js'
import ImgDetail from './imgDetail.js'
import {getCookie} from '@/utils/index.js'
import {FriendSelect} from '../common.js'
import {setFriendSelectFlag } from '../../store/action.js'
import axios from '@/service/axios.js'
let io = require('socket.io-client')
let socket = io('http://localhost:3000')

const alert = Modal.alert;


class App extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			list: [],
			memberIds: new Set()
		}
	}
	componentWillMount () {
		this.getList()
	}
	handleRedirect (pageUrl) {
		if (this.props.location.pathname !== pageUrl) {
			this.props.history.replace(pageUrl)
		}
	}
	handlePlusClick = () => {
		this.props.history.push('/search');
	}
	getList = () => {
		axios.post('/friend/list', {}, {}, false)
			.then((data) => {
				this.props.dispatch(setFriendSelectFlag(false, data.list, 'SET_FRIEND_LIST'))
			})
	}	
	onCheckboxChange = (telephone, e) => {
		let memberIds = this.state.memberIds;
		if (e.target.checked) { // selected
			memberIds.add(telephone)
			this.setState({
				memberIds
			})
		} else {
			memberIds.delete(telephone)
			this.setState({
				memberIds
			})
		}
	}
	onModalSubmit = () => {
		let requestUserTelephone = getCookie('telephone');
		let params = {
			memberIds: [requestUserTelephone, ...this.state.memberIds]
		}
		socket.emit('groupDialogue-create',params)
	}	
	render () {
		return (
			<div className="app">
				<Route path="/app/person" component={Person}></Route>
				<Route path="/app/group" component={Group}></Route>
				<Route path="/app/friend" component={Friend} data={{a: 1}}></Route>
				<Route path="/app/dialogue" component={Dialogue}></Route>
				<HeaderRow 
					title={this.props.text} 
					isShowLeftIcon={this.props.isShowLeftIcon}
					isShowRightSearchIcon={this.props.isShowRightSearchIcon}
					isShowRightPlusIcon={this.props.isShowRightPlusIcon}
					onHandlePlusClick={this.handlePlusClick}>
				</HeaderRow>
				<FooterRow pageUrl={this.props.pageUrl} onHandleRedirect={(pageUrl) => this.handleRedirect(pageUrl)}></FooterRow>
				<FriendSelect 
		      		onCheckboxChange={this.onCheckboxChange}
		      		onModalSubmit={this.onModalSubmit}
		      		list={this.props.list}>
		      	</FriendSelect>				
			</div>
		)
	}
}
const mapStateToProps = state => ({
    pageUrl: state.pageState.pageUrl,
    text: state.pageState.text,
    isShowLeftIcon: state.topBarState.isShowLeftIcon,
    isShowRightSearchIcon: state.topBarState.isShowRightSearchIcon,
    isShowRightPlusIcon: state.topBarState.isShowRightPlusIcon,
    list: state.friendSelectState.list
})

export default connect(mapStateToProps)(App)
