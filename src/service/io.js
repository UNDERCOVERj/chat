const mongoose = require('mongoose');

let Users = require('./schema/user.js');
let Dialogues = require('./schema/dialogue.js');
let Friends = require('./schema/friend.js');
let GroupDialogues = require('./schema/groupDialogue.js');

async function addMessage (user, messageObj, telephone) {
	let list = user.list
	for (let i = 0; i < list.length; i++) {
		let item = list[i];
		if (item.acceptUserTelephone === telephone) {
			item.details.push(messageObj);
			await user.save();
		}
	}
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

module.exports = (io) => {

	io.set('heartbeat interval', 60000);
	io.set('heartbeat timeout', 5000);

	io.on('connection', (socket) => {
		socket.on('join-room', (data) => {
			socket.join('user-' + data.telephone)
		})
		socket.on('emit-user', async (data) => { // 添加好友
			let {
				reqUserTelephone,
				resUserTelephone
			} = data;
			let requestUser = await Users.findOne({
				"telephone": reqUserTelephone
			}).exec();
			let acceptUser = await Friends.findOne({
				"telephone": resUserTelephone
			}).populate('self').exec();

			socket.to('user-' + data.resUserTelephone).emit('add-listen', requestUser)
		})
		socket.on('accept', async (data) => {

			let {
				acceptTelephone,
				requestTelephone
			} = data;

			let requestUser = await Friends.findOne({
				"telephone": requestTelephone
			}).exec();

			let requestFriendUser = await Users.findOne({
				"telephone": requestTelephone
			})

			let requestDialogueUser = await Dialogues.findOne({
				"requestUserTelephone": requestTelephone
			})

			let acceptUser = await Friends.findOne({
				"telephone": acceptTelephone
			}).exec();

			let acceptFriendUser = await Users.findOne({
				"telephone": acceptTelephone
			})

			let acceptDialogueUser = await Dialogues.findOne({
				"requestUserTelephone": acceptTelephone
			})

			requestUser.list.push({friend: acceptFriendUser._id});
			await requestUser.save();

			acceptUser.list.push({friend: requestFriendUser._id});
			await acceptUser.save();

			requestDialogueUser.list.push({
				acceptUserTelephone: acceptTelephone,
				groups: [
					{
						userTelephone: requestTelephone
					},
					{
						userTelephone: acceptTelephone
					}
				],
				details: []					
			})

			await requestDialogueUser.save();

			acceptDialogueUser.list.push({
				acceptUserTelephone: requestTelephone,
				groups: [
					{
						userTelephone: acceptTelephone
					},
					{
						userTelephone: requestTelephone
					}
				],
				details: []					
			})

			await acceptDialogueUser.save();

		})
		socket.on('emit-user-sended', async (data) => {
			let {
				requestUserTelephone,
				acceptUserTelephone,
				message,
				imgUrl
			} = data;
			let requestParams = {
				"requestUserTelephone": acceptUserTelephone,
				"list": {$elemMatch: {
					"acceptUserTelephone": requestUserTelephone
				}}
			};
			let acceptParams = {
				"requestUserTelephone": requestUserTelephone,
				"list": {
					$elemMatch: {
						"acceptUserTelephone": acceptUserTelephone
					}
				}
			};

			let requestDialogueUser = await Dialogues
											.findOne(acceptParams)
											.select('list')
											.exec();

			let acceptDialogueUser = await Dialogues
											.findOne(requestParams)
											.select('list')
											.exec();
			
			let requestPerson = await Users.findOne({telephone: requestUserTelephone}).exec()
			requestPerson = requestPerson || {};

			let basicParams = {
				telephone: requestUserTelephone,
				message,
				imgUrl,
				date: Date.now(),
				nickname: requestPerson.nickname,
				iconUrl: requestPerson.iconUrl
			}
			let requestMessageParams = Object.assign({}, basicParams, {arrangeFlag: true}) // true 为 自己，false 为 别人

			let acceptMessageParams = Object.assign({}, basicParams, {arrangeFlag: false}) // true 为 自己，false 为 别人

			addMessage(requestDialogueUser, requestMessageParams, acceptUserTelephone);
			addMessage(acceptDialogueUser, acceptMessageParams, requestUserTelephone);

			socket.to('user-' + requestUserTelephone).emit('message-listen', requestMessageParams);
			socket.to('user-' + acceptUserTelephone).emit('message-listen', acceptMessageParams);
		})

		socket.on('groupDialogue-create', async (data) => {
			const memberIds = [...data.memberIds]
			const groupId = getGroupId();
			let item = {
				groupId,
				memberIds,
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
				iconUrl: requestPerson.iconUrl
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