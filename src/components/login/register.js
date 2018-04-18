import React from 'react'
import {
	validateTelephone, // 检验是否为手机
	validatePassword, // 检验密码格式
	validateRePassword, // 检验确认密码
	validateNickname, // 检验昵称
	handleTelephoneChange, // 处理手机号改变
	handlePasswordChange, // 处理密码改变
	handleSubmit, // 处理提交
	handleSexChange, // 处理性别改变
	handleNicknameChange
} from './common.js'
import {
	HeaderRow // 标题头
} from '../common.js'
import {Form, Icon, Input, Button, Checkbox, Radio} from 'antd'
import {isTelephoneAvailable, isPasswordAvailable} from '../../utils/index.js'
import {Link} from 'react-router-dom'
import axios from '../../service/axios.js'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class NormalRegisterForm extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			telephone: '',
			password: '',
			sex: '1', // 1是男，2是女
			nickname: ''
		}
		this.handleSubmit = this.handleSubmit.bind(this)
	}
	handleSubmit (e) {
		function callback () {
			let {
				telephone,
				password,
				sex,
				nickname
			} = this.state;
			let params = {
				telephone,
				password,
				sex,
				nickname
			}
			axios.post('/register', params)
				.then((data) => {
					window.location.href = '/index.html#/app/person'
				})
		}
		handleSubmit.call(this, e, callback);
	}	
	render () {
		const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;
		// Only show error after a field is touched.
	    const telephoneError = isFieldTouched('telephone') && getFieldError('telephone');
	    const passwordError = isFieldTouched('password') && getFieldError('password');
	    const rePasswordError = isFieldTouched('rePassword') && getFieldError('rePassword');
	    const nicknameError = isFieldTouched('nickname') && getFieldError('nickname');

	    const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 8 },
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 16 },
			}
		}		
		return (
			<div className="register">
				<HeaderRow title="注册"></HeaderRow>
				<Form  onSubmit={this.handleSubmit} className="login-form">
					<FormItem 
						label="昵称" 
						validateStatus={nicknameError ? 'error' : ''} 
						help={nicknameError || ''}
						{...formItemLayout}> 
							{getFieldDecorator('nickname', {
								rules: [{ required: true, validator: validateNickname}],
							})(
								<Input 
									prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>} 
									placeholder="请输入昵称"
									onChange={handleNicknameChange.bind(this)}/>
							)}
					</FormItem>
					<FormItem 
						label="手机号" 
						validateStatus={telephoneError ? 'error' : ''} 
						help={telephoneError || ''}
						{...formItemLayout}> 
							{getFieldDecorator('telephone', {
								rules: [{ required: true, validator: validateTelephone}],
							})(
								<Input 
									prefix={<Icon type="phone" style={{ color: 'rgba(0,0,0,.25)' }}/>} 
									placeholder="请输入手机号" 
									onChange={handleTelephoneChange.bind(this)}/>
							)}
					</FormItem>	
					<FormItem 
						label="密码" 
						validateStatus={passwordError ? 'error' : ''} 
						help={passwordError || ''} 
						{...formItemLayout}>
							{getFieldDecorator('password', {
								rules: [{ required: true, validator: validatePassword}],
							})(
								<Input
									prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
									type="password" 
									placeholder="请输入4~8位数字加字母"
									onChange={handlePasswordChange.bind(this)}/>
							)}
					</FormItem>
					<FormItem 
						label="确认密码" 
						validateStatus={rePasswordError ? 'error' : ''} 
						help={rePasswordError || ''} 
						{...formItemLayout}>
							{getFieldDecorator('rePassword', {
								rules: [{ required: true, validator: validateRePassword.bind(this)}],
							})(
								<Input
									prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
									type="password" 
									placeholder="请输入4~8位数字加字母"/>
							)}
					</FormItem>				
					<FormItem 
						label="性别" 
						{...formItemLayout}>
						{getFieldDecorator('sex', {
							initialValue: this.state.sex,
							rules: [{required: true}]
						})(
							<RadioGroup name="radioGroup" onChange={handleSexChange.bind(this)}>
								<Radio value="1">男</Radio>
								<Radio value="2">女</Radio>
							</RadioGroup>

						)}
					</FormItem>	
					<FormItem>
						<Link to="/log" className="link-log">已有账号？立即登录</Link>
					</FormItem>									
					<FormItem className="item-center">
						<Button type="primary" size="large" htmlType="submit" className="login-form-button">
							注册
						</Button>
					</FormItem>																			
				</Form>
			</div>
		)
	}
}

const WrappedNormalRegisterForm = Form.create()(NormalRegisterForm);

export default WrappedNormalRegisterForm