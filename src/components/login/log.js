import React from 'react'
import {
	validateTelephone, 
	validatePassword
} from './common.js'
import {
	HeaderRow // 标题头
} from '../common.js'
import {InputItem, List, Toast, WhiteSpace, Button} from 'antd-mobile'
import {Link} from 'react-router-dom'
import axios from '../../service/axios'
import {createForm} from 'rc-form'

class NormalLoginForm extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			telephone: '',
			password: '',
			hasTelephoneError: true,
			telephoneErrorMsg: '不能为空',
			hasPasswordError: true,
			passwordErrorMsg: '不能为空'
		}
	}
	handleSubmit = () => {
		let {
			hasTelephoneError,
			hasPasswordError
		} = this.state;
		if (!hasTelephoneError && !hasPasswordError) {
			let {
				telephone,
				password
			} = this.state;
			let params = {
				telephone: telephone.replace(/\s/g, ''),
				password
			}
			axios.post('/log/in', params)
				.then((data) => {
					Toast.success('登录成功', 1, () => {
						window.location.href = '/index.html#/app/person';
					});
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
	onPasswordChange = (password) => { // 处理telephone改变
		validatePassword.call(this, password);
	}
	onPasswordErrorClick = () => {
		if (this.state.hasPasswordError) {
			Toast.fail(this.state.passwordErrorMsg, 1)
		}
	}
	render() {
		return (
			<div className="log">
				<HeaderRow title="登录"></HeaderRow>
				<div className="log-content">
					<List>
						<InputItem
							type="phone"
							placeholder="input your phone"
							error={this.state.hasTelephoneError}
							onErrorClick={this.onTelephoneErrorClick}
							onChange={this.onTelephoneChange}
							value={this.state.telephone}
						>手机号码</InputItem>
						<WhiteSpace></WhiteSpace>
						<InputItem
							type="password"
							placeholder="****"
							error={this.state.hasPasswordError}
							onErrorClick={this.onPasswordErrorClick}
							onChange={this.onPasswordChange}
							value={this.state.password}
						>密码</InputItem>
					</List>
					<div className="link-register__div">
						<Link to="/register" className="link-register">没有账号？立即注册</Link>
					</div>
					<Button type="primary" size="small" onClick={this.handleSubmit}>
						登录
					</Button>
				</div>
			</div>
			
		);
	}
}

const WrappedNormalLoginForm = createForm()(NormalLoginForm);
export default WrappedNormalLoginForm