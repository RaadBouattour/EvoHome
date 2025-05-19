const Door = require('../models/Door');
const axios = require('axios');

exports.toggleDoor = async (req, res) => {
  const { room, status } = req.body;

  try {
    const door = await Door.findOne({ room });
    if (!door) {
      return res.status(404).json({ error: `Door in room '${room}' not found.` });
    }

    try {
      await axios.post(`http://192.168.119.5/door`, { room, status });

      door.status = status;
      await door.save();

      res.json(door);
    } catch (espErr) {
      console.error('ESP32 Door Error:', espErr.message);
      return res.status(500).json({ error: 'Failed to control door device (ESP32).' });
    }

  } catch (err) {
    res.status(500).json({ error: 'Server error while toggling door' });
  }
};
