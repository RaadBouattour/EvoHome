const express = require('express');
const router = express.Router();
const controller = require('../controllers/ventilationController');
router.post('/toggle', controller.toggleVentilation);
module.exports = router;
