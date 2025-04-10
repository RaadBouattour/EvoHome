// services/sttService.js
const axios = require('axios');
const fs = require('fs');

const API_KEY = process.env.ASSEMBLYAI_API_KEY;

async function uploadAudio(filePath) {
  const audio = fs.readFileSync(filePath);
  const response = await axios.post('https://api.assemblyai.com/v2/upload', audio, {
    headers: {
      authorization: API_KEY,
      'content-type': 'application/octet-stream',
    },
  });
  return response.data.upload_url;
}

async function transcribeAudio(uploadUrl) {
  const response = await axios.post(
    'https://api.assemblyai.com/v2/transcript',
    { audio_url: uploadUrl },
    { headers: { authorization: API_KEY } }
  );

  const transcriptId = response.data.id;

  while (true) {
    const poll = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { authorization: API_KEY },
    });

    if (poll.data.status === 'completed') {
      return poll.data.text;
    } else if (poll.data.status === 'error') {
      throw new Error(poll.data.error);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

exports.transcribe = async (filePath) => {
  const uploadUrl = await uploadAudio(filePath);
  return await transcribeAudio(uploadUrl);
};
