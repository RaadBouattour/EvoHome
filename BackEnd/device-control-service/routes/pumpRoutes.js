const express = require('express');
const router = express.Router();
const pumpController = require('../controllers/pumpController');

router.post('/control', pumpController.controlPump);

module.exports = router;
