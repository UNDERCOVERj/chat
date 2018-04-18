import React from 'react'
import {
	validateTelephone, 
	validatePassword, 
	handleTelephoneChange, 
	handlePasswordChange, 
	handleSubmit
} from './common.js'
import {
	HeaderRow // 标题头
} from '../common.js'
import {Form, Icon, Input, Button, Checkbox} from 'antd'
import {Link} from 'react-router-dom'
import axios from '../../service/axios'
import {message} from 'antd'
const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			telephone: '',
			password: ''
		}
		this.handleSubmit = this.handleSubmit.bind(this); // 处理提交表单
	}
	handleSubmit (e) {
		function callback () {
			let {
				telephone,
				password
			} = this.state;
			let params = {
				telephone,
				password
			}
			axios.post('/log/in', params)
				.then((data) => {
					message.success('登录成功')
					window.location.href = '/index.html#/app/person'
				})
		}
		handleSubmit.call(this, e, callback);
	}
	render() {
		const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;
	    // Only show error after a field is touched.
	    const telephoneError = isFieldTouched('telephone') && getFieldError('telephone');
	    const passwordError = isFieldTouched('password') && getFieldError('password');

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
			<div className="log">
				<HeaderRow title="登录"></HeaderRow>
				<Form onSubmit={this.handleSubmit} className="login-form">
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
					<FormItem>
						<Link to="/register" className="link-register">没有账号？立即注册</Link>
					</FormItem>
					<FormItem className="item-center">
						<Button type="primary" size="large" htmlType="submit" className="login-form-button">
							登录
						</Button>
					</FormItem>
				</Form>				
			</div>
			
		);
	}
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm