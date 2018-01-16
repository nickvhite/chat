var mongoose = require('mongoose');

var PaySchema = mongoose.Schema({
	payid: String,
	usermail: String,
	successpay: {
		type: Boolean,
		default: false
	},
	sendmail: {
        type: Boolean,
        default: false
	},
	registered: {
		type: Boolean,
		default: false
	}
});

var Pay = module.exports = mongoose.model('Pay', PaySchema);