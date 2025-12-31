const express = require("express");
const { sendContactMail } = require("../controllers/contactController");

const router = express.Router();

router.post("/", sendContactMail);

module.exports = router;
