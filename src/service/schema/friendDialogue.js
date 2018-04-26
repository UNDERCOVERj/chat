const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat'); // 连接blog数据库
const friendDialogueSchema = mongoose.Schema({
	friendRoomId: String,
	memberIds: [],
	lordId: String, // 主动添加的人
	type: String, // friendRoomId 和 groupId
	details: [{
		// arrangeFlag: Boolean, // true 为 自己，false 为 别人
		telephone: String,
		message: String,
		imgUrl: String,
		date: Date,
		nickname: String,
		iconUrl: String
	}]
})
module.exports = mongoose.model('friendDialogue', friendDialogueSchema);