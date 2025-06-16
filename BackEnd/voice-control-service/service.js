require('dotenv').config();
const express = require('express');
const http = require('http');
const voiceRoutes = require('./routes/voiceRoutes');
const { startTtsWsServer } = require('./ws/ttsWsServer');

const app = express();
const server = http.createServer(app); // Create HTTP server to attach WS

app.use(express.json());
app.use('/api/voice', voiceRoutes);

// 🧠 Start WebSocket server and expose broadcast function
const { broadcast } = startTtsWsServer(server);
app.locals.broadcastTts = broadcast;

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎙️ Voice control microservice running on port ${PORT}`);
});
