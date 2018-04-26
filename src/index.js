import React from 'react'
import ReactDOM from 'react-dom'
import {HashRouter, BrowserRouter, Route, Switch} from 'react-router-dom'
import App from './components/index/app.js'
import Search from './components/index/search.js'
import DialogueDetail from './components/index/dialogueDetail.js'
import { Provider } from 'react-redux'
import store from './store/index.js'
import './static/css/index/index.css'
import {Toast, Modal} from 'antd-mobile'
import {getCookie} from '@/utils/index.js'
import {concatDialogueDetail, setFriendSelectFlag} from '@/store/action.js'
import axios from '@/service/axios.js'
const alert = Modal.alert;

let socket = store.getState().generalSocket.socket;
let telephone = getCookie('telephone');

let friendId = ''; // 保证只触发一次

socket.emit('join-room', {telephone});
socket.on('message-listen', (data) => { // 发送消息
	data.arrangeFlag = data.telephone === telephone ? true : false;
	let chatObjectState = store.getState().chatObjectState;
	if (data.type === chatObjectState.type) {
		store.dispatch(concatDialogueDetail([data]));
	}
})
socket.on('add-listen', (data) => { // 添加好友
	if (friendId !== data.telephone) {
		friendId = data.telephone;
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
							requestTelephone,
							friendRoomId: data.friendRoomId
						})
						setTimeout(resolve, 1000);
					})				
				}
			}
		])
	}
})
socket.on('groupDialogue-create-success', (data) => {
	if (data.lordId === telephone) {
		Toast.success('邀请成功', 1)
		store.dispatch(setFriendSelectFlag(false));
	}
	socket.emit('groupDialogue-join', data) // 创建时，单个join
})

socket.on('add-send', (data) => {
	Toast.info(data.masg, 1); // 当点击添加好友后
})

socket.on('add-send', (data) => {
	Toast.info(data.msg, 1); // 当点击添加好友后
})

axios.post('/group/list', {}, {}, false)
	.then((data) => {
		data.groups.forEach((group) => {
			socket.emit('groupDialogue-join', group) // 进入app时所有群组join
		})
	})

ReactDOM.render(
	<HashRouter>
		<Provider store={store}>
			<Switch>
				<Route path="/app" component={App}></Route>
				<Route path="/search" component={Search}></Route>
				<Route path="/detail" component={DialogueDetail}></Route>
			</Switch>		
		</Provider>
	</HashRouter>
	, document.querySelector('#app')
)
if (module.hot) {
	module.hot.accept();
}