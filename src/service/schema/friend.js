const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat'); // 连接blog数据库
const Schema = mongoose.Schema;

const friendSchema = Schema({
	telephone: String,
	self: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	list: [
		{
			friend: {
				type: Schema.Types.ObjectId,
				ref: 'users'
			}
		}
	]
})

module.exports = mongoose.model('friends', friendSchema);