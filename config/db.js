const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    if (error?.syscall === "querySrv") {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
        return;
      } catch (retryError) {
        console.error("connection failed", retryError);
        process.exit(1);
      }
    }

    console.error("connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
