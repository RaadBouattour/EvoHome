// routes/sensorRoutes.js
const express = require('express');
const router = express.Router();
const { receiveSensorData } = require('../controllers/sensorController');

router.post('/data', receiveSensorData);

module.exports = router;