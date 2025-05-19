const Light = require('../models/Light');
const Door = require('../models/Door');
const Ventilation = require('../models/Ventilation');
const Pump = require('../models/Pump'); // ✅ Don't forget to import Pump

exports.getDevicesGroupedByRoom = async (req, res) => {
  try {
    const [lights, doors, ventilations, pumps] = await Promise.all([
      Light.find().lean(),
      Door.find().lean(),
      Ventilation.find().lean(),
      Pump.find().lean()
    ]);

    const allDevices = [
      ...lights.map(device => ({ ...device, type: 'light' })),
      ...doors.map(device => ({ ...device, type: 'door' })),
      ...ventilations.map(device => ({ ...device, type: 'ventilation' })),
      ...pumps.map(device => ({ ...device, type: 'pump' })),
    ];

    const grouped = {};

    allDevices.forEach(device => {
      const room = device.room?.toLowerCase() || 'unknown';
      if (!grouped[room]) grouped[room] = [];

      grouped[room].push({
        ...device,  // ✅ include all fields (including brightness, intensity, speed, schedule, etc.)
        id: device._id,  // explicitly ensure 'id' is present
        status: device.status ?? device.state  // normalize status field
      });
    });

    res.status(200).json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error grouping devices by room' });
  }
};


const Config = require('../models/Config');

exports.setBoardIP = async (req, res) => {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ error: 'IP address is required' });
  }

  try {
    await Config.findOneAndUpdate(
      { key: 'board_ip' },
      { value: ip },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'IP saved successfully', ip });
  } catch (err) {
    console.error('Error saving IP:', err);
    res.status(500).json({ error: 'Failed to save IP' });
  }
};

exports.getBoardIP = async (req, res) => {
  try {
    const config = await Config.findOne({ key: 'board_ip' });
    if (!config) return res.status(404).json({ error: 'Board IP not found' });

    res.status(200).json({ ip: config.value });
  } catch (err) {
    console.error('Error getting IP:', err);
    res.status(500).json({ error: 'Failed to get IP' });
  }
};
