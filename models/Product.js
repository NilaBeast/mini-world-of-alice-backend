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
    images: {
      type: [String],
      required: [
        function () {
          return !this.image;
        },
        "Product image is required",
      ],
    },
    image: {
      type: String,
      required: [
        function () {
          return !this.images || this.images.length === 0;
        },
        "Product image is required",
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
