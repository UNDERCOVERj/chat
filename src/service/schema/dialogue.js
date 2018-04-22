const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat'); // 连接blog数据库
const dialogueSchema = mongoose.Schema({
	requestUserTelephone: String,
	list: [
		{
			acceptUserTelephone: String,
			groups: [
				{
					userTelephone: String
				}
			],
			details: [{
				arrangeFlag: Boolean, // true 为 自己，false 为 别人
				telephone: String,
				message: String,
				imgUrl: String,
				date: Date,
				nickname: String,
				iconUrl: String
			}]
		}
	]
})
module.exports = mongoose.model('dialogues', dialogueSchema);