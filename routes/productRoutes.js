const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getProducts,
  createProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// PUBLIC
router.get("/", getProducts);

// ADMIN
router.post(
  "/",
  protect,
  upload.array("images", 5), // 🔥 SAME PATTERN AS PROFILE
  adminOnly,
  createProduct
);

router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
