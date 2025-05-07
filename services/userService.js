const { poolPromise } = require('../db/sql');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

async function findByUsername(username) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('username', username)
    .query('SELECT * FROM Users WHERE username = @username');
  return result.recordset[0];
}

async function createUser(username, password) {
  const pool = await poolPromise;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.request()
    .input('username', username)
    .input('password', hashedPassword)
    .query('INSERT INTO Users (username, password) VALUES (@username, @password); SELECT SCOPE_IDENTITY() AS id;');
  return result.recordset[0].id;
}

module.exports = {
  findByUsername,
  createUser
};
