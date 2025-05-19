const express = require('express');
const router = express.Router();
const ventilationController = require('../controllers/ventilationController');

router.post('/control', ventilationController.controlVentilation);

module.exports = router;
