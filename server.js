const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const shortRoutes = require("./routes/shortRoutes");
const contactRoutes = require("./routes/contactRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite frontend
      "http://localhost:5000", // CRA frontend
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shorts", shortRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("MINI_WORLD_OF_ALICE API running");
});

const PORT = process.env.PORT || 5000; // ✅ backend standard
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
