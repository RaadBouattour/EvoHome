const SensorData = require('../models/SensorData');
const Device = require('../models/Device');

const receiveSensorData = async (req, res) => {
  try {
    // ✅ Log the incoming data
    console.log('📡 Incoming sensor data:', JSON.stringify(req.body, null, 2));

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

    // Check if the sensor data already exists for this device and sensorType
    const existing = await SensorData.findOne({ deviceId, sensorType });

    let result;
    let message;

    if (existing) {
      // Update existing
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
      // Create new
      result = new SensorData({ deviceId, sensorType, data });
      await result.save();
      message = 'New sensor data added successfully';
    }

    res.status(200).json({ message, data: result });

  } catch (error) {
    console.error('❌ Error saving sensor data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { receiveSensorData };
