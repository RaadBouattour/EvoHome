const mongoose = require('mongoose');

const doorSchema = new mongoose.Schema({
  room: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'closed' },
});

module.exports = mongoose.model('Door', doorSchema);
