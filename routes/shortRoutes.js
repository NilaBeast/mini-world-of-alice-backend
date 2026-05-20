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

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NTNlMDJhMDMxYjM0YmJjMTQ0YTc0MCIsImlhdCI6MTc2NzEwNDcwMywiZXhwIjoxNzY5Njk2NzAzfQ.HqkbnWyutWD0UrsV4CknTVogLZ3NK7lHpdByyBLgwjM//
