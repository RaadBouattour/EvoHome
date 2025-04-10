const Door = require('../models/Door');
const axios = require('axios');

exports.toggleDoor = async (req, res) => {
  const { room, status } = req.body;

  try {
    const door = await Door.findOne({ room });
    if (!door) {
      return res.status(404).json({ error: `Door in room '${room}' not found.` });
    }

    // 🔁 Envoyer la commande à l’ESP32 AVANT mise à jour DB
    try {
      await axios.post(`http://esp32-ip/door`, { room, status });

      // ✅ Si succès : mettre à jour MongoDB
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
