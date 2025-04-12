const sttService = require('../services/sttService');
const commandService = require('../services/commandService');
const path = require('path');

let listening = false; // Global listening state

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
    const rawText = await sttService.transcribe(audioPath);
    console.log("Raw transcribed text:", rawText);

    // Step 2: Normalize text (remove punctuation, clean spaces)
    const cleanedText = rawText.toLowerCase()
      .replace(/[.,!?]/g, '')     // remove punctuation
      .replace(/\s+/g, ' ')       // collapse multiple spaces
      .trim();

    console.log("Cleaned text:", cleanedText);

    // Wake-up trigger
    if (!listening && cleanedText.includes('siri')) {
      listening = true;
      console.log("Wake word detected → Listening mode ON");
      return res.status(200).json({ status: 'wake', message: 'Listening started' });
    }

    // Stop trigger
    if (listening && cleanedText.includes('bye bye siri')) {
      listening = false;
      console.log("Stop word detected → Listening mode OFF");
      return res.status(200).json({ status: 'sleep', message: 'Listening stopped' });
    }

    // If listening, send command
    if (listening) {
      const controlResponse = await commandService.sendCommand(cleanedText);
      console.log("Device control response:", controlResponse.data);

      return res.status(200).json({
        message: 'Command processed successfully',
        command: cleanedText,
        deviceResponse: controlResponse.data
      });
    } else {
      // Not listening → ignore
      console.log("Not in listening mode → Ignored:", cleanedText);
      return res.status(200).json({ message: 'Ignored: Not in listening mode', transcription: cleanedText });
    }

  } catch (error) {
    console.error("Error in voice command handler:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
