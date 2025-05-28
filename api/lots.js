const express = require('express');
const router = express.Router();
const LotService = require('../services/lotService');

// /api/lots/-etc

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 5, status, search } = req.query;
    const result = await LotService.getAllLots({ page, pageSize, status, search });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lot = await LotService.getLotById(req.params.id);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    res.json(lot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, startingPrice, description, userId } = req.body;
    await LotService.createLot({ title, startingPrice, description, userId });
    res.status(201).json({ message: 'Lot created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    await LotService.deleteLot(req.params.id, userId);
    res.json({ message: 'Lot deleted' });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
});

router.post('/:id/close', async (req, res) => {
  try {
    const { userId } = req.body;
    await LotService.closeAuction(req.params.id, userId);
    res.json({ message: 'Auction closed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
