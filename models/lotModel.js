const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lot = sequelize.define('Lot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currentPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    winnerId: {
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: 'Lots',
    timestamps: false,
  });

  Lot.associate = (models) => {
    Lot.belongsTo(models.User, { foreignKey: 'userId' });
    Lot.belongsTo(models.User, { foreignKey: 'winnerId', as: 'Winner' });
    Lot.hasMany(models.Bid, { foreignKey: 'lotId' });
  };

  return Lot;
};
