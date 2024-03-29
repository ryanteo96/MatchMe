var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ActivitySchema = new Schema({
	host: String,
	host_id: String,
	activityName: String,
	activityDescription: String,
	activityKeywords: Array,
	datentime: Date,
	location: String,
	maxMembers: Number,
	currentMaxMembers: Number,
	requestList: Array,
	memberList: Array,
	distance: Number
});

module.exports = mongoose.model("Activity", ActivitySchema);
