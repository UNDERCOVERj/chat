import React from 'react'
import ReactDom from 'react-dom'
import {Icon, InputItem, Button} from 'antd-mobile'
import { connect } from 'react-redux'
import {getCookie, getDateStr} from '@/utils/index.js'
import axios from '@/service/axios.js'
import {setDialogueDetail} from '@/store/action.js'
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
					</div>
					<div className='dialogue-item__text'>
						<div className="dialogue-item__text-name">{data.nickname}</div>
						<div className="dialogue-item__text-inner">
							{data.message}
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
			value: ''
		}
	}
	componentWillMount () {
		let params = {
			acceptUserTelephone: this.props.data.telephone
		}
		axios.post('/dialogue/detail', params)
			.then((data) => {
				this.props.dispatch(setDialogueDetail(data.list))
			})
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
		let params = {
			message: this.state.value,
			acceptUserTelephone: this.props.data.telephone,
			requestUserTelephone: getCookie('telephone')
		}
		if (params.message) {
			socket.emit('emit-user-sended', params);
			this.setState({
				value: ''
			})
		}
	}
	render () {
		const data = this.props.data;
		console.log(this.props.list);
		
		return (
			<div className="dialogue-detail">
				<div className="content">
					{this.props.list.map((item, idx) => 
						(<DialogueItem
							onChildScrollIntoView={this.childScrollIntoView}
							max={this.props.list.length - 1}
							idx={idx}
							key={idx}
							data={item}>
						</DialogueItem>))}
				</div>			
				<div className="header">
					<div className="header-left" onClick={this.handleLeftIconReturn}>
						<Icon type="left"></Icon>
					</div>
					<div className="header-content">{data.nickname}</div>
					<div className="header-right">
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
						<Icon type="plus"></Icon>
					</div>						
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	data: state.chatObjectState,
	list: state.dialogueDetailState
})

export default connect(mapStateToProps)(DialogueDetail)