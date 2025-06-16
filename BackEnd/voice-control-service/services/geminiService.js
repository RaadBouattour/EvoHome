const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function queryGemini(prompt) {
  try {
    console.log("Sending prompt to Gemini:", prompt);

    const response = await axios.post(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    });

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini response:", result);
    return result || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return "An error occurred while communicating with Gemini.";
  }
}

module.exports = { queryGemini };
