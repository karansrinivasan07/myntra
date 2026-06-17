const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const getLocalProducts = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "../product.json"), "utf8");
    return JSON.parse(data).map(p => ({
      ...p,
      _id: p._id || p.id.toString().padStart(24, '0'), // Mock ObjectId
      status: "active"
    }));
  } catch (err) {
    console.error("Error reading local products:", err);
    return [];
  }
};

router.get("/", async (req, res) => {
  try {
    let products = await Product.find({ status: "active" });
    if (products.length === 0) {
      console.log("No products in DB, falling back to JSON");
      products = getLocalProducts();
    }
    res.status(200).json(products);
  } catch (error) {
    console.log("DB Error, falling back to JSON:", error.message);
    res.status(200).json(getLocalProducts());
  }
});

router.get("/:id", async (req, res) => {
  const productid = req.params.id;
  try {
    let product = await Product.findById(productid);
    if (!product || product.status !== "active") {
      const localProducts = getLocalProducts();
      product = localProducts.find(p => p._id === productid || p.id?.toString() === productid);
      if (!product) {
        return res.status(404).json({ message: "Product not found or unavailable." });
      }
    }
    res.status(200).json(product);
  } catch (error) {
    console.log("DB Error in product detail, falling back to JSON:", error.message);
    const localProducts = getLocalProducts();
    const product = localProducts.find(p => p._id === productid || p.id?.toString() === productid);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Something went wrong" });
    }
  }
});

module.exports = router;
