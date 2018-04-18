import React from 'react';
import {HeaderRow} from '../common.js'

class ImgDetail extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			isShow: "hidden"
		}
	}
	showImgDetail = () => {
		this.setState({
			isShow: "visible"
		})
	}
	closeImgDetail = () => {
		this.setState({
			isShow: "hidden"
		})
	}
	handleLeftIconReturn = () => {
		this.closeImgDetail();
	}
	render () {
		return (
			<div className="img-detail" style={{"visibility": this.state.isShow}}>
				<div className="content">
						{
							this.props.iconUrl 
								? <img src={this.props.iconUrl} alt="图片加载失败" className="icon-big-img"/>
								: null	
						}				
				</div>
				<HeaderRow isShowLeftIcon={true} title="头像" handleLeftIconReturn={this.handleLeftIconReturn}></HeaderRow>
			</div>
		)
	}
}

export default ImgDetail