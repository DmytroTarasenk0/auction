const BidService = require('../services/bidService');

const bidController = {
  async placeBid(req, res) {
    const lotId = parseInt(req.params.lotId);
    const amount = parseFloat(req.body.amount);
    const userId = req.session?.user?.id;

    if (!userId) {
      req.session.message = 'Login to place a bid';
      return res.redirect(`/lots/${lotId}`);
    }

    try {
      await BidService.placeBid(userId, lotId, amount);
      req.session.message = 'Bid placed';
    } catch (err) {
      req.session.message = `Error: ${err.message}`;
    }

    res.redirect(`/lots/${lotId}`);
  }
};

module.exports = bidController;