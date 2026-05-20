const { DataTypes, Model } = require("sequelize");
const connectDB = require("../config/db");

const sequelize = connectDB.sequelize;

class Product extends Model {}

Product.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    mongoId: { type: DataTypes.STRING(24), unique: true, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    images: { type: DataTypes.JSON, allowNull: false },
    createdByUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    indexes: [{ fields: ["created_at"] }],
  }
);

module.exports = Product;
