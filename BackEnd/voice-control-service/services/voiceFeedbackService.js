const axios = require('axios');

async function speakFeedback(message) {
  try {
    const response = await axios.post('http://192.168.63.166:5005/speak', {
      text: message
    });

    console.log('Sent to Raspberry Pi:', message);
  } catch (err) {
    console.error('Error sending to Raspberry Pi:', err.message);
  }
}

module.exports = { speakFeedback };
