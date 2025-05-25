const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_SERVER,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
});

const models = {
  User: require('../models/userModel')(sequelize),
  Lot: require('../models/lotModel')(sequelize),
  Bid: require('../models/bidModel')(sequelize),
};

Object.values(models).forEach(model => {
  if (model.associate) model.associate(models);
});

module.exports = { ...models, sequelize };
