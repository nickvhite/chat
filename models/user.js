var mongoose = require('mongoose'),
	uniqueValidator = require('mongoose-unique-validator'),
	bcrypt = require('bcryptjs');

mongoose.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('connected to db');
	}
});

var db = mongoose.connection.openUri('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb');

//User schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

UserSchema.plugin(uniqueValidator);

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
};

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	    	newUser.password = hash;
	    	newUser.save(callback);
	    });
	});
}