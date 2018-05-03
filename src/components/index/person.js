import React from 'react'
import store from '../../store/index.js'
import { connect } from 'react-redux'
import { setPage, setTopBar } from '../../store/action.js'
import {Modal, Toast, List, Button, Radio, Picker} from 'antd-mobile'
import axios from '../../service/axios.js'
import {DataRow} from '../common.js'
import {getCity} from '../../utils/index.js'
import ImgDetail from './imgDetail.js'

const region = require('../../utils/region.json');
const prompt = Modal.prompt;
const alert = Modal.alert;
const operation = Modal.operation;
const RadioItem = Radio.RadioItem;

class Person extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			data: {
				telephone: '',
				region: '',
				signature: '',
				nickname: '',
				sex: 1,
				isShowSex: false
			},
			sexValue: 1,
			visible: false,
			regionStr: '',
			region: '',
			modal: null // icon modal
		}
	}
	init = (showSuccess) => {
		this.props.dispatch(setTopBar(false, false, false))
		this.props.dispatch(setPage('/app/person', '个人中心')) // text为title
		axios.post('/person')
			.then((data) => {
				if (showSuccess) {
					Toast.success('更新成功', 1)
				}
				this.setState({
					data
				}, () => {
					let city = getCity(data.region);

					this.setState({
						sexValue: data.sex // 保证最初sex一样
					})

					this.setState({
						regionStr: city
					})
				})
			})
	}
	componentWillMount () { // 进入每个路由前，改变active路由
		this.init()
	}
	handlePrompt = (key, text) => {
		prompt(
			'修改' + text, 
			null,
			[
				{
					text: '取消',
					onPress: value => new Promise((resolve) => {
						resolve();
					}),
				},
				{
					text: '修改',
					onPress: value => new Promise((resolve, reject) => {
						let val = value && value.trim();
						const params = {
							[key]: val
						}
						if (!val) {
							Toast.fail(text + '不能为空', 1)
						} else {
							resolve(params)
						}
					}).then((params) => {
						axios.post('/person/update', params)
							.then(() => {
								this.init(true);
							})	
					}),
				},
			], 
			'default', 
			this.state.data[key], 
			['请输入' + text]
		)		
	}
	handleNicknameClick = () => {
		this.handlePrompt.call(this, 'nickname', '昵称')
	}
	handleSignatureClick = () => {
		this.handlePrompt.call(this, 'signature', '签名')
	}
	changeSexModalVisibility = (flag) => {
		const data = Object.assign({}, this.state.data);
		data.isShowSex = flag;
		this.setState({
			data
		})
	}
	handleSexChange = (value) => {
		this.setState({
			sexValue: value
		})
	}
	changeSex = () => {
		const params = {
			sex: this.state.sexValue
		}
		axios.post('/person/update', params)
			.then(() => {
				this.init(true);
			})
	}
	handleRegionChange = (region) => {
		const params = {
			region: region
		}
		axios.post('/person/update', params)
			.then(() => {
				this.init(true);
			})
	}
	logOut = () => {
		axios.post('/log/out')
			.then(() => {
				window.location.href = '/login.html#/log';
			})
	}
	uploadImg = (e) => {
		let input = e.target;
		let file = input.files[0];
		let reader = new FileReader();
		reader.onload = () => {
			let iconUrl = reader.result;
			let form = new FormData();
			form.append('avator', file);
			axios.post('/avator/upload', form, {headers: {"Content-Type": "multipart/form-data"}})
				.then(() => {
					Toast.success('修改成功', 1, () => {
						this.setState((prevState) => {
							let state = prevState;
							state.data.iconUrl = iconUrl;
							return state
						})
					})
				})
		}
		reader.readAsDataURL(file)
		this.state.modal.close();
	}
	clickIcon = () => {
		let modal = operation([
			{ text: '查看大图', onPress: this.observeImg },
			{
				text: '修改头像', 
				onPress: () => this.inputFile.click()
			}
        ])
        this.setState({
        	modal
        })
	}
	observeImg = () => {
		this.refs.imgDetail.showImgDetail();
	}
	render () {
		let data = this.state.data;
		let value = data.sex;
		const sexData = [
			{
				label: '男',
				value: '1'
			},
			{
				label: '女',
				value: '2'
			}
		]
		return (
			<div className="person content">
				<ImgDetail iconUrl={data.iconUrl} ref="imgDetail"></ImgDetail>
				<div className="icon">
					<div className="icon-block" onClick={this.clickIcon}>
						{
							data.iconUrl 
								? <img src={data.iconUrl} alt="图片加载失败" className="icon-block-img"/>
								: null
						}
						<input ref={(node) => this.inputFile = node} type="file" filetype="image/*" onChange={this.uploadImg} style={{display:"none"}}/>
					</div>
				</div>
				<DataRow
					isEditable={true}
					name="昵称 :" 
					value={data.nickname} 
					onClick={this.handleNicknameClick}>
				</DataRow>
				<DataRow 
					isEditable={false} 
					name="手机号 :" 
					value={data.telephone}>
				</DataRow>
				<DataRow 
					isEditable={true} 
					name="地区 :" 
					value={this.state.regionStr} 
					onClick={() => this.setState({visible: true})}>
				</DataRow>
				<DataRow 
					isEditable={true} 
					name="签名 :" 
					value={data.signature}
					onClick={this.handleSignatureClick}>
				</DataRow>
				<DataRow 
					isEditable={true} 
					name="性别 :" 
					value={data.sex === '1' ? '男' : '女'}
					onClick={() => this.changeSexModalVisibility(true)}>
				</DataRow>
				<Modal
		          popup
		          visible={data.isShowSex}
		          animationType="slide-up"
		          onClose={() => this.changeSexModalVisibility(false)}
		        >
		        	<List renderHeader={() => <div>修改性别</div>} className="popup-list">
			            {sexData.map(i => (
				            <RadioItem 
				          	    key={i.value} 
				          	    checked={this.state.sexValue === i.value} 
				          	    onChange={() => this.handleSexChange(i.value)}>
				                {i.label}
				            </RadioItem>
				        ))}
			            <List.Item>
			                <Button type="primary" onClick={this.changeSex}>修改</Button>
			            </List.Item>
		            </List>
		        </Modal>
				<Picker
					visible={this.state.visible}
					data={region}
					value={this.state.data.region}
					onChange={(region) => this.handleRegionChange(region)}
					onOk={() => {this.setState({ visible: false })}}
					onDismiss={() => this.setState({ visible: false })}
				>
				</Picker>
				<div className="log-out">
					<Button type="primary" size="small" inline onClick={this.logOut}>注销</Button>
				</div>
			</div>		
		)
	}
}

export default connect()(Person) // container