const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const MessageSchema = new Schema({
  ActivityID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  }
},
  {
    timestamps: true
  });

module.exports = mongoose.model('Message', MessageSchema);