const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat'); // 连接blog数据库
const groupDialogueSchema = mongoose.Schema({
	groupIds: [],
	friendRoomIds: []
})
module.exports = mongoose.model('token', tokenSchema);