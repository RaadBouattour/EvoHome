const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deviceId: { type: String, required: true, unique: true },
  location: String,
  sensors: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Device', DeviceSchema);