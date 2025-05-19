require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const pumpRoutes = require('./routes/pumpRoutes');
const ventilationRoutes = require('./routes/ventilationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/lights', require('./routes/lightRoutes'));
app.use('/api/ventilations', ventilationRoutes);
app.use('/api/doors', require('./routes/doorRoutes'));
app.use('/api', require('./routes/deviceRoutes')); 
app.use('/api/pump', pumpRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
