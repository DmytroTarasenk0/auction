const { poolPromise, sql } = require('../db/sql');
const Lot = require('../models/lotModel');

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
    const pool = await poolPromise;
    await pool.request()
      .input('title', sql.NVarChar, lot.title)
      .input('startingPrice', sql.Decimal(18, 2), lot.startingPrice)
      .input('description', sql.NVarChar, lot.description)
      .input('userId', sql.Int, lot.userId)
      .query(`
        INSERT INTO Lots (title, startingPrice, description, userId)
        VALUES (@title, @startingPrice, @description, @userId)
      `);
  },

  async updateLot(id, lot) {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, lot.title)
      .input('startingPrice', sql.Decimal(18, 2), lot.startingPrice)
      .input('description', sql.NVarChar, lot.description)
      .query(`
        UPDATE Lots
        SET title = @title, startingPrice = @startingPrice, description = @description
        WHERE id = @id
      `);
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
