const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const sequelize = connectDB.sequelize;

class User extends Model {
  async matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    mongoId: { type: DataTypes.STRING(24), unique: true, allowNull: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
      async beforeCreate(user) {
        if (!user.password) return;
        if (typeof user.password === "string" && user.password.startsWith("$2")) return;
        user.password = await bcrypt.hash(user.password, 10);
      },
      async beforeUpdate(user) {
        if (!user.changed("password")) return;
        if (typeof user.password === "string" && user.password.startsWith("$2")) return;
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

module.exports = User;
