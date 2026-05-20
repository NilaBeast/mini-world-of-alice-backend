const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const shortRoutes = require("./routes/shortRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://mini-world-of-alice.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shorts", shortRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("MINI_WORLD_OF_ALICE API running");
});

module.exports = app;

