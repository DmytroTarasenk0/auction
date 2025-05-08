const { poolPromise, sql } = require('../db/sql');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const UserService = {
  async getUserById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE id = @id');
    const r = result.recordset[0];
    return r ? new User(r.id, r.username, r.password, r.balance) : null;
  },

  async findByUsername(username) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');
    const r = result.recordset[0];
    return r ? new User(r.id, r.username, r.password, r.balance) : null;
  },

  async createUser(username, password) {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .query('INSERT INTO Users (username, password, balance) VALUES (@username, @password, 0)');
  },

  async addFunds(userId, amount) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      if (amount % 10 === 0) throw new Error('Sum cant be a multiple of 10');

      await request
        .input('userId', sql.Int, userId)
        .input('amount', sql.Decimal(18, 2), amount)
        .query('UPDATE Users SET balance = balance + @amount WHERE id = @userId');

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async deductFunds(userId, amount) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const user = await this.getUserById(userId);
      if (!user || user.balance < amount) throw new Error('insufficient funds');

      const request = new sql.Request(transaction);
      await request
        .input('userId', sql.Int, userId)
        .input('amount', sql.Decimal(18, 2), amount)
        .query('UPDATE Users SET balance = balance - @amount WHERE id = @userId');

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};

module.exports = UserService;