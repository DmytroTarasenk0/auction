const LotService = require('../services/lotService');
const UserService = require('../services/userService');

const lotController = {
  async listLots(req, res) {
    const lots = await LotService.getAllLots();
    let user = null;
    if (req.session.user) {
      user = await UserService.getUserById(req.session.user.id);
    }
    const message = req.session.message;
    req.session.message = null;
    res.render('lots', { lots, user, message });
  },

  async viewLot(req, res) {
    const id = parseInt(req.params.id);
    const lot = await LotService.getLotById(id);
    if (!lot) return res.status(404).send('lot-not-found');
    let user = null;
    if (req.session.user) {
      user = await UserService.getUserById(req.session.user.id);
    }
    res.render('lot', { lot, user });
  },

  showCreateForm(req, res) {
    if (!req.session.user) return res.redirect('/login');
    res.render('createLot');
  },

  async createLot(req, res) {
    if (!req.session.user) return res.redirect('/login');

    const { title, startingPrice, description } = req.body;
    const userId = req.session.user.id;

    try {
      await LotService.createLot({ title, startingPrice, description, userId });
      res.redirect('/');
    } catch (err) {
      req.session.message = `Error: ${err.message}`;
      res.redirect('/');
    }
  },

  async deleteLot(req, res) {
    const lotId = parseInt(req.params.id);
    const lot = await LotService.getLotById(lotId);

    if (!lot) return res.status(404).send('No lot found');
    if (!req.session.user || req.session.user.id !== lot.userId)
      return res.status(403).send('Not authorized to delete this lot');

    await LotService.deleteLot(lotId, req.session.user.id);
    res.redirect('/');
  }
};

module.exports = lotController;