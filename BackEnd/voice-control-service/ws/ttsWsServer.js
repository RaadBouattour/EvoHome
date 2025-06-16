// ws/ttsWsServer.js
const WebSocket = require('ws');

let connectedClients = [];

function startTtsWsServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('🔌 New WebSocket client connected to /tts');

    connectedClients.push(ws);

    ws.on('close', () => {
      console.log('❌ WebSocket client disconnected');
      connectedClients = connectedClients.filter((client) => client !== ws);
    });

    ws.on('error', (err) => {
      console.error('⚠️ WebSocket error:', err.message);
    });
  });

  // Broadcast helper
  function broadcast(payload) {
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  }

  return { broadcast };
}

module.exports = { startTtsWsServer };
