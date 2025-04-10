const sttService = require('../services/sttService');
const commandService = require('../services/commandService');
const path = require('path');

exports.handleVoiceCommand = async (req, res) => {
  try {
    // Check if a file was actually uploaded
    if (!req.file) {
      console.error("No audio file received in the request.");
      return res.status(400).json({ error: "No audio file provided." });
    }

    const audioPath = req.file.path;
    console.log("🎤 Received audio file:", path.resolve(audioPath));

    // Step 1: Transcribe audio to text
    const commandText = await sttService.transcribe(audioPath);
    console.log("📝 Transcribed text:", commandText);

    // Step 2: Send the command to your control microservice
    const controlResponse = await commandService.sendCommand(commandText);
    console.log("📡 Device control response:", controlResponse.data);

    res.status(200).json({
      message: 'Command processed successfully',
      command: commandText,
      deviceResponse: controlResponse.data
    });

  } catch (error) {
    console.error("❌ Error in voice command handler:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
