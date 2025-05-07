const express = require('express');
const router = express.Router();
const lotController = require('../controllers/lotController');

router.get('/', lotController.listLots);
router.get('/lots/new', lotController.showCreateForm);
router.post('/lots', lotController.createLot);
router.get('/lots/:id', lotController.viewLot);
router.post('/lots/:id/delete', lotController.deleteLot);

module.exports = router;
