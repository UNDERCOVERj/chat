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
import ImgDetail from './imgDetail.js'
import {getCookie} from '@/utils/index.js'
import {concatDialogueDetail} from '@/store/action.js'
const alert = Modal.alert;
let io = require('socket.io-client')
let socket = io('http://localhost:3000')

class App extends React.Component {
	constructor (props) {
		super(props);
	}
	componentDidMount () {
		let telephone = getCookie('telephone');
		socket.emit('join-room', {telephone});	
		socket.on('message-listen', (data) => { // 发送消息
			this.props.dispatch(concatDialogueDetail([data]));
		})
		socket.on('add-listen', (data) => { // 添加好友
			alert('添加好友', data.nickname + '请求添加好友', [
				{ 
					text: '拒绝',
				},
				{
					text: '接受',
					onPress: () => {
						new Promise((resolve) => {
							let acceptTelephone = getCookie('telephone');
							let requestTelephone = data.telephone;
							Toast.success('添加成功', 1);
							socket.emit('accept', {
								acceptTelephone,
								requestTelephone
							})
							setTimeout(resolve, 1000);
						})				
					}
				}
			])
		})
	}
	handleRedirect (pageUrl) {
		if (this.props.location.pathname !== pageUrl) {
			this.props.history.push(pageUrl)
		}
	}
	handlePlusClick = () => {
		this.props.history.push('/search');
	}
	render () {
		return (
			<div className="app">
				<Route path="/app/person" component={Person}></Route>
				<Route path="/app/friend" component={Friend}></Route>
				<Route path="/app/dialogue" component={Dialogue}></Route>
				<HeaderRow 
					title={this.props.text} 
					isShowLeftIcon={this.props.isShowLeftIcon}
					isShowRightSearchIcon={this.props.isShowRightSearchIcon}
					isShowRightPlusIcon={this.props.isShowRightPlusIcon}
					onHandlePlusClick={this.handlePlusClick}>
				</HeaderRow>
				<FooterRow pageUrl={this.props.pageUrl} onHandleRedirect={(pageUrl) => this.handleRedirect(pageUrl)}></FooterRow>
			</div>
		)
	}
}
const mapStateToProps = state => ({
    pageUrl: state.pageState.pageUrl,
    text: state.pageState.text,
    isShowLeftIcon: state.topBarState.isShowLeftIcon,
    isShowRightSearchIcon: state.topBarState.isShowRightSearchIcon,
    isShowRightPlusIcon: state.topBarState.isShowRightPlusIcon
})

export default connect(mapStateToProps)(App)
