function classifyIntent(transcript) {
  const deviceKeywords = [
    'light', 'fan', 'door', 'ac', 'tv', 'ventilation',
    'turn on', 'turn off', 'open', 'close'
  ];

  const lower = transcript.toLowerCase();
  const isDevice = deviceKeywords.some(keyword => lower.includes(keyword));

  return isDevice ? 'device_control' : 'assistant';
}

module.exports = { classifyIntent };
