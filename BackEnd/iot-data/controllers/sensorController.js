const SensorData = require('../models/SensorData');
const Device = require('../models/Device');

const receiveSensorData = async (req, res) => {
  try {
    console.log('Incoming sensor data:', JSON.stringify(req.body, null, 2));

    const rawDeviceId = req.body.deviceId;
    const deviceId = rawDeviceId?.trim();
    const { sensorType, data } = req.body;

    if (!deviceId || !sensorType || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ error: 'Device not registered' });
    }

    const existing = await SensorData.findOne({ deviceId, sensorType });

    let result;
    let message;

    if (existing) {
      result = await SensorData.findOneAndUpdate(
        { deviceId, sensorType },
        {
          $set: {
            data,
            timestamp: new Date()
          }
        },
        { new: true }
      );
      message = 'Sensor data updated successfully';
    } else {
      result = new SensorData({ deviceId, sensorType, data });
      await result.save();
      message = 'New sensor data added successfully';
    }

    res.status(200).json({ message, data: result });

  } catch (error) {
    console.error('Error saving sensor data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getSensorDataByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    const sensorData = await SensorData.find({ deviceId }).sort({ timestamp: -1 });

    if (!sensorData || sensorData.length === 0) {
      return res.status(404).json({ error: 'No data found for this device' });
    }

    res.status(200).json({ data: sensorData });
  } catch (error) {
    console.error('Error fetching sensor data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { receiveSensorData, getSensorDataByDevice };