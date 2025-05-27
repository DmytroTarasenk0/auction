const { User, Lot, Bid, sequelize } = require('../db/sequelize');
const { Op } = require('sequelize');

const LotService = {
  async getAllLots({ page = 1, pageSize = 5, status, search }) {
    const offset = (page - 1) * pageSize;
    const where = {};

    if (status === 'active') where.isActive = true;
    else if (status === 'closed') where.isActive = false;

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const { rows: lots, count } = await Lot.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['id', 'DESC']]
    });

    return {
      lots,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  },

  async getLotById(id) {
    return await Lot.findByPk(id);
  },

  async createLot(lot) {
    const TAX = 25;

    return await sequelize.transaction(async (t) => {
      const user = await User.findByPk(lot.userId, { transaction: t });
      if (!user || user.balance < TAX) throw new Error('insufficient funds');

      user.balance -= TAX;
      await user.save({ transaction: t });

      await Lot.create({
        title: lot.title,
        startingPrice: lot.startingPrice,
        description: lot.description,
        userId: lot.userId,
        currentPrice: null,
        winnerId: null,
        isActive: true
      }, { transaction: t });
    });
  },

  async deleteLot(id, userId) {
    return await sequelize.transaction(async (t) => {
      const lot = await Lot.findByPk(id, { transaction: t });
      if (!lot || lot.userId !== userId) throw new Error('Lot not found or unauthorized');

      if (lot.isActive) {
        const highestBid = await Bid.findOne({
          where: { lotId: id },
          order: [['amount', 'DESC']],
          transaction: t
        });

        if (highestBid) {
          const user = await User.findByPk(highestBid.userId, { transaction: t });
          user.balance += parseFloat(highestBid.amount);
          await user.save({ transaction: t });
        }
      }

      await Bid.destroy({ where: { lotId: id }, transaction: t });
      await Lot.destroy({ where: { id, userId }, transaction: t });
    });
  },

  async closeAuction(lotId, userId) {
    return await sequelize.transaction(async (t) => {
      const lot = await Lot.findByPk(lotId, { transaction: t });
      if (!lot || lot.userId !== userId || !lot.isActive) throw new Error('Invalid lot');

      const highestBid = await Bid.findOne({
        where: { lotId },
        order: [['amount', 'DESC']],
        transaction: t
      });

      if (highestBid) {
        const seller = await User.findByPk(lot.userId, { transaction: t });
        seller.balance += parseFloat(highestBid.amount);
        await seller.save({ transaction: t });

        lot.isActive = false;
        lot.winnerId = highestBid.userId;
        await lot.save({ transaction: t });
      } else {
        lot.isActive = false;
        await lot.save({ transaction: t });
      }
    });
  }
};

module.exports = LotService;