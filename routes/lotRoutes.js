const express = require('express');
const router = express.Router();
const lotController = require('../controllers/lotController');

router.get('/', lotController.listLots);
router.get('/lots/:id', lotController.viewLot);
router.get('/create', lotController.showCreateForm);
router.post('/create', lotController.createLot);
router.post('/lots/:id/delete', lotController.deleteLot);

module.exports = router;