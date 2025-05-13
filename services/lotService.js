const { poolPromise, sql } = require('../db/sql');
const UserService = require('./userService');

const LotService = {
  async getAllLots() {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Lots');
    return result.recordset;
  },

  async getLotById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Lots WHERE id = @id');
    return result.recordset[0] || null;
  },

  async createLot(lot) {
    const TAX = 25;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const user = await UserService.getUserById(lot.userId);
      if (!user || user.balance < TAX) throw new Error('insufficient funds');

      const request = new sql.Request(transaction);
      await request
        .input('userId', sql.Int, lot.userId)
        .input('amount', sql.Decimal(18, 2), TAX)
        .query('UPDATE Users SET balance = balance - @amount WHERE id = @userId');

      await request
        .input('title', sql.NVarChar, lot.title)
        .input('startingPrice', sql.Decimal(18, 2), lot.startingPrice)
        .input('description', sql.NVarChar, lot.description)
        .query(`INSERT INTO Lots (title, startingPrice, description, userId)
                VALUES (@title, @startingPrice, @description, @userId)`);

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async deleteLot(id, userId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const lotResult = await new sql.Request(transaction)
        .input('id', sql.Int, id)
        .query('SELECT * FROM Lots WHERE id = @id');

      const lot = lotResult.recordset[0];
      if (!lot || lot.userId !== userId) throw new Error('Lot not found or unauthorized');

      if (lot.isActive) {
        const bidResult = await new sql.Request(transaction)
          .input('lotId', sql.Int, id)
          .query(`SELECT TOP 1 * FROM Bids WHERE lotId = @lotId ORDER BY amount DESC`);

        const highestBid = bidResult.recordset[0];

        if (highestBid) {
          await new sql.Request(transaction)
            .input('userId', sql.Int, highestBid.userId)
            .input('amount', sql.Decimal(18, 2), highestBid.amount)
            .query(`UPDATE Users SET balance = balance + @amount WHERE id = @userId`);
        }
      }

      await new sql.Request(transaction)
          .input('lotId', sql.Int, id)
          .query('DELETE FROM Bids WHERE lotId = @lotId');

      await new sql.Request(transaction)
        .input('id', sql.Int, id)
        .input('userId', sql.Int, userId)
        .query('DELETE FROM Lots WHERE id = @id AND userId = @userId');

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async closeAuction(lotId, userId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const lotResult = await new sql.Request(transaction)
        .input('id', sql.Int, lotId)
        .query('SELECT * FROM Lots WHERE id = @id');

      const lot = lotResult.recordset[0];
      if (!lot || lot.userId !== userId || !lot.isActive) throw new Error('Invalid lot');

      const bidResult = await new sql.Request(transaction)
        .input('lotId', sql.Int, lotId)
        .query(`SELECT TOP 1 * FROM Bids WHERE lotId = @lotId ORDER BY amount DESC`);

      const highestBid = bidResult.recordset[0];

      if (highestBid) {
        await new sql.Request(transaction)
          .input('amount', sql.Decimal(18, 2), highestBid.amount)
          .input('userId', sql.Int, lot.userId)
          .query('UPDATE Users SET balance = balance + @amount WHERE id = @userId');

        await new sql.Request(transaction)
          .input('id', sql.Int, lotId)
          .input('winnerId', sql.Int, highestBid.userId)
          .query('UPDATE Lots SET isActive = 0, winnerId = @winnerId WHERE id = @id');
      } else {
        await new sql.Request(transaction)
          .input('id', sql.Int, lotId)
          .query('UPDATE Lots SET isActive = 0 WHERE id = @id');
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};

module.exports = LotService;
