const Ventilation = require('../models/Ventilation');
const axios = require('axios');

exports.toggleVentilation = async (req, res) => {
  const { room, status, schedule } = req.body;

  try {
    const ventilation = await Ventilation.findOne({ room });
    if (!ventilation) {
      return res.status(404).json({ error: `Ventilation in room '${room}' not found.` });
    }

    // 🔁 Envoyer la commande à l’ESP32 d’abord
    try {
      await axios.post(`http://esp32-ip/ventilation`, { room, status });

      // ✅ Mise à jour si succès
      ventilation.status = status;
      if (schedule) ventilation.schedule = schedule;
      await ventilation.save();

      res.json(ventilation);
    } catch (espErr) {
      console.error('ESP32 Ventilation Error:', espErr.message);
      return res.status(500).json({ error: 'Failed to control ventilation device (ESP32).' });
    }

  } catch (err) {
    res.status(500).json({ error: 'Server error while toggling ventilation' });
  }
};
