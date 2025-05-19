const axios = require('axios');

const CONTROL_BASE_URL = 'http://localhost:5000/api';

function parseCommand(text) {
  const lower = text.toLowerCase();

  let endpoint, action, status, room;

  if (lower.includes('light')) {
    endpoint = 'lights';
  } else if (lower.includes('ventilation') || lower.includes('fan')) {
    endpoint = 'ventilations';
  } else if (lower.includes('door')) {
    endpoint = 'doors';
  } else {
    throw new Error('Device not recognized');
  }

  if (lower.includes('turn on') || lower.includes('open')) {
    status = endpoint === 'doors' ? 'open' : true;
  } else if (lower.includes('turn off') || lower.includes('close')) {
    status = endpoint === 'doors' ? 'closed' : false;
  } else {
    throw new Error('Action not recognized');
  }


  if (lower.includes('living room')) {
    room = 'living room';
  } else if (lower.includes('kitchen')) {
    room = 'kitchen';
  } else if (lower.includes('bedroom')) {
    room = 'bedroom';
  } else if (lower.includes('entry')) {
    room = 'entry';
  }else {
    throw new Error('Room not recognized');
  }

  return { endpoint, status, room };
}

exports.sendCommand = async (textCommand) => {
  const { endpoint, status, room } = parseCommand(textCommand);

  const payload = {
    room: room,
    status: status,
    source: 'voice'
  };

  const response = await axios.post(`${CONTROL_BASE_URL}/${endpoint}/toggle`, payload);
  return response;
};
