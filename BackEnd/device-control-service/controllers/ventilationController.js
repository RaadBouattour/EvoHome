const Ventilation = require('../models/Ventilation');
const axios = require('axios');

const ESP32_URL = 'http://192.168.119.5/ventilation';

exports.controlVentilation = async (req, res) => {
  const { room, status, speed, schedule } = req.body;

  if (!room) {
    return res.status(400).json({ error: "'room' is required." });
  }

  if (typeof status !== 'boolean') {
    return res.status(400).json({ error: "'status' must be a boolean (true or false)." });
  }

  try {
    const ventilation = await Ventilation.findOne({ room }) || new Ventilation({ room });

    if (!status && speed !== undefined) {
      return res.status(400).json({ error: "Cannot set speed when ventilation is OFF" });
    }

    if (speed !== undefined && (speed < 1 || speed > 3)) {
      return res.status(400).json({ error: "Speed must be between 1 and 3" });
    }

    if (schedule) {
      const { from, to, days } = schedule;
      if (!from || !to || !Array.isArray(days)) {
        return res.status(400).json({ error: "Invalid schedule format: must include 'from', 'to', and 'days' as an array" });
      }
    }


    const payload = {
      room,
      status,
      speed: status ? (speed ?? ventilation.speed ?? 1) : 0,
    };

    if (schedule) payload.schedule = schedule;

    try {
      await axios.post(ESP32_URL, payload);
    } catch (espErr) {
      console.error("ESP32 Ventilation Error:", espErr.message);
      return res.status(500).json({ error: "Failed to control ventilation device (ESP32)." });
    }

    ventilation.status = status;
    if (status && speed !== undefined) {
      ventilation.speed = speed;
    }
    if (schedule) {
      ventilation.schedule = schedule;
    }

    await ventilation.save();

    return res.status(200).json({ message: "Ventilation updated", ventilation });

  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: "Server error while toggling ventilation" });
  }
};
