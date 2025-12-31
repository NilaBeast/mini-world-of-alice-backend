const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
     name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
},
{timestamps: true}
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return ;
  this.password = await bcrypt.hash(this.password, 10);
  
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", userSchema);