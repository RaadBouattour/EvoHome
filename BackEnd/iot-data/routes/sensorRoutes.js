const express = require('express');
const router = express.Router();
const { receiveSensorData, getSensorDataByDevice } = require('../controllers/sensorController');

router.post('/data', receiveSensorData);
router.get('/data/:deviceId', getSensorDataByDevice);

module.exports = router;
