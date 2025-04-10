const Light = require('../models/Light');
const axios = require('axios');

exports.toggleLight = async (req, res) => {
  const { room, status, brightness, intensity, schedule } = req.body;

  try {
    const light = await Light.findOne({ room });
    if (!light) {
      return res.status(404).json({ error: `Light in room '${room}' not found.` });
    }

    // 🔁 Envoyer la commande à l’ESP32 AVANT toute modification
    try {
      await axios.post(`http://esp32-ip/light`, { room, status, brightness, intensity });

      // ✅ Mise à jour locale si ESP32 a bien reçu
      light.status = status;
      if (brightness !== undefined) light.brightness = brightness;
      if (intensity !== undefined) light.intensity = intensity;
      if (schedule) light.schedule = schedule;

      await light.save();

      res.json(light);
    } catch (espErr) {
      console.error('ESP32 Light Error:', espErr.message);
      return res.status(500).json({ error: 'Failed to control light device (ESP32).' });
    }

  } catch (err) {
    res.status(500).json({ error: 'Server error while toggling light' });
  }
};
