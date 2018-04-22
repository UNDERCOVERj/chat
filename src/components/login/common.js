import {isTelephoneAvailable, isPasswordAvailable} from '../../utils/index.js'

function setTelephoneErrorState (hasTelephoneError = false, telephoneErrorMsg = '') {
	this.setState({
		hasTelephoneError,
		telephoneErrorMsg
	})
}

function setPasswordErrorState (hasPasswordError = false, passwordErrorMsg = '') {
	this.setState({
		hasPasswordError,
		passwordErrorMsg
	})
}

function setRepasswordErrorState (hasRepasswordError = false, repasswordErrorMsg = '') {
	this.setState({
		hasRepasswordError,
		repasswordErrorMsg
	})
}

function setNicknameErrorState (hasNicknameError = false, nicknameErrorMsg = '') {
	this.setState({
		hasNicknameError,
		nicknameErrorMsg
	})
}

function validateTelephone (telephone) { // 手机输入框校验
	let noSpaceTel = telephone.replace(/\s/g, '');
	if (!isTelephoneAvailable(noSpaceTel)) {
		setTelephoneErrorState.call(this, true, '手机号格式错误');
	} else if (noSpaceTel.length === 0){
		setTelephoneErrorState.call(this, true, '手机号不能为空');
	} else if (noSpaceTel.length === 11 && isTelephoneAvailable(noSpaceTel)){
		setTelephoneErrorState.call(this, false, '手机号格式正确');
	}
	this.setState({
		telephone
	})
}

function validatePassword (password) { // 校验密码
	if (/\s/g.test(password)) {
		setPasswordErrorState.call(this, true, '密码不能有空格');
	}else if (password.length && !isPasswordAvailable(password)) {
		setPasswordErrorState.call(this, true, '密码应为4-8位数字或密码');
	} else if (password.length === 0) {
		setPasswordErrorState.call(this, true, '密码不能为空');
	} else {
		setPasswordErrorState.call(this, false, '密码格式正确');
	}
	this.setState({
		password
	})
}

function validateRepassword (repassword) { // 校验确认密码
	let password = this.state.password;
	if (password !== repassword) {
		setRepasswordErrorState.call(this, true, '密码不一致');
	} else {
		setRepasswordErrorState.call(this, false, '密码一致');
	}
	this.setState({
		repassword
	})	
}

function validateNickname (nickname) {
	if (/\s/g.test(nickname)) {
		setNicknameErrorState.call(this, true, '昵称不能有空格');
	}else if (!nickname) {
		setNicknameErrorState.call(this, true, '昵称不能为空');
	} else {
		setNicknameErrorState.call(this, false, '昵称格式正确');
	}
	this.setState({
		nickname
	})
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
	validateRepassword,
	validateNickname,
	handleTelephoneChange,
	handlePasswordChange,
	handleSubmit,
	handleSexChange,
	handleNicknameChange
}