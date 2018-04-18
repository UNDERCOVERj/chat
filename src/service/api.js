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

const mongoose = require('mongoose');

let Users = require('./schema/user.js');
let Dialogues = require('./schema/dialogue.js');
let Friends = require('./schema/friend.js');

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

function endHandler (ctx, next) {
	ctx.status = 200;
	ctx.type = 'text/plain; charset=utf-8';
	ctx.state.data = ctx.state.data || successSchema;
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
				ctx.state.data = Object.assign({}, errorSchema, {msg: 'SESSION_ID不一致'});
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
			data = Object.assign({}, errorSchema);		
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

			data = Object.assign({}, successSchema);
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
				data = Object.assign({}, successSchema);
				data.msg = '登录成功';
				ctx.cookies.set('SESSION_ID', createHash(content.telephone)); // 设置登录成功后的session_id
				ctx.cookies.set('telephone', content.telephone, {httpOnly: false}); // 设置登录成功后的账号
			} else {
				data = Object.assign({}, errorSchema);
				data.msg = '密码错误';
			}
		} else {
			data = Object.assign({}, errorSchema);
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
		// ctx.state.data = Object.assign({}, successSchema)
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
			data = Object.assign({}, successSchema);
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
		// ctx.state.data = Object.assign({}, successSchema)
		await next();
	})
	router.post('/person/search', async (ctx, next) => { // 暂时只支持手机查询
		let data = null;
		const content = ctx.request.body;
		const telephone = content.telephone;
		let person = await getPerson(ctx, next, telephone);
		if (person) {
			data = Object.assign({}, successSchema)
			data.data = person;
			data.msg = '查询成功';
		} else {
			data = Object.assign({}, errorSchema)
			data.msg = '未查询到结果'
		}
		ctx.state.data = data;
		await next();
	})
	router.post('/friend/list', async (ctx, next) => {
		let data = Object.assign({}, successSchema);
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
		let data = Object.assign({}, successSchema);
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

		let list = dialogue.list;
		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			if (item.acceptUserTelephone === content.acceptUserTelephone) {
				data.data.list = item.details;
				data.data.groups = item.groups;
			}
		}
		ctx.state.data = data;
		await next()
	})
	router.post('/dialogue/list', async (ctx, next) => {
		let data = Object.assign({}, successSchema);

		let dataList = data.data.list = [];

		const requestUserTelephone = ctx.cookies.get('telephone');

		let dialogues = await Dialogues.findOne({
			"requestUserTelephone": requestUserTelephone
		}).sort({"list.date": 1}).exec()

		let list = dialogues.list || []

		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			let details = item.details;

			if (details.length) {

				let user = await Users.findOne({
					telephone: item.acceptUserTelephone
				}).select({
					nickname: 1,
					telephone: 1
				}).exec();

				let lastDetail = details[details.length - 1] || {};
				let lastListDetailDate = dataList[dataList.length - 1] 
										&& dataList[dataList.length - 1].date;

				let data = {
					date: lastDetail.date,
					message: lastDetail.message,
					nickname: user.nickname,
					telephone: user.telephone,
					iconUrl: user.iconUrl
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

	router.use(endHandler)

}