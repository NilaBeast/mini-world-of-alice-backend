const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    // 🔥 Cloudinary secure URL
    images: {
      type: [String],
      required: [true, "Product image is required"],
    },

    // Optional but very useful
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Sort newest products first automatically
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
