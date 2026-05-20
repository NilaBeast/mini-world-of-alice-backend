const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const {adminOnly} = require("../middleware/adminMiddleware");
const {getShorts, addShort, updateShort, deleteShort} = require("../controllers/shortController");
const router = express.Router();

router.get("/", getShorts);
router.post("/", protect, adminOnly, addShort);
router.put("/:id", protect, adminOnly, updateShort);
router.delete("/:id", protect, adminOnly, deleteShort);

module.exports = router;
