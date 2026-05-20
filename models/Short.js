const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    youtubeId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Short", shortSchema);
