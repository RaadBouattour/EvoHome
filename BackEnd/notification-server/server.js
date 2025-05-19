const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this in production
    methods: ['GET', 'POST']
  }
});

// Replace with your real Raspberry Pi IP
const FLASK_URL = 'http://192.168.1.99:5000/speak';

app.use(bodyParser.json());

// Store connected mobile clients
let connectedClients = [];

io.on('connection', (socket) => {
  console.log('📱 Mobile app connected:', socket.id);
  connectedClients.push(socket);

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
    connectedClients = connectedClients.filter(s => s.id !== socket.id);
  });
});

// Route to receive alerts
app.post('/api/alert', async (req, res) => {
  const { type, level, message, room } = req.body;

  console.log('🚨 Alert received:', message);

  if (level === 'critical') {
    try {
      // 🔊 Send to Raspberry Pi Flask server
      await axios.post(FLASK_URL, { message });

      // 📡 Send via WebSocket to all connected clients
      connectedClients.forEach((socket) => {
        socket.emit('alert', {
          type,
          level,
          message,
          room,
          receivedAt: new Date().toISOString(),
        });
      });

      res.status(200).json({ status: 'Alert forwarded successfully' });
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: 'Failed to forward alert' });
    }
  } else {
    res.status(400).json({ message: 'Alert ignored, not critical' });
  }
});

server.listen(4000, () => {
  console.log('🚀 Notification server listening on port 4000');
});
