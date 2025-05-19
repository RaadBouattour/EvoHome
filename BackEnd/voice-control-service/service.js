require('dotenv').config();
const express = require('express');
const app = express();
const voiceRoutes = require('./routes/voiceRoutes');

app.use(express.json());
app.use('/api/voice', voiceRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Voice control microservice running on port ${PORT}`);
});
