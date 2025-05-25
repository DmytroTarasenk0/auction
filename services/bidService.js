const { User, Lot, Bid, sequelize } = require('../db/sequelize');

const BidService = {
  async placeBid(userId, lotId, amount) {
    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user || user.balance < amount) throw new Error('Insufficient balance');

      const lot = await Lot.findByPk(lotId, { transaction: t });
      if (!lot || !lot.isActive) throw new Error('Lot not found or not active');
      if (lot.userId === userId) throw new Error('Cannot bid on your own lot');

      const currentPrice = lot.currentPrice || lot.startingPrice;
      if (amount <= currentPrice) throw new Error('Bid must be higher than current price');

      if (lot.winnerId) {
        const prevWinner = await User.findByPk(lot.winnerId, { transaction: t });
        if (lot.winnerId === userId) {
          user.balance += parseFloat(currentPrice);
        } else {
          prevWinner.balance += parseFloat(currentPrice);
          await prevWinner.save({ transaction: t });
        }
      }

      user.balance -= parseFloat(amount);
      await user.save({ transaction: t });

      lot.winnerId = userId;
      lot.currentPrice = amount;
      await lot.save({ transaction: t });

      await Bid.create({
        userId,
        lotId,
        amount,
        createdAt: new Date(),
      }, { transaction: t });
    });
  }
};

module.exports = BidService;