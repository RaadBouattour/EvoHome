const express = require('express');
const router = express.Router();
const controller = require('../controllers/lightController');
router.post('/toggle', controller.toggleLight);
module.exports = router;