import axios from 'axios'
import {Toast} from 'antd-mobile'
const instance = axios.create({
	baseURL: 'http://localhost:3000',
	timeout: 60000,
	withCredentials: true
});

module.exports = {
	post (path, params = {}, config = {}, isToast = true) {
		return new Promise((resolve, reject) => {
			isToast && Toast.loading('请稍等...', 0);
			instance.post(path, params, config)
				.then((res) => {
					let data = res.data;
					Toast.hide()
					if (data.bstatus === 0) {
						resolve(data.data);
					} else if (data.bstatus === 1) {
						Toast.fail(data.msg, 1)
						reject(data.msg)
					} else if (data.bstatus === 2) {
						Toast.fail(data.msg, 1, () => {
							window.location.href = "/login.html#/log" // 跳转到登录页
						})
					}
				})
				.catch((err) => {
					Toast.hide();
					Toast.fail('系统错误', 1);
					reject(err);
				})
				// .finally(() => {
				// 	setTimeout(Toast.hide, 3000)
				// })
		})
	}
}