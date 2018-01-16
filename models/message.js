var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
	username: String,
	text: String,
	date: String
});

var Message = module.exports = mongoose.model('Message', MessageSchema);