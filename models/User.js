var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new Schema({
	username: String,
	password: String,
	name: String,
	admin: Boolean,
	status: Number /** 0 > for normal user, < 0 for banned */,
	verified: Boolean,
	needResetPW: Boolean,
	joined: Array,
	requested: Array
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
