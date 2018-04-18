import React from 'react';
import {Icon, InputItem, Button, Toast} from 'antd-mobile';
import axios from '@/service/axios.js';
import {DataRow} from '@/components/common.js'
import {getCity} from '../../utils/index.js'
import {getCookie} from '@/utils/index.js'
let io = require('socket.io-client')
let socket = io('http://localhost:3000')

class Search extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			value: '',
			notFound: false,
			data: {}
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
		if (this.state.value) {
			let params = {
				telephone: this.state.value
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
	addFriend = () => {
		let params = {
			resUserTelephone: this.state.data.telephone,
			reqUserTelephone: getCookie('telephone')
		}
		socket.emit('emit-user', params)
		// axios.post('/person/add', params)
		// 	.then(() => {

		// 	})
		// socket.on('')

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
						<InputItem
							placeholder="请输入内容"
							onChange={this.onChange}
							value={this.state.value}
						></InputItem>
					</div>	
					<div className="header-right">
						<Icon type="search" onClick={this.handleSearch}></Icon>
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