const mongoose = require('mongoose');

const pumpSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: 'Water Pump'
  },
  model: {
    type: String,
    default: 'Grundfos 3300'
  },
  status: {
    type: Boolean,
    default: false
  },
  speed: {
    type: Number,
    min: 1,
    max: 3
  },
  schedule: {
    from: { type: String },
    to: { type: String }
  },
}, { timestamps: true });

module.exports = mongoose.model('Pump', pumpSchema);
