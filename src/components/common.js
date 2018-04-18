import React from 'react';
import axios from '../service/axios.js'
import {
	validateNickname,
	handleNicknameChange
} from './login/common.js'
import {Button, Modal, Icon} from 'antd-mobile'
const prompt = Modal.prompt;
import {getCity} from '../utils/index.js';
import { connect } from 'react-redux'
import { setChatObject } from '@/store/action.js'

class HeaderRow extends React.Component {
	constructor (props) {
		super(props);
	}
	render () {
		let headerLeft = null;
		let headerRightSearch = null;
		let headerRightPlusPadding = null;
		let headerRightPlus = null;
		if (this.props.isShowLeftIcon) {
			headerLeft = (
				<div className="header-left" onClick={this.props.handleLeftIconReturn}>
					<Icon type="left"></Icon>
				</div>
			)
		}
		if (this.props.isShowRightSearchIcon) {
			headerRightSearch = <Icon type="search"></Icon>
		}

		if (this.props.isShowRightPlusIcon) {
			headerRightPlusPadding = <div style={{width:'.48rem'}} ></div>
			headerRightPlus = <Icon type="plus" size="xs" onClick={this.props.onHandlePlusClick}></Icon>
		}

		return (
				<div className="header">
					{headerLeft}
					<div className="header-content">{this.props.title}</div>
					<div className="header-right">
						{headerRightSearch}
						{headerRightPlusPadding}
						{headerRightPlus}
					</div>
				</div>
			)
	}
}

class FooterRow extends React.Component {
	constructor (props) {
		super(props);
		this.checkIsActive = this.checkIsActive.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick (path) {
		this.props.onHandleRedirect(path)
	}
	checkIsActive (pageUrl) {
		if (pageUrl === this.props.pageUrl) {
			return 'link link-active'
		} else {
			return 'link'
		}
	}
	render () {
		const items = [
			{
				pageUrl: '/app/dialogue',
				text: '对话'
			},
			{
				pageUrl: '/app/friend',
				text: '好友'
			},
			{
				pageUrl: '/app/person',
				text: '个人'
			}
		]
		return (
			<div className="footer">
				{
					items.map((item, idx) => {
						return (
								<div className={this.checkIsActive(item.pageUrl)} onClick={() => this.handleClick(item.pageUrl, item.text)} key={idx}>
									{item.text}
								</div>
							)
					})
				}
			</div>
		)
	}
}

class DataRow extends React.Component {
	constructor (props) {
		super(props)
	}
	render () {
		return (
			<div className="data-row" onClick={this.props.onClick}>
				<span className="data-row__key">{this.props.name}</span>
				<span className="data-row__value">{this.props.value}</span>
				{this.props.isEditable ? <div className="data-row__icon"><Icon type="right"/></div> : null}
			</div>
		)
	}
}

class DetailModal extends React.Component {
	constructor (props) {
		super(props);
	}
	onWrapTouchStart = (e) => {
	    // fix touch to scroll background page on iOS
		if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
			return;
		}
		const pNode = closest(e.target, '.am-modal-content');
		if (!pNode) {
			e.preventDefault();
		}
	}
	handleChatAction = () => {
		this.props.dispatch(setChatObject(this.props.data));
		this.props.history.push('/detail');
	}
	render () {
		const data = this.props.data || {};
		data.regionStr = getCity(data.region);
		return (
			<div className="detail">
				<Modal
					visible={this.props.isShowDetailModal}
					transparent
					maskClosable={true}
					onClose={this.props.onCloseDetailModal}
					title="好友详情"
					footer={[{ text: '发消息', onPress: this.handleChatAction }]}
		        >
					<div>
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
					</div>
		        </Modal>
			</div>
		)
	}
}

module.exports = {
	HeaderRow,
	FooterRow,
	DataRow,
	DetailModal: connect()(DetailModal)
}