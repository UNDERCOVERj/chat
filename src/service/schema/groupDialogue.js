const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat'); // 连接blog数据库
const groupDialogueSchema = mongoose.Schema({
	groupId: String,
	groupName: String,
	memberIds: [],
	lordId: String, // 群主
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
module.exports = mongoose.model('groupDialogue', groupDialogueSchema);