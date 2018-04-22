import React from 'react'
import {
	validateTelephone, // 检验是否为手机
	validatePassword, // 检验密码格式
	validateRepassword, // 检验确认密码
	validateNickname, // 检验昵称
} from './common.js'
import {
	HeaderRow // 标题头
} from '../common.js'
import {List, InputItem, Toast, Button} from 'antd-mobile'
import {Link} from 'react-router-dom'
import axios from '../../service/axios.js'
import {createForm} from 'rc-form'

class NormalRegisterForm extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			sex: '1', // 1是男，2是女

			telephone: '',
			hasTelephoneError: true,
			telephoneErrorMsg: '不能为空',

			password: '',
			hasPasswordError: true,
			passwordErrorMsg: '不能为空',

			repassword: '',
			hasRepasswordError: true,
			repasswordErrorMsg: '不能为空',

			nickname: '',
			hasNicknameError: true,
			nicknameErrorMsg: '不能为空'
		}
	}
	handleSubmit = () => {
		let {
			hasTelephoneError,
			hasPasswordError,
			hasRepasswordError,
			hasNicknameError
		} = this.state

		if (!hasTelephoneError 
				&& !hasPasswordError
				&& !hasRepasswordError
				&& !hasNicknameError) {
			let {
				telephone,
				password,
				sex,
				nickname
			} = this.state;
			let params = {
				telephone: telephone.replace(/\s/g, ''),
				password,
				sex,
				nickname
			}
			axios.post('/register', params)
				.then((data) => {
					window.location.href = '/index.html#/app/person'
				})
		} else {
			Toast.fail('请填写正确信息')
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

	onPasswordChange = (password) => { // 处理password改变
		validatePassword.call(this, password);
	}
	onPasswordErrorClick = () => {
		if (this.state.hasPasswordError) {
			Toast.fail(this.state.passwordErrorMsg, 1)
		}
	}

	onRepasswordChange = (repassword) => { // 处理repassword改变
		validateRepassword.call(this, repassword);
	}
	onRepasswordErrorClick = () => {
		if (this.state.hasRepasswordError) {
			Toast.fail(this.state.repasswordErrorMsg, 1)
		}
	}

	onNicknameChange = (nickname) => { // 处理nickname改变
		validateNickname.call(this, nickname);
	}
	onNicknameErrorClick = () => {
		if (this.state.hasNicknameError) {
			Toast.fail(this.state.nicknameErrorMsg, 1)
		}
	}	

	render () {
		return (
			<div className="register">
				<HeaderRow title="注册"></HeaderRow>
				<div className="log-content">
					<List className="login-form">
						<InputItem
							clear
							placeholder="请输入昵称"
							error={this.state.hasNicknameError}
							onErrorClick={this.onNicknameErrorClick}
							onChange={this.onNicknameChange}
							value={this.state.nickname}
						>昵称</InputItem>
						<InputItem
							type="phone"
							placeholder="input your phone"
							error={this.state.hasTelephoneError}
							onErrorClick={this.onTelephoneErrorClick}
							onChange={this.onTelephoneChange}
							value={this.state.telephone}
						>手机号码</InputItem>	
						<InputItem
							type="password"
							placeholder="****"
							error={this.state.hasPasswordError}
							onErrorClick={this.onPasswordErrorClick}
							onChange={this.onPasswordChange}
							value={this.state.password}
						>密码</InputItem>
						<InputItem
							type="password"
							placeholder="****"
							error={this.state.hasRepasswordError}
							onErrorClick={this.onRepasswordErrorClick}
							onChange={this.onRepasswordChange}
							value={this.state.repassword}
						>确认密码</InputItem>						
					</List>
					<div className="link-register__div">
						<Link to="/log" className="link-log">已有账号？立即登录</Link>
					</div>
					<Button type="primary" size="small" onClick={this.handleSubmit}>
						注册
					</Button>
				</div>
			</div>
		)
	}
}

// const WrappedNormalRegisterForm = Form.create()(NormalRegisterForm);
const WrappedNormalRegisterForm = createForm()(NormalRegisterForm);
export default WrappedNormalRegisterForm