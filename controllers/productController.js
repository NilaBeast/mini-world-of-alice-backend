const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};



// CREATE PRODUCT (ADMIN)
exports.createProduct = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    // 🔥 Convert image buffer → base64 (same as profile)
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // 🔥 Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "products",
    });

    const product = await Product.create({
      title,
      description,
      image: result.secure_url, // ✅ permanent URL
      createdBy: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
};

// DELETE PRODUCT (ADMIN)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: delete image from cloudinary later
    await product.deleteOne();

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
