const Light = require('../models/Light');
const axios = require('axios');


exports.toggleLight = async (req, res) => {
  const { room, status, brightness, intensity, schedule } = req.body;

  if (!room) {
    return res.status(400).json({ error: "'room' is required." });
  }

  if (typeof status === 'undefined') {
    return res.status(400).json({ error: "'status' is required." });
  }

  try {
    const light = await Light.findOne({ room });
    if (!light) {
      return res.status(404).json({ error: `Light in room '${room}' not found.` });
    }

    if (status === false) {
      if (brightness !== undefined || intensity !== undefined) {
        return res.status(400).json({
          error: "Cannot update brightness or intensity while the light is OFF. Only schedule can be updated."
        });
      }

      try {
        await axios.post(`http://192.168.119.5/led`, { room, status });

        light.status = false;
        if (schedule) light.schedule = schedule;

        await light.save();
        return res.json(light);
      } catch (espErr) {
        console.error('ESP32 Light Error:', espErr.message);
        return res.status(500).json({ error: 'Failed to control light device (Raspberry).' });
      }
    }

    try {
      await axios.post(`http://192.168.119.5/led`, { room, status, brightness, intensity });

      light.status = status;
      if (brightness !== undefined) light.brightness = brightness;
      if (intensity !== undefined) light.intensity = intensity;
      if (schedule) light.schedule = schedule;

      await light.save();
      res.json(light);
    } catch (espErr) {
      console.error('ESP32 Light Error:', espErr.message);
      return res.status(500).json({ error: 'Failed to control light device (Raspberry).' });
    }

  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server error while toggling light' });
  }
};

