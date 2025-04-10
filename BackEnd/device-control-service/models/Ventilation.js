const mongoose = require('mongoose');
const ventilationScheduleSchema = new mongoose.Schema({
    from: String,
    to: String,
    days: [String],
  }, { _id: false });
  
  const ventilationSchema = new mongoose.Schema({
    room: { type: String, required: true },
    status: { type: Boolean, default: false },
    schedule: ventilationScheduleSchema,
  });
  
  module.exports = mongoose.model('Ventilation', ventilationSchema);