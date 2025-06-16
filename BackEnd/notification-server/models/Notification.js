const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: String,
  level: String,
  message: String,
  room: String,
  receivedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
