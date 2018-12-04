var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MessageScheme = new Schema({
    Message_ID: Number,
    Message_Name: String,
    Messages: Array,
    Message_Sender: Array,
    Message_Members: Array,
    Message_Time: Array,
    Activity_ID: String,
});

module.exports = mongoose.model("Message", MessageScheme);