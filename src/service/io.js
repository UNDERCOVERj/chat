const mongoose = require('mongoose');

let Users = require('./schema/user.js');
let FriendDialogues = require('./schema/friendDialogue.js');
let GroupDialogues = require('./schema/groupDialogue.js');

const FRIEND_ROOM_ID = 'friendRoomId';
const GROUP_ID = 'groupId';

function getRandomId (max) {
	let num = '' + Math.floor(Math.random()*Math.pow(10, max));
	let len = num.length;
	let remain = max - len;
	if (remain) {
		for (let i = 0; i < remain; i++) {
			num = '0' + num
		}
	}
	return num
}

async function getFriendId (requestUserTelephone = '', friendRoomId = '') {
	let friendDialogue = await FriendDialogues.findOne({
		friendRoomId
	}).exec();

	let memberIds = friendDialogue.memberIds;
	for (let i = 0; i < memberIds.length; i++) {
		if (memberIds[i] !== requestUserTelephone) {
			return memberIds[i]
		}
	}

	return requestUserTelephone
}

module.exports = (io) => {

	io.set('heartbeat interval', 60000);
	io.set('heartbeat timeout', 5000);

	io.on('connection', (socket) => {
		socket.on('join-room', async (data) => {
			socket.join('user-' + data.telephone);
		})
		socket.on('emit-user', async (data) => { // 添加好友
			let {
				reqUserTelephone,
				resUserTelephone
			} = data;

			let user = await Users.findOne({
				telephone: reqUserTelephone
			}).exec();

			let friendIds = user.friendRoomIds.map((item) => {
				return item.friendId;
			})

			if (reqUserTelephone === resUserTelephone) { // 添加好友是自己{
				socket.to('user-' + reqUserTelephone).emit('add-send', {
					msg: '请勿添加自己'
				})				
			} else if (friendIds.indexOf(resUserTelephone) === -1) {

				let friendRoomId = getRandomId(5);

				socket.to('user-' + resUserTelephone).emit('add-listen', {
					nickname: user && user.nickname,
					friendRoomId,
					telephone: reqUserTelephone // 请求添加的人
				})
				socket.to('user-' + reqUserTelephone).emit('add-send', {
					msg: '已发送请求'
				})
			} else {
				socket.to('user-' + reqUserTelephone).emit('add-send', {
					msg: '该联系人已是你的好友'
				})
			}
		})
		socket.on('accept', async (data) => { // 添加后保证添加人和被添加人都进入room

			let reqUserTelephone = data.requestTelephone;
			let resUserTelephone = data.acceptTelephone;
			let friendRoomId = data.friendRoomId;


			let requestUser = await Users.findOne({
				"telephone": reqUserTelephone
			}).exec();

			requestUser.friendRoomIds.push({
				friendRoomId,
				friendId: resUserTelephone
			})

			await requestUser.save();

			let acceptUser = await Users.findOne({
				"telephone": resUserTelephone
			}).exec();

			acceptUser.friendRoomIds.push({
				friendRoomId,
				friendId: reqUserTelephone
			})

			await acceptUser.save();

			let friendRoom = new FriendDialogues({
				friendRoomId,
				memberIds: [reqUserTelephone, resUserTelephone],
				lordId: reqUserTelephone,
				type: FRIEND_ROOM_ID
			})

			await friendRoom.save();

		})
		socket.on('emit-user-sended', async (data) => {
			let {
				requestUserTelephone,
				message,
				imgUrl,
				friendRoomId
			} = data;

			let requestPerson = await Users.findOne({
				telephone: requestUserTelephone
			}).exec();

			requestPerson = requestPerson || {};

			let params = {
				telephone: requestUserTelephone,
				message,
				imgUrl,
				date: Date.now(),
				nickname: requestPerson.nickname,
				iconUrl: requestPerson.iconUrl,
				type: FRIEND_ROOM_ID
			}

			let friendDialogue = await FriendDialogues.findOne({
				friendRoomId
			}).exec();

			if (friendDialogue) {
				friendDialogue.details.push(params);
				await friendDialogue.save();

				friendDialogue.memberIds.forEach((id) => {
					socket.to('user-' + id).emit('message-listen', params); // 会让每个detail页面显示,可以再react中让页面不显示
				})
			}
		})

		socket.on('groupDialogue-create', async (data) => {
			const memberIds = [...data.memberIds]
			const groupId = getRandomId(4);
			let item = {
				groupId,
				memberIds,
				type: GROUP_ID,
				lordId: memberIds[0], // 群主			
			}

			await new GroupDialogues(item).save();

			memberIds.forEach(async (id) => {
				let user = await Users.findOne({telephone: id}).exec();
				if (user) {
					user.groupsIds.push('' + groupId); // 转成字符串
					await user.save();
				}
			})

			memberIds.forEach((id) => {
				socket.to('user-' + id).emit('groupDialogue-create-success', {
					groupId,
					lordId: memberIds[0]
				})
			})
		})
		socket.on('groupDialogue-add', async (data) => {
			let {
				lordId,
				groupId,
				memberIds
			} = data;

			let groupDialogues = await GroupDialogues.findOne({
				groupId
			}).exec();

			if (groupDialogues) {
				groupDialogues.memberIds = groupDialogues.memberIds.concat(memberIds);
				await groupDialogues.save();
			}

			memberIds.forEach(async (id) => {
				let user = await Users.findOne({telephone: id}).exec();
				if (user) {
					user.groupsIds.push('' + groupId); // 转成字符串
					await user.save();
				}
			})

			memberIds.forEach((id) => {
				socket.to('user-' + id).emit('groupDialogue-create-success', {
					groupId,
					lordId
				})
			})						


		})
		socket.on('groupDialogue-join', (data) => { // 进入group room
			socket.join('group-' + data.groupId)
		})
		socket.on('emit-group-sended', async (data) => {
			let {
				requestUserTelephone,
				message,
				imgUrl
			} = data;

			let requestPerson = await Users.findOne({
				telephone: requestUserTelephone
			}).exec();

			let basicParams = {
				groupId: data.groupId,
				telephone: requestUserTelephone,
				message,
				imgUrl,
				date: Date.now(),
				nickname: requestPerson.nickname,
				iconUrl: requestPerson.iconUrl,
				type: GROUP_ID
			}
			let groupDialogue = await GroupDialogues.findOne({
				groupId: data.groupId
			}).exec();

			if (groupDialogue) {
				groupDialogue.details.push(basicParams);
				await groupDialogue.save();
			}

			socket.to('group-' + data.groupId).emit('message-listen', basicParams)

		})
		socket.on('disconnect', () => {
			// console.log(socket.id)
		})
	})
}