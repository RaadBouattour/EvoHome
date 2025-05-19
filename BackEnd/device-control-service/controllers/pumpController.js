const Pump = require('../models/Pump');
const axios = require('axios');

const ESP32_BASE_URL = 'http://192.168.119.5';

exports.controlPump = async (req, res) => {
  const { room, status, speed, schedule } = req.body;

  if (!room) {
    return res.status(400).json({ error: "'room' is required." });
  }

  if (typeof status !== 'boolean') {
    return res.status(400).json({ error: "'status' is required and must be a boolean." });
  }

  try {
    let pump = await Pump.findOne({ room });
    if (!pump) pump = new Pump({ room });

    if (!status && speed !== undefined) {
      return res.status(400).json({ error: "Cannot set speed when pump is OFF" });
    }

    if (speed !== undefined && (speed < 1 || speed > 3)) {
      return res.status(400).json({ error: "Speed must be between 1 and 3" });
    }

    if (schedule && (!schedule.from || !schedule.to)) {
      return res.status(400).json({ error: "Schedule must include 'from' and 'to'" });
    }

    const payload = {
      room,
      action: 'toggle',
      status: status ? 'true' : 'false',
      speed: status ? (speed ?? pump.speed ?? 1) : 0,
    };

    if (schedule) {
      payload.action = 'schedule';
      payload.from = schedule.from;
      payload.to = schedule.to;
    } else if (speed !== undefined) {
      payload.action = 'speed';
      payload.speed = speed;
    }

    try {
      await axios.post(`${ESP32_BASE_URL}/pump`, payload);
    } catch (err) {
      return res.status(500).json({
        error: 'ESP32 pump control failed',
        details: err.message,
      });
    }

    pump.isOn = status;
    if (status && speed !== undefined) pump.speed = speed;
    if (schedule) pump.schedule = schedule;

    await pump.save();
    res.json({ message: 'Pump updated', pump });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
