const { poolPromise, sql } = require('../db/sql');
const Bid = require('../models/bidModel');
const UserService = require('./userService');

const BidService = {
  async placeBid(userId, lotId, amount) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const user = await UserService.getUserById(userId);
      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const currentRequest = new sql.Request(transaction);
      const currentResult = await currentRequest
        .input('lotId', sql.Int, lotId)
        .query('SELECT * FROM Lots WHERE id = @lotId');
      const lot = currentResult.recordset[0];

      if (!lot || !lot.isActive) throw new Error('Lot not found or not active');
      if (lot.userId === userId) throw new Error('Cannot bid on your own lot');

      const currentPrice = lot.currentPrice || lot.startingPrice;
      if (amount <= currentPrice) {
        throw new Error('Bid must be higher than current price');
      }

      if (lot.winnerId) {
        const refundRequest = new sql.Request(transaction);
        await refundRequest
          .input('prevUserId', sql.Int, lot.winnerId)
          .input('refundAmount', sql.Decimal(18, 2), currentPrice)
          .query('UPDATE Users SET balance = balance + @refundAmount WHERE id = @prevUserId');
      }

      const deductRequest = new sql.Request(transaction);
      await deductRequest
        .input('userId', sql.Int, userId)
        .input('amount', sql.Decimal(18, 2), amount)
        .query('UPDATE Users SET balance = balance - @amount WHERE id = @userId');

      await deductRequest
        .input('lotId', sql.Int, lotId)
        .input('winnerId', sql.Int, userId)
        .input('currentPrice', sql.Decimal(18, 2), amount)
        .query(`UPDATE Lots SET winnerId = @winnerId, currentPrice = @currentPrice WHERE id = @lotId`);

      await deductRequest
        .query(`INSERT INTO Bids (userId, lotId, amount, createdAt)
                VALUES (@userId, @lotId, @amount, GETDATE())`);

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};

module.exports = BidService;