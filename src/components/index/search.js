import React from 'react';
import {Icon, InputItem, Button, Toast, List, WhiteSpace} from 'antd-mobile';
import axios from '@/service/axios.js';
import {DataRow} from '@/components/common.js'
import {getCity} from '../../utils/index.js'
import {getCookie} from '@/utils/index.js'
import {
	validateTelephone
} from '../login/common.js'
let io = require('socket.io-client')
let socket = io('http://localhost:3000')

class Search extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			// value: '',
			notFound: false,
			data: {},
			telephone: '',
			hasTelephoneError: true,
			telephoneErrorMsg: '不能为空',
		}
	}
	onChange = (val) => {
		this.setState({
			value: val
		})
	}
	handleLeftIconReturn = () => {
		this.props.history.goBack();
	}
	handleSearch = () => {
		if (!this.state.hasTelephoneError) {
			let params = {
				telephone: this.state.telephone.replace(/\s/g, '')
			}
			axios.post('/person/search', params)
				.then((data) => {
					data.regionStr = getCity(data.region);
					this.setState({
						notFound: true,
						data
					})
				})
				.catch((errMsg) => {
					this.setState({
						notFound: false,
						data: errMsg
					})
				})			
		} else {
			Toast.fail('不能为空', 1)
		}
		
	}
	onTelephoneChange = (telephone) => { // 处理telephone改变
		validateTelephone.call(this, telephone);
	}
	onTelephoneErrorClick = () => {
		if (this.state.hasTelephoneError) {
			Toast.fail(this.state.telephoneErrorMsg, 1)
		}
	}	
	addFriend = () => {
		let params = {
			resUserTelephone: this.state.data.telephone,
			reqUserTelephone: getCookie('telephone')
		}
		socket.emit('emit-user', params)
	}
	render () {
		const data = this.state.data;
		return (
			<div className="search">
				<div className="header">
					<div className="header-left">
						<Icon type="left" onClick={this.handleLeftIconReturn}></Icon>
					</div>
					<span>搜索</span>
				</div>
				<div className="content">
					<div className="header-content">
						<List>
							<InputItem
								type="phone"
								placeholder="请输入手机号"
								error={this.state.hasTelephoneError}
								onErrorClick={this.onTelephoneErrorClick}
								onChange={this.onTelephoneChange}
								value={this.state.telephone}
							>手机号码</InputItem>	
						</List>						
					</div>	
					<div className="header-right">
						<Button onClick={this.handleSearch} type="ghost" size="small">查询</Button>
					</div>					
				</div>
				{this.state.notFound ? (<div className="result">
					<DataRow
						name="昵称 :" 
						value={data.nickname}>
					</DataRow>
					<DataRow 
						name="手机号 :" 
						value={data.telephone}>
					</DataRow>
					<DataRow 
						name="地区 :" 
						value={data.regionStr}>
					</DataRow>
					<DataRow
						name="签名 :" 
						value={data.signature}>
					</DataRow>
					<DataRow 
						name="性别 :" 
						value={data.sex === '1' ? '男' : '女'}>
					</DataRow>
					<div className="person-add">
						<Button type="primary" size="small" inline onClick={this.addFriend}>添加好友</Button>
					</div>	
				</div>) : <div className="result">未查询到结果。。。</div>}
			</div>
		)
	}
}

export default Search