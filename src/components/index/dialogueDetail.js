import React from 'react'
import ReactDom from 'react-dom'
import {Icon, InputItem, Button, Toast, Popover} from 'antd-mobile'
import { connect } from 'react-redux'
import {getCookie, getDateStr} from '@/utils/index.js'
import axios from '@/service/axios.js'
import {setDialogueDetail, setFriendSelectFlag} from '@/store/action.js'
import {FriendSelect, FRIEND_ROOM_ID, GROUP_ID} from '../common.js'
const Item = Popover.Item;
let io = require('socket.io-client')
let socket = io('http://localhost:3000')

class DialogueItem extends React.Component {
	constructor (props) {
		super(props)
	}
	componentDidMount () {
		let {
			max,
			idx
		} = this.props;
		if (max === idx) {
			ReactDom.findDOMNode(this).scrollIntoView();
		}
	}
	messageClassName = () => {
		const data = this.props.data;
		return data.arrangeFlag 
					? 'dialogue-item__message dialogue-item__message-right'
					: 'dialogue-item__message dialogue-item__message-left'
	}
	render () {
		const data = this.props.data;
		let date = new Date(data.date);
		let dateStr = getDateStr(date);

		return (
			<div className="dialogue-item">
				<div className="dialog-item__date">
					<span className="dialog-item__date-inner">
						{dateStr}
					</span>
				</div>
				<div className={this.messageClassName()}>
					<div className="dialogue-item__icon">
						{
							data.iconUrl 
								? <img src={data.iconUrl} alt="图片加载失败" className="icon-big-img"/>
								: null	
						}
					</div>
					<div className='dialogue-item__text'>
						<div className="dialogue-item__text-name">{data.nickname}</div>
						<div className="dialogue-item__text-inner">
							{data.message ? data.message : <img src={data.imgUrl} alt="图片加载失败" className="dialogue-item__img"/>}
						</div>
					</div>
				</div>
			</div>
			
		)
	}
}

class DialogueDetail extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			value: '',
			visible: false,
			memberIds: new Set() // friend列表
		}
	}
	componentWillMount () {
		const propsData = this.props.data;
		let params = {};
		let url = '';
		if (propsData.type === FRIEND_ROOM_ID) { // 单聊时
			params = {
				friendRoomId: propsData.friendRoomId
			}
			url = '/dialogue/detail';
			
		} else if (propsData.type === GROUP_ID) { // 群聊时
		    params = {
				groupId: propsData.groupId
			}
			url = '/groupDialogue/detail';
		}
		axios.post(url, params)
				.then((data) => {
					data.list.forEach((item) => {
						item.arrangeFlag = item.telephone === getCookie('telephone') ? true : false
					})
					this.props.dispatch(setDialogueDetail(data.list))
				})		
	}
	componentWillUnmount () {
		this.props.dispatch(setDialogueDetail([]));
		this.props.dispatch(setFriendSelectFlag(false));
	}
	handleLeftIconReturn = () => {
		this.props.history.goBack();
	}
	changeText = (val) => {
		this.setState({
			value: val 
		})
	}
	sendMessage = () => {
		const propsData = this.props.data;
		let params = {
			imgUrl: '',
			message: this.state.value,
			requestUserTelephone: getCookie('telephone')
		};

		if (params.message) {
			if (propsData.type === FRIEND_ROOM_ID) {
				params.friendRoomId = propsData.friendRoomId;
				socket.emit('emit-user-sended', params);
				this.setState({
					value: ''
				})
			} else if (propsData.type === GROUP_ID) {
				params.groupId = propsData.groupId;
				socket.emit('emit-group-sended', params);
				this.setState({
					value: ''
				})
			}
		}
	}
	uploadImg = (e) => {
		const propsData = this.props.data;
		let input = e.target;
		let file = input.files[0];
		if (file.size  > 512000) {
			Toast.fail('图片应小于500k', 1);
		} else {
			let reader = new FileReader();
			reader.onload = () => {
				let imgUrl = reader.result;
				let params = {
					message: "",
					imgUrl,
					requestUserTelephone: getCookie('telephone')
				}

				if (propsData.type === FRIEND_ROOM_ID) {
					params.friendRoomId = propsData.friendRoomId;
					socket.emit('emit-user-sended', params);
				} else if (propsData.type === GROUP_ID) {
					params.groupId = propsData.groupId;
					socket.emit('emit-group-sended', params);			
				}
			}
			reader.readAsDataURL(file)
		}
	}
	showFriendSelect = () => {
		let list = this.props.friendSelectList;
		let memberIds = this.props.data.memberIds;
		list = list.filter((item) => {
			return memberIds.indexOf(item.telephone) === -1
		})
		if (list.length) {
			this.props.dispatch(setFriendSelectFlag(true));
			this.props.dispatch(setFriendSelectFlag(true, list, 'SET_FRIEND_LIST'));
		} else {
			Toast.info('暂无其他好友可邀请', 1)
		}
	}
	handleVisibleChange = (visible) => { // 控制popover的显示
		this.setState({
	      	visible,
	    });
	}
	onSelect = (opt) => { // popover选择的value
		let value = opt.props.value;
		if (value === '2') {
			this.setState({
				visible: false
			}, this.showFriendSelect)
		}
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
		let data = this.props.data
		let params = {
			lordId: data.lordId,
			groupId: data.groupId,
			memberIds: [...this.state.memberIds]
		}
		socket.emit('groupDialogue-add',params)
	}
	render () {
		const data = this.props.data;
		data.memberIds = data.memberIds || [];
		const personNum = data.memberIds.length;
		return (
			<div className="dialogue-detail">
				<div className="content">
					{this.props.list.map((item, idx) => 
						(<DialogueItem
							onChildScrollIntoView={this.childScrollIntoView}
							max={this.props.list.length - 1}
							idx={idx}
							key={idx}
							iconUrl={data.iconUrl}
							data={item}>
						</DialogueItem>))}
				</div>			
				<div className="header">
					<div className="header-left" onClick={this.handleLeftIconReturn}>
						<Icon type="left"></Icon>
					</div>
					<div className="header-content">{data.nickname}</div>
					<div className="header-right">
						{this.props.data.type === GROUP_ID 
							? (<div style={{"display": "flex", "alignItems":"center"}}>
									<span>{'(' + personNum + ')'}</span>
									<Popover mask
										overlayClassName="fortest"
										overlayStyle={{ color: 'currentColor' }}
										visible={this.state.visible}
										overlay={[
											(<Item key="1" value="1">查看群成员</Item>),
											(<Item key="2" value="2">添加成员</Item>),
										]}
										align={{
											overflow: { adjustY: 0, adjustX: 0 },
											offset: [-10, 13],
										}}
										onVisibleChange={this.handleVisibleChange}
										onSelect={this.onSelect}
									>
										<div style={{
											height: '100%',
											padding: '0 15px',
											marginRight: '-15px',
											display: 'flex',
											alignItems: 'center',
										}}
										>
											<Icon type="ellipsis" />
										</div>
									</Popover>								
								</div>)
							: null}
					</div>
				</div>
				<div className="footer">
					<div className="footer-content">
						<InputItem
							placeholder="请输入内容"
							onChange={this.changeText}
							value={this.state.value}
						></InputItem>
					</div>	
					<div className="footer-right">
						<Button type="ghost" inline size="small" onClick={this.sendMessage}>发送</Button>
						<Icon type="plus" onClick={() => this.inputFile.click()}></Icon>
						<input ref={(node) => this.inputFile = node} type="file" filetype="image/*" onChange={this.uploadImg} style={{display:"none"}}/>
					</div>
				</div>
				<FriendSelect 
		      		onCheckboxChange={this.onCheckboxChange}
		      		onModalSubmit={this.onModalSubmit}
		      		list={this.props.friendSelectList}>
		      	</FriendSelect>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	data: state.chatObjectState,
	list: state.dialogueDetailState,
	friendSelectList: state.friendSelectState.list
})

export default connect(mapStateToProps)(DialogueDetail)