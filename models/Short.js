const { DataTypes, Model } = require("sequelize");
const connectDB = require("../config/db");

const sequelize = connectDB.sequelize;

class Short extends Model {}

Short.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    mongoId: { type: DataTypes.STRING(24), unique: true, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: true },
    youtubeId: { type: DataTypes.STRING(32), allowNull: false },
  },
  {
    sequelize,
    modelName: "Short",
    tableName: "shorts",
    timestamps: true,
    indexes: [{ fields: ["created_at"] }],
  }
);

module.exports = Short;
