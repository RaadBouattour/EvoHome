// routes/voiceRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

const upload = multer({ dest: 'uploads/' });

router.post('/command', upload.single('audio'), voiceController.handleVoiceCommand);

module.exports = router;
