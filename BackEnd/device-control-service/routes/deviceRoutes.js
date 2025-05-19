const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.get('/devices/grouped-by-room', deviceController.getDevicesGroupedByRoom);

router.post('/board-ip', deviceController.setBoardIP);
router.get('/board-ip', deviceController.getBoardIP);

module.exports = router;
