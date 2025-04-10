const mongoose = require('mongoose');
const scheduleSchema = new mongoose.Schema({
  from: String,
  to: String,
  days: [String],
}, { _id: false });

const lightSchema = new mongoose.Schema({
  room: { type: String, required: true },
  status: { type: Boolean, default: false },
  brightness: { type: Number, default: 100 },
  intensity: { type: Number, default: 100 },
  schedule: scheduleSchema,
});

module.exports = mongoose.model('Light', lightSchema);