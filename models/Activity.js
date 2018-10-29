var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ActivitySchema = new Schema({
	name: String,
	description: String,
	venue: String,
	createdBy: String,
	datentime: Date,
});

module.exports = mongoose.model("Activity", ActivitySchema);
