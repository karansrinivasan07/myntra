const recommendationService = require("../services/recommendationService");
const RecommendationEvent = require("../models/RecommendationEvent");
const mongoose = require("mongoose");

/**
 * GET /recommendations
 * Query params: userId, productId, limit
 */
exports.getRecommendations = async (req, res) => {
  const userId = req.query.userId || req.user?.id;
  const productId = req.query.productId;
  const limit = parseInt(req.query.limit) || 10;

  try {
    if (productId && !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId format" });
    }
    if (userId && !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const start = Date.now();
    const recommendations = await recommendationService.getRecommendations(userId, productId, limit);
    const latency = Date.now() - start;

    res.setHeader("X-Response-Time-Ms", latency);
    return res.json(recommendations);
  } catch (err) {
    console.error("Error in getRecommendations controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /recommendations/event
 * Body params: userId, productId, eventType, algorithmVersion
 */
exports.trackEvent = async (req, res) => {
  const { userId, productId, eventType, algorithmVersion } = req.body;

  if (!productId || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Valid productId is required" });
  }
  if (!eventType || !["impression", "click", "add_to_cart", "purchase"].includes(eventType)) {
    return res.status(400).json({ message: "Valid eventType is required" });
  }

  try {
    const event = new RecommendationEvent({
      userId: userId || undefined,
      productId,
      eventType,
      algorithmVersion: algorithmVersion || "v1",
      timestamp: new Date()
    });

    await event.save();
    return res.status(201).json({ success: true, eventId: event._id });
  } catch (err) {
    console.error("Error in trackEvent controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
