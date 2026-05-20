const dotenv = require("dotenv");
const dns = require("dns");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const Short = require("../models/Short");

const MongoUser = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: String,
      email: String,
      password: String,
      role: String,
    },
    { timestamps: true, collection: "users" }
  )
);

const MongoProduct = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      title: String,
      description: String,
      images: [String],
      image: String,
      createdBy: mongoose.Schema.Types.ObjectId,
    },
    { timestamps: true, collection: "products" }
  )
);

const MongoShort = mongoose.model(
  "Short",
  new mongoose.Schema(
    {
      title: String,
      youtubeId: String,
    },
    { timestamps: true, collection: "shorts" }
  )
);

const ensureSystemUser = async () => {
  const email = "system@miniworld.local";
  const existing = await User.findOne({ where: { email } });
  if (existing) return existing;
  const password = await bcrypt.hash("change-me", 10);
  return User.create({ name: "System", email, password, role: "admin" });
};

const ensureMigrationStateTable = async (sequelize) => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS migration_state (
      name VARCHAR(191) PRIMARY KEY,
      completed_at DATETIME NULL
    )
  `);
};

const hasCompletedMigration = async (sequelize, name) => {
  await ensureMigrationStateTable(sequelize);
  const [rows] = await sequelize.query(
    "SELECT name, completed_at FROM migration_state WHERE name = ? LIMIT 1",
    { replacements: [name] }
  );
  return Array.isArray(rows) && rows.length > 0 && !!rows[0].completed_at;
};

const markMigrationCompleted = async (sequelize, name) => {
  await ensureMigrationStateTable(sequelize);
  await sequelize.query(
    "INSERT INTO migration_state (name, completed_at) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE completed_at = VALUES(completed_at)",
    { replacements: [name] }
  );
};

const repairMissingProductImages = async ({ sequelize }) => {
  const [rows] = await sequelize.query(
    "SELECT id, mongo_id AS mongoId FROM products WHERE mongo_id IS NOT NULL AND (images IS NULL OR JSON_LENGTH(images) = 0)"
  );

  const mongoIds = (Array.isArray(rows) ? rows : [])
    .map((r) => String(r.mongoId || ""))
    .filter(Boolean);

  if (mongoIds.length === 0) {
    return { inspected: 0, repaired: 0 };
  }

  const objectIds = mongoIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const mongoProducts = await MongoProduct.find({ _id: { $in: objectIds } }).lean();
  const mongoById = new Map(mongoProducts.map((p) => [String(p._id), p]));

  let repaired = 0;
  for (const r of rows) {
    const mongoId = String(r.mongoId || "");
    if (!mongoId) continue;
    const mp = mongoById.get(mongoId);
    if (!mp) continue;

    const nextImages =
      Array.isArray(mp.images) && mp.images.length > 0
        ? mp.images
        : typeof mp.image === "string" && mp.image.length > 0
          ? [mp.image]
          : null;

    if (!nextImages || nextImages.length === 0) continue;

    await sequelize.query("UPDATE products SET images = ? WHERE id = ?", {
      replacements: [JSON.stringify(nextImages), r.id],
    });
    repaired += 1;
  }

  return { inspected: rows.length, repaired };
};

const migrateMongoToMysql = async ({ sequelize, mongoUri }) => {
  const migrationName = "mongo_to_mysql_v1";

  if (!mongoUri) {
    throw new Error("MONGO_URI is required for migration");
  }

  const alreadyDone = await hasCompletedMigration(sequelize, migrationName);
  try {
    await mongoose.connect(mongoUri);
  } catch (err) {
    if (err?.syscall === "querySrv") {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      await mongoose.connect(mongoUri);
    } else {
      throw err;
    }
  }

  const systemUser = await ensureSystemUser();

  const mongoUsers = alreadyDone ? [] : await MongoUser.find().lean();
  const mongoProducts = alreadyDone ? [] : await MongoProduct.find().lean();
  const mongoShorts = alreadyDone ? [] : await MongoShort.find().lean();

  const mongoIdToUserId = new Map();

  let usersUpserted = 0;
  for (const u of mongoUsers) {
    const mongoId = String(u._id);
    const email = (u.email || "").toLowerCase();
    const existing =
      (email && (await User.findOne({ where: { email } }))) ||
      (await User.findOne({ where: { mongoId } }));

    const payload = {
      mongoId,
      name: u.name || "User",
      email: email || `migrated+${mongoId}@local`,
      password: u.password || (await bcrypt.hash("change-me", 10)),
      role: u.role === "admin" ? "admin" : "user",
      createdAt: u.createdAt || new Date(),
      updatedAt: u.updatedAt || new Date(),
    };

    const row = existing ? await existing.update(payload) : await User.create(payload);
    mongoIdToUserId.set(mongoId, row.id);
    usersUpserted += 1;
  }

  let productsUpserted = 0;
  for (const p of mongoProducts) {
    const mongoId = String(p._id);
    const existing = await Product.findOne({ where: { mongoId } });

    const createdByMongoId = p.createdBy ? String(p.createdBy) : null;
    const createdByUserId =
      (createdByMongoId && mongoIdToUserId.get(createdByMongoId)) || systemUser.id;

    const payload = {
      mongoId,
      title: p.title || "Untitled",
      description: p.description || "",
      images:
        Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : typeof p.image === "string" && p.image.length > 0
            ? [p.image]
            : [],
      createdByUserId,
      createdAt: p.createdAt || new Date(),
      updatedAt: p.updatedAt || new Date(),
    };

    if (existing) {
      await existing.update(payload);
    } else {
      await Product.create(payload);
    }

    productsUpserted += 1;
  }

  let shortsUpserted = 0;
  for (const s of mongoShorts) {
    const mongoId = String(s._id);
    const existing = await Short.findOne({ where: { mongoId } });

    const payload = {
      mongoId,
      title: s.title || null,
      youtubeId: s.youtubeId,
      createdAt: s.createdAt || new Date(),
      updatedAt: s.updatedAt || new Date(),
    };

    if (!payload.youtubeId) continue;

    if (existing) {
      await existing.update(payload);
    } else {
      await Short.create(payload);
    }

    shortsUpserted += 1;
  }

  const repair = await repairMissingProductImages({ sequelize });

  await mongoose.disconnect();

  if (!alreadyDone) {
    await markMigrationCompleted(sequelize, migrationName);
  }

  return {
    skipped: alreadyDone,
    usersUpserted,
    productsUpserted,
    shortsUpserted,
    repair,
  };
};

module.exports = { migrateMongoToMysql };

if (require.main === module) {
  const main = async () => {
    dotenv.config();
    await connectDB();
    const result = await migrateMongoToMysql({
      sequelize: connectDB.sequelize,
      mongoUri: process.env.MONGO_URI,
    });
    console.log(JSON.stringify(result, null, 2));
    await connectDB.sequelize.close();
  };

  main().catch(async (err) => {
    console.error(err);
    try {
      await mongoose.disconnect();
    } catch {}
    try {
      await connectDB.sequelize.close();
    } catch {}
    process.exit(1);
  });
}
