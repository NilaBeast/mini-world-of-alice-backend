const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema(
    {
        title: String,
        youtubeId: String
    },
    {timestamps: true}
);

module.exports = mongoose.model("Short", shortSchema);