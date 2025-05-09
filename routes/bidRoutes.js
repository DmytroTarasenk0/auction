const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');

router.post('/:lotId/bid', bidController.placeBid);

module.exports = router;