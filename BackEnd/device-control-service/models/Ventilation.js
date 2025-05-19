const mongoose = require('mongoose');

const ventilationScheduleSchema = new mongoose.Schema({
  from: String,
  to: String,
  days: [String],
}, { _id: false });

const ventilationSchema = new mongoose.Schema({
  room: { type: String, required: true },
  name: { type: String, default: 'Ventilation Unit' },
  model: { type: String, default: 'Dyson Airflow Pro' },
  status: { type: Boolean, default: false },
  speed: {
    type: Number,
    min: 1,
    max: 3,
    default: 1
  },
  schedule: ventilationScheduleSchema,
});

module.exports = mongoose.model('Ventilation', ventilationSchema);
