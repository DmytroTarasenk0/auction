const LotService = require('../services/lotService');

const lotController = {
  async listLots(req, res) {
    const lots = await LotService.getAllLots();
    res.render('lots', { lots, user: req.session.user });
  },

  async viewLot(req, res) {
    const id = parseInt(req.params.id);
    const lot = await LotService.getLotById(id);
    if (!lot) return res.status(404).send('Лот не знайдено');
    res.render('lot', { lot, user: req.session.user });
  },

  showCreateForm(req, res) {
    if (!req.session.user) return res.redirect('/login');
    res.render('createLot');
  },

  async createLot(req, res) {
    if (!req.session.user) return res.redirect('/login');

    const { title, startingPrice, description } = req.body;
    const userId = req.session.user.id;

    await LotService.createLot({ title, startingPrice, description, userId });
    res.redirect('/');
  },

  async deleteLot(req, res) {
    const lotId = parseInt(req.params.id);
    const lot = await LotService.getLotById(lotId);
  
    if (!lot) return res.status(404).send('No lot found');
    if (!req.session.user || req.session.user.id !== lot.userId)
      return res.status(403).send('Not authorized to delete this lot');
  
    await LotService.deleteLot(lotId, req.session.user.id); // ← додано userId
    res.redirect('/');
  }  
};

module.exports = lotController;
