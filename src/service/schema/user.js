const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat'); // 连接blog数据库
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
	telephone: String,
	password: String,
	sex: String, // 男 1 女 2
	iconUrl: String,
	nickname: String,
	signature: String,
	region: [],
	groupsIds: [],
	friendRoomIds: [{friendRoomId: String, friendId: String}]
})

module.exports = mongoose.model('users', userSchema);