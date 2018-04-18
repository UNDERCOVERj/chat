const mongoose = require('mongoose');

let Users = require('./schema/user.js');
let Dialogues = require('./schema/dialogue.js');
let Friends = require('./schema/friend.js');

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
				message
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
				date: Date.now(),
				nickname: requestPerson.nickname
			}
			let requestMessageParams = Object.assign({}, basicParams, {arrangeFlag: true}) // true 为 自己，false 为 别人

			let acceptMessageParams = Object.assign({}, basicParams, {arrangeFlag: false}) // true 为 自己，false 为 别人

			addMessage(requestDialogueUser, requestMessageParams, acceptUserTelephone);
			addMessage(acceptDialogueUser, acceptMessageParams, requestUserTelephone);

			socket.to('user-' + requestUserTelephone).emit('message-listen', requestMessageParams);
			socket.to('user-' + acceptUserTelephone).emit('message-listen', acceptMessageParams);
		})

		socket.on('disconnect', () => {
			// console.log(socket.id)
		})
	})
}