const express = require('express');
const router = express.Router();
const controller = require('../controllers/doorController');
router.post('/toggle', controller.toggleDoor);
module.exports = router;