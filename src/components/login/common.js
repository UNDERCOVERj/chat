import {isTelephoneAvailable, isPasswordAvailable} from '../../utils/index.js'


function validateTelephone (rule, value, callback) { // 手机输入框校验
	let val = value && value.trim();
	if (val === '') {
		callback(new Error('手机号不能为空'))
	} else if (!isTelephoneAvailable(val)) { // 手机正则
		callback(new Error('手机号格式错误'))
	}
}

function validatePassword (rule, value, callback) { // 校验密码
	let val = value && value.trim();
	if(val === '') {
		callback(new Error('密码不能为空'))
	} else if(!isPasswordAvailable(value)) {
		callback(new Error('密码格式错误'))
	}
}

function validateRePassword (rule, value, callback) { // 校验确认密码
	let val = value && value.trim();
	if (val !== this.state.password) {
		callback(new Error('密码不一致'))
	} else {
		validatePassword(null, val, callback) // 如果密码一致时，校验密码
	}
}

function validateNickname (rule, value, callback) {
	let val = value && value.trim();
	if (!val) {
		callback(new Error('昵称不能为空'));
	}
}

function handleTelephoneChange (e) { // 处理手机号改变
	let value = e.target.value;
	let val = value && value.trim();
	this.setState({
		telephone: val
	}) // 检查是否disable
}
	
function handlePasswordChange (e) {
	let value = e.target.value;
	let val = value && value.trim();
	this.setState({
		password: val
	}) // 检查是否disable
}

function handleSubmit (e, callback) { // 处理提交
	e.preventDefault();
	let flag = true;
	this.props.form.validateFields(function (err, values) {
		console.log(err)
		if (!err) {
			console.log('fail')
			flag = false;
		}
	});
	if (flag) {
		console.log('success')
		// 校验完成...
		callback && callback.call(this);
	}
}

function handleSexChange (e) { // 处理性别改变
	let value = e.target.value;
	this.setState({
		sex: value
	})
}

function handleNicknameChange (e) {
	let value = e.target.value;
	let val = value && value.trim();
	this.setState({
		nickname: val
	})
}

module.exports = {
	validateTelephone,
	validatePassword,
	validateRePassword,
	validateNickname,
	handleTelephoneChange,
	handlePasswordChange,
	handleSubmit,
	handleSexChange,
	handleNicknameChange
}