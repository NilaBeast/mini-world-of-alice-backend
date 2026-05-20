const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  const cached = global._mongooseCache || (global._mongooseCache = { conn: null, promise: null });
  if (cached.conn) return cached.conn;

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
    }
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
    return cached.conn;
  } catch (error) {
    if (error?.syscall === "querySrv") {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
        cached.conn = await cached.promise;
        console.log("MongoDB connected");
        return cached.conn;
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
