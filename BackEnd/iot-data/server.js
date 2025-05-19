const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');


const sensorRoutes = require('./routes/sensorRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/sensor', sensorRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection failed:', err.message);
});