const express = require("express");
const router = express.Router();
const controller = require("../controllers/recommendationController");

// GET /recommendations -> Get recommendations based on userId or currentProductId context
router.get("/", controller.getRecommendations);

// POST /recommendations/event -> Track analytics event (impression, click, add_to_cart, purchase)
router.post("/event", controller.trackEvent);

module.exports = router;
