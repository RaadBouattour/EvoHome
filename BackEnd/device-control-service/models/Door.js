const mongoose = require('mongoose');

const doorSchema = new mongoose.Schema({
  room: { type: String, required: true },
  name: { type: String, default: 'Smart Door' },
  model: { type: String, default: 'Generic Door Lock' }, 
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model('Door', doorSchema);
