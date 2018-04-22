const fs = require('fs');
const path = require('path')
const formidable = require("formidable");

const crypto = require('crypto');

function createHash (id) { // 根据telephone产生一个hash
	const secret = 'chat';
	return crypto.createHmac('sha256', secret)
                   .update(id)
                   .digest('hex');

}

function getGroupId () {
	let num = '' + Math.floor(Math.random()*10000);
	let max = 4;
	let len = num.length;
	let remain = max - len;
	if (remain) {
		for (let i = 0; i < remain; i++) {
			num = '0' + num
		}
	}
	return num
}

const mongoose = require('mongoose');

let Users = require('./schema/user.js');
let Dialogues = require('./schema/dialogue.js');
let Friends = require('./schema/friend.js');
let GroupDialogues = require('./schema/groupDialogue.js');

const successSchema = {
	bstatus: 0, // 正确
	msg: '',
	data: {}
}

const errorSchema = {
	bstatus: 1, // 参数错误
	msg: '',
	data: {}
}

function deepClone (data) { // 针对successSchema的深拷贝
	if (!data || typeof data === 'function' || typeof data !== 'object') {
		return data
	} else {
		let obj = {};
		for (var key in data) {
			obj[key] = deepClone(data[key]);
		}
		return obj
	}
}

function clone (data, assignObj) {
	let obj = deepClone(data);
	if (assignObj) {
		Object.keys(assignObj).forEach((key) => {
			obj[key] = assignObj[key];
		})
	}
	return obj

}

function endHandler (ctx, next) {
	ctx.status = 200;
	ctx.type = 'text/plain; charset=utf-8';
	ctx.state.data = ctx.state.data || clone(successSchema);
	ctx.body = JSON.stringify(ctx.state.data)
}

async function getPerson (ctx, next, telephone) {
		telephone = telephone || ctx.cookies.get('telephone');
		let person = await Users.findOne({
			telephone
		}).exec();
		return person
}
async function update (ctx, key, value) {
	const telephone = ctx.cookies.get('telephone');
	await Users.findOneAndUpdate({telephone}, {
		$set: {
			[key]: value
		}
	})	
}

async function getFriendList (ctx, next) {
	const telephone = ctx.cookies.get('telephone');
	let list = await Friends.findOne({
		telephone
	}).populate('')
	return list || {}
}

module.exports = (app, router) => {
	router.use(async (ctx, next) => {
		const url = ctx.url;
		if (url !== '/register' && url !== '/log/in') {
			const telephone = ctx.cookies.get('telephone');
			const SESSION_ID = ctx.cookies.get('SESSION_ID');
			const flag = telephone && SESSION_ID === createHash(telephone);
			if (flag) {
				await next()
			} else {
				ctx.state.data = clone(errorSchema, {msg: 'SESSION_ID不一致'});
				endHandler(ctx, next)
			}
		} else {
			await next();
		}
		
	})
	router.post('/register', async (ctx, next) => { // 注册
		const content = ctx.request.body;
		let data = null;
		let person = await Users.findOne({
			telephone: content.telephone
		}).exec();
		if (person) {
			data = clone(errorSchema);		
			data.msg = '手机号已被注册';
		} else {
			content._id = new mongoose.Types.ObjectId(); // poputate
			let item = new Users(content)
			let result = await item.save()

			let friendSelf = new Friends({ // poputate 创建好友列表
				telephone: content.telephone, // poputate
				self: item._id // poputate
			}) // poputate
			await friendSelf.save(); // poputate

			let dialogues = new Dialogues({ // 创建dialogue
				requestUserTelephone: content.telephone
			})
			await dialogues.save();

			data = clone(successSchema);
			data.msg = '注册成功';
			ctx.cookies.set('SESSION_ID', createHash(content.telephone));
			ctx.cookies.set('telephone', content.telephone, {httpOnly: false});
		}
		ctx.state.data = data;
		await next();
	});
	router.post('/log/in', async (ctx, next) => {
		const content = ctx.request.body;
		let data = null;
		let person = await Users.findOne({
			telephone: content.telephone
		}).exec();
		if (person) {
			let details = await Users.findOne({
				telephone: content.telephone,
				password:content.password
			})
			if (details) {
				data = clone(successSchema);
				data.msg = '登录成功';
				ctx.cookies.set('SESSION_ID', createHash(content.telephone)); // 设置登录成功后的session_id
				ctx.cookies.set('telephone', content.telephone, {httpOnly: false}); // 设置登录成功后的账号
			} else {
				data = clone(errorSchema);
				data.msg = '密码错误';
			}
		} else {
			data = clone(errorSchema);
			data.msg = '账号未注册';
		}
		ctx.state.data = data;
		await next();
	})
	router.post('/log/out', async (ctx, next) => {
		ctx.cookies.set('telephone', '', {
			maxAge: 0
		})
		ctx.cookies.set('SESSION_ID', '', {
			maxAge: 0
		})
		// ctx.state.data = clone(successSchema)
		await next();
	})
	router.post('/person', async (ctx, next) => {
		let data = null;
		const telephone = ctx.cookies.get('telephone');
		let person = await getPerson(ctx, next);
		if (person) {
			let {
				telephone,
				region,
				signature,
				nickname,
				sex,
				iconUrl
			} = person;
			data = clone(successSchema);
			data.data = {
				telephone,
				region,
				signature,
				nickname,
				sex,
				iconUrl
			}
			ctx.state.data = data
		}
		await next();
	})
	router.post('/person/update', async (ctx, next) => {
		const content = ctx.request.body;
		let person = await getPerson(ctx, next);
		if (person) {
			Object.keys(content).forEach((key, idx) => {
				update(ctx, key, content[key])
			})
		}
		// ctx.state.data = clone(successSchema)
		await next();
	})
	router.post('/person/search', async (ctx, next) => { // 暂时只支持手机查询
		let data = null;
		const content = ctx.request.body;
		const telephone = content.telephone;
		let person = await getPerson(ctx, next, telephone);
		if (person) {
			data = clone(successSchema)
			data.data = person;
			data.msg = '查询成功';
		} else {
			data = clone(errorSchema)
			data.msg = '未查询到结果'
		}
		ctx.state.data = data;
		await next();
	})
	router.post('/friend/list', async (ctx, next) => {
		let data = clone(successSchema);
		const telephone = ctx.cookies.get('telephone');
		let friend = await Friends.findOne({
			telephone
		}).populate('list.friend').exec();

		let list = friend.list;

		if (list) {
			data.data.list = list;
			data.msg = '返回好友列表成功';
		} else {
			data.data.list = [];
			data.msg = '好友列表为空';
		}
		ctx.state.data = data;
		
		await next();
	})
	router.post('/dialogue/detail', async (ctx, next) => {
		let data = clone(successSchema);
		const requestUserTelephone = ctx.cookies.get('telephone');
		const content = ctx.request.body;

		let dialogue = await Dialogues.findOne({
			"requestUserTelephone": requestUserTelephone,
			"list": {
				$elemMatch: {
					"acceptUserTelephone": content.acceptUserTelephone
				}
			}
		}).exec();

		let list = dialogue.list || [];
		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			if (item.acceptUserTelephone === content.acceptUserTelephone) {

				data.data.list = await Promise.all(item.details.map(async (element) => {
					let person = await Users.findOne({
						telephone: element.telephone
					}).exec();
					if (person) {
						element.iconUrl = person.iconUrl;
						element.nickname = person.nickname;
					}
					return element;
				}))
			}
		}
		ctx.state.data = data;
		await next()
	})
	router.post('/dialogue/list', async (ctx, next) => {
		let data = clone(successSchema);

		let dataList = data.data.list = [];

		const requestUserTelephone = ctx.cookies.get('telephone');

		let dialogues = await Dialogues.findOne({
			"requestUserTelephone": requestUserTelephone
		}).exec()

		let list = dialogues.list || [];

		let groupDialogues = await GroupDialogues.findOne({
			"memberIds": requestUserTelephone
		})

		groupDialogues = groupDialogues || [];

		list = list.concat(groupDialogues);

		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			let details = item.details;

			if (details.length) {

				let user = await Users.findOne({
					telephone: item.acceptUserTelephone || requestUserTelephone // 个人或者群聊
				}).select({
					nickname: 1,
					telephone: 1,
					iconUrl: 1
				}).exec();

				let lastDetail = details[details.length - 1] || {};
				let lastListDetailDate = dataList[dataList.length - 1] 
										&& dataList[dataList.length - 1].date;
				let nicknameArr = [];

				if (item.memberIds) { // 如果是群聊，找出所有nickname并返回
					nicknameArr = await Promise.all(item.memberIds.map(async (id) => {
						let person = await Users.findOne({
							telephone: id
						}).exec();
						return person.nickname
					}))
				}

				let data = {
					date: lastDetail.date,
					message: lastDetail.message,
					nickname: item.groupId ? '群聊: ' + nicknameArr.join(',') : user.nickname,
					telephone: user.telephone,
					memberIds: item.memberIds || [],
					lordId: item.lordId || '',
					iconUrl: user.iconUrl,
					groupId: item.groupId
				};

				if (lastListDetailDate && (new Date(lastListDetailDate).getTime() < new Date(lastDetail.date).getTime())) { // 用此方法排序
					dataList.unshift(data);
				} else {
					dataList.push(data);
				}
				data.msg = "返回数据成功"
			} else {
				data.msg = "数据为空"
			}
		}

		ctx.state.data = data;

		await next();
	})

	router.post('/group/list', async (ctx, next) => {
		let data = clone(successSchema);
		let person = await getPerson(ctx, next);

		data.data.groups = await Promise.all(person.groupsIds.map(async (groupId) => {
			let group = await GroupDialogues.findOne({
				groupId
			}).exec();

			if (group) {
				let nicknameArr = [];

				if (group.memberIds) { // 如果是群聊，找出所有nickname并返回
					nicknameArr = await Promise.all(group.memberIds.map(async (id) => {
						let person = await Users.findOne({
							telephone: id
						}).exec();
						return person.nickname
					}))
				}

				return {
					nickname: '群聊: ' + nicknameArr.join(','),
					groupId,
					memberIds: group.memberIds
				};
			}
		}))

		data.data.groups = data.data.groups.filter((item) => {
			return !!item
		})

		ctx.state.data = data;

		await next();
	})
	router.post('/groupDialogue/detail', async (ctx, next) => {
		let data = clone(successSchema);
		const content = ctx.request.body;
		let groupId = content.groupId || '';
		let groupDialogues = await GroupDialogues.findOne({
			groupId
		}).exec();
		groupDialogues = groupDialogues || {}
		data.data.list = groupDialogues.details || [];
		data.data.list = await Promise.all(data.data.list.map(async (element) => {
			let person = await Users.findOne({
				telephone: element.telephone
			}).exec();
			if (person) {
				element.iconUrl = person.iconUrl;
			}
			return element;
		}))
		ctx.state.data = data;

		await next();
	})

	router.use(endHandler)

}