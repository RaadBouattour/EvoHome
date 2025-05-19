const sttService = require('../services/sttService');
const commandService = require('../services/commandService');
const path = require('path');

// 🆕 Import the voice feedback service
const { speakFeedback } = require('../services/voiceFeedbackService');

let listening = false;

exports.handleVoiceCommand = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No audio file received in the request.");
      return res.status(400).json({ error: "No audio file provided." });
    }

    const audioPath = req.file.path;
    console.log("🎤 Received audio file:", path.resolve(audioPath));

    const rawText = await sttService.transcribe(audioPath);
    console.log("Raw transcribed text:", rawText);

    const cleanedText = rawText.toLowerCase()
      .replace(/[.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    console.log("Cleaned text:", cleanedText);

    if (!listening && cleanedText.includes('siri')) {
      listening = true;
      console.log("Wake word detected → Listening mode ON");
      // 🆕 Feedback: started listening
      speakFeedback("I'm listening");
      return res.status(200).json({ status: 'wake', message: 'Listening started' });
    }

    if (listening && cleanedText.includes('bye bye siri')) {
      listening = false;
      console.log("Stop word detected → Listening mode OFF");
      // 🆕 Feedback: stopped listening
      speakFeedback("Goodbye");
      return res.status(200).json({ status: 'sleep', message: 'Listening stopped' });
    }

    if (listening) {
      const controlResponse = await commandService.sendCommand(cleanedText);
      console.log("Device control response:", controlResponse.data);

      // 🆕 Feedback: success/failure vocal message
      if (controlResponse.data.success) {
        const { room, device, action } = controlResponse.data;
        speakFeedback(`${room} ${device} ${action} successfully`);
      } else {
        speakFeedback(`Failed to execute the command`);
      }

      return res.status(200).json({
        message: 'Command processed successfully',
        command: cleanedText,
        deviceResponse: controlResponse.data
      });
    } else {
      console.log("Not in listening mode → Ignored:", cleanedText);
      return res.status(200).json({ message: 'Ignored: Not in listening mode', transcription: cleanedText });
    }

  } catch (error) {
    console.error("Error in voice command handler:", error);
    // 🆕 Feedback: error vocal message
    speakFeedback("An error occurred while processing your request");
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
