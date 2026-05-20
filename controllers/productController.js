const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
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
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // 🔥 IMPORTANT: now using req.files (array)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one product image is required",
      });
    }

    // 🔥 Upload ALL images to Cloudinary
    const imageUploadPromises = req.files.map((file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      return cloudinary.uploader.upload(dataURI, {
        folder: "products",
      });
    });

    const uploadResults = await Promise.all(imageUploadPromises);

    // 🔥 Extract secure URLs
    const imageUrls = uploadResults.map((r) => r.secure_url);

    // 🔥 Create product
    const product = await Product.create({
      title,
      description,
      images: imageUrls, // ✅ ARRAY
      createdByUserId: req.user.id, // ✅ REQUIRED
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to create product",
    });
  }
};

// UPDATE PRODUCT (ADMIN)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const nextTitle = typeof req.body.title === "string" ? req.body.title : product.title;
    const nextDescription =
      typeof req.body.description === "string" ? req.body.description : product.description;

    let nextImages = product.images;
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = req.files.map((file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        return cloudinary.uploader.upload(dataURI, { folder: "products" });
      });
      const uploadResults = await Promise.all(imageUploadPromises);
      nextImages = uploadResults.map((r) => r.secure_url);
    } else if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        nextImages = req.body.images;
      } else if (typeof req.body.images === "string") {
        try {
          const parsed = JSON.parse(req.body.images);
          if (Array.isArray(parsed)) nextImages = parsed;
        } catch {}
      }
    }

    await product.update({
      title: nextTitle,
      description: nextDescription,
      images: nextImages,
    });

    return res.json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({ message: "Failed to update product" });
  }
};

// DELETE PRODUCT (ADMIN)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: delete image from cloudinary later
    await product.destroy();

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
