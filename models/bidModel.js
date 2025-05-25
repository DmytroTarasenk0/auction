const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bid = sequelize.define('Bid', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'Bids',
    timestamps: false,
  });


  Bid.associate = (models) => {
    Bid.belongsTo(models.User, { foreignKey: 'userId' });
    Bid.belongsTo(models.Lot, { foreignKey: 'lotId' });
  };

  return Bid;
};
