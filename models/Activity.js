var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActivitySchema = new Schema({
    host: String,
    host_id: String,
    activityName: String,
    activityDescription: String,
    activityKeywords: Array,
    location: Location,
    maxMembers: Number,
    currentMaxMembers: Number,
    memberList: Array,
});

module.exports = mongoose.model('Activity', ActivitySchema);
