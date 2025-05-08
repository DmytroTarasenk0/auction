const { poolPromise, sql } = require('../db/sql');
const Lot = require('../models/lotModel');
const UserService = require('./userService');

const LotService = {
  async getAllLots() {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Lots');
    return result.recordset.map(
      (r) => new Lot(r.id, r.title, r.startingPrice, r.description, r.userId)
    );
  },

  async getLotById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Lots WHERE id = @id');
    const r = result.recordset[0];
    return r ? new Lot(r.id, r.title, r.startingPrice, r.description, r.userId) : null;
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
    await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query(`DELETE FROM Lots WHERE id = @id AND userId = @userId`);
  }
};

module.exports = LotService;