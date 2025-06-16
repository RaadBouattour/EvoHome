const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const { io: ClientIO } = require('socket.io-client');
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const cors = require('cors');


const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

mongoose.connect('mongodb://localhost:27017/notification-service')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use(bodyParser.json());

const piSocket = ClientIO('ws://192.168.6.166:5001', {
  transports: ['websocket'],  
  reconnectionAttempts: 5,      
  timeout: 5000,                
});

piSocket.on('connect', () => {
  console.log('Connected to Raspberry Pi WebSocket');
});

piSocket.on('disconnect', () => {
  console.warn('Disconnected from Raspberry Pi WebSocket');
});

let connectedClients = [];

io.on('connection', (socket) => {
  console.log('Mobile app connected:', socket.id);
  connectedClients.push(socket);

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    connectedClients = connectedClients.filter((s) => s.id !== socket.id);
  });
});

app.post('/api/alert', async (req, res) => {
  const { type, level, message, room } = req.body;
  console.log('Alert received:', message);

  if (level === 'critical') {
    try {
      const payload = {
        type,
        level,
        message,
        room,
        receivedAt: new Date().toISOString(),
      };

      connectedClients.forEach((socket) => {
        socket.emit('alert', payload);
      });

      if (piSocket.connected) {
        piSocket.emit('speak_alert', {
          message,
          room,
          type,
        });
        console.log('Sent alert to Raspberry Pi via WebSocket');
      } else {
        console.warn('Raspberry Pi WebSocket not connected');
      }

      await Notification.create(payload);

      return res.status(200).json({ status: 'Alert sent and saved' });
    } catch (err) {
      console.error('Emit Error:', err.message);
      return res.status(500).json({ error: 'Emit failed' });
    }
  } else {
    return res.status(400).json({ message: 'Alert ignored (not critical)' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ receivedAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

server.listen(4010, () => {
  console.log('Notification server listening on port 4010');
});
