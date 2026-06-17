const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const getLocalCategories = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "../category.json"), "utf8");
    const productsData = fs.readFileSync(path.join(__dirname, "../product.json"), "utf8");
    const products = JSON.parse(productsData);

    return JSON.parse(data).map(cat => ({
      ...cat,
      _id: cat._id || cat.id?.toString().padStart(24, '0'),
      productId: products.slice(0, 4).map(p => ({
        ...p,
        _id: p._id || p.id.toString().padStart(24, '0'),
        status: "active"
      })) // Mock populated products
    }));
  } catch (err) {
    console.error("Error reading local categories:", err);
    return [];
  }
};

router.get("/", async (req, res) => {
  try {
    let categories = await Category.find().populate({
      path: "productId",
      match: { status: "active" }
    });
    if (categories.length === 0) {
      console.log("No categories in DB, falling back to JSON");
      categories = getLocalCategories();
    }
    res.status(200).json(categories);
  } catch (error) {
    console.log("DB Error in categories, falling back to JSON:", error.message);
    res.status(200).json(getLocalCategories());
  }
});


module.exports = router;
