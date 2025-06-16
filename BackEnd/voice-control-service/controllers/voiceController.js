const sttService = require('../services/sttService');
const commandService = require('../services/commandService');
const { speakFeedback } = require('../services/voiceFeedbackService');
const { classifyIntent } = require('../services/intentClassifier');
const { queryGemini } = require('../services/geminiService');
const path = require('path');

let listening = false;

exports.handleVoiceCommand = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No audio file received in the request.");
      return res.status(400).json({ error: "No audio file provided." });
    }

    const audioPath = req.file.path;
    console.log("Received audio file:", path.resolve(audioPath));

    const rawText = await sttService.transcribe(audioPath);
    console.log("Raw transcribed text:", rawText);

    const cleanedText = rawText.toLowerCase()
      .replace(/[.,!?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log("Cleaned text:", cleanedText);

    const broadcast = req.app.locals.broadcastTts;

    if (!listening && cleanedText.includes('siri')) {
      listening = true;
      console.log("Wake word detected → Listening mode ON");
      const msg = "I am Siri Sir, please tell me how I can help you";
      await speakFeedback(msg);
      broadcast && broadcast({ text: msg });
      return res.status(200).json({ status: 'wake', message: 'Listening started' });
    }

    if (listening && cleanedText.includes('bye bye siri')) {
      listening = false;
      console.log("Stop word detected → Listening mode OFF");
      const msg = "Goodbye";
      await speakFeedback(msg);
      broadcast && broadcast({ text: msg });
      return res.status(200).json({ status: 'sleep', message: 'Listening stopped' });
    }

    if (listening) {
      const intent = classifyIntent(cleanedText);
      console.log(`Intent classifier result → ${intent === 'device_control' ? 'DEVICE CONTROL' : 'ASSISTANT'}`);

if (intent === 'device_control') {
  console.log("→ Attempting to send device control command:", cleanedText);
  const controlResponse = await commandService.sendCommand(cleanedText);
  console.log("Device control response:", controlResponse);

  let msg;

  if (controlResponse.success) {
    const { room, name: device, status: action } = controlResponse;
    msg = `${room} ${device} ${action ? 'activated' : 'deactivated'} successfully`;
  } else {
    msg = controlResponse.message || "Failed to execute the command";
  }

  // ✅ Speak feedback and broadcast regardless of success/failure
  await speakFeedback(msg);
  broadcast && broadcast({ text: msg });

  return res.status(200).json({
    intent,
    command: cleanedText,
    deviceResponse: controlResponse
  });
}
 else {
        const aiResponse = await queryGemini(cleanedText);
        console.log("Gemini response:", aiResponse);

        await speakFeedback(aiResponse);
        broadcast && broadcast({ text: aiResponse });

        return res.status(200).json({
          intent,
          prompt: cleanedText,
          aiResponse
        });
      }

    } else {
      console.log("Not in listening mode → Ignored:", cleanedText);
      return res.status(200).json({
        message: 'Ignored: Not in listening mode',
        transcription: cleanedText
      });
    }

  } catch (error) {
    console.error("Error in voice command handler:", error);
    const msg = "An error occurred while processing your request";
    await speakFeedback(msg);
    const broadcast = req.app.locals.broadcastTts;
    broadcast && broadcast({ text: msg });

    res.status(500).json({
      error: error.message || 'Internal Server Error'
    });
  }
};
