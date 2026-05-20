const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const { migrateMongoToMysql } = require("./scripts/migrate-mongo-to-mysql");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const shortRoutes = require("./routes/shortRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite frontend
      "https://mini-world-of-alice.vercel.app", // CRA frontend
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
const shouldMigrateOnStart =
  String(process.env.MIGRATE_ON_START || "").toLowerCase() === "true" ||
  String(process.env.MIGRATE_ON_START || "") === "1";

const start = async () => {
  await connectDB();

  if (shouldMigrateOnStart) {
    try {
      const result = await migrateMongoToMysql({
        sequelize: connectDB.sequelize,
        mongoUri: process.env.MONGO_URI,
      });
      const repair = result?.repair;
      const repairMsg =
        repair && typeof repair.repaired === "number"
          ? ` repairImages=${repair.repaired}/${repair.inspected}`
          : "";
      if (result?.skipped) {
        console.log(`Migration skipped (already completed).${repairMsg}`);
      } else {
        console.log(
          `Migration completed: users=${result.usersUpserted} products=${result.productsUpserted} shorts=${result.shortsUpserted}.${repairMsg}`
        );
      }
    } catch (err) {
      console.error("Migration failed (server will still start):", err?.message || err);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
