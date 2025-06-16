const axios = require('axios');

function parseCommand(text) {
  const lower = text.toLowerCase();

  let endpoint, action, status, room, baseUrl;

  // Detect device and set endpoint and base URL
  if (lower.includes('light')) {
    endpoint = 'lights';
    baseUrl = 'http://192.168.6.166:5000/api';
  } else if (lower.includes('ventilation') || lower.includes('fan')) {
    endpoint = 'ventilations';
    baseUrl = 'http://192.168.6.166:5000/api';
  } else if (lower.includes('door')) {
    endpoint = 'doors';
    baseUrl = 'http://192.168.6.166:5000/api';
  } else if (lower.includes('pump')) {
    endpoint = 'pump';
    baseUrl = 'http://192.168.6.166:5000/api';
  } else {
    throw new Error('Device not recognized');
  }

  // Determine action
  if (lower.includes('turn on') || lower.includes('open') || lower.includes('start')) {
    status = true;
  } else if (lower.includes('turn off') || lower.includes('close') || lower.includes('stop')) {
    status = false;
  } else {
    throw new Error('Action not recognized');
  }

  // Detect room
  if (lower.includes('living room')) {
    room = 'living room';
  } else if (lower.includes('kitchen')) {
    room = 'kitchen';
  } else if (lower.includes('bedroom')) {
    room = 'bedroom';
  } else if (lower.includes('entry')) {
    room = 'entry';
  } else if (lower.includes('garden')) {
    room = 'garden';
  } else {
    throw new Error('Room not recognized');
  }

  return { endpoint, status, room, baseUrl };
}

exports.sendCommand = async (textCommand) => {
  try {
    const { endpoint, status, room, baseUrl } = parseCommand(textCommand);
    
    console.log("Parsed command →");
    console.log("  Endpoint:", endpoint);
    console.log("  Status:", status);
    console.log("  Room:", room);
    console.log("  Base URL:", baseUrl);

    const payload = { room, status };

    let fullUrl;
    if (endpoint === 'lights' || endpoint === 'doors') {
      fullUrl = `${baseUrl}/${endpoint}/toggle`;
    } else if (endpoint === 'ventilations' || endpoint === 'pump') {
      fullUrl = `${baseUrl}/${endpoint}/control`;
    }

    console.log("Sending POST request to:", fullUrl);
    console.log("Payload:", payload);

    const response = await axios.post(fullUrl, payload);
    
    console.log("✅ Device responded:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error sending command:", error.message);
    return {
      success: false,
      message: 'Failed to send command',
      error: error.message
    };
  }
};

