const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'Users',
    timestamps: false,
  });

  User.associate = (models) => {
    User.hasMany(models.Lot, { foreignKey: 'userId' });
    User.hasMany(models.Lot, { foreignKey: 'winnerId', as: 'WonLots' });
    User.hasMany(models.Bid, { foreignKey: 'userId' });
  };

  return User;
};
