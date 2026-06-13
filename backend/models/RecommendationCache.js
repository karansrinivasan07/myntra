const mongoose = require("mongoose");

const RecommendationCacheSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    currentProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", index: true },
    recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    algorithmVersion: { type: String, default: "v1", required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 3600 } }, // 1 hour TTL
  },
  { timestamps: true }
);

// Compound unique index to look up cache entries fast and avoid duplicates
RecommendationCacheSchema.index({ userId: 1, currentProductId: 1 }, { unique: true });

module.exports = mongoose.model("RecommendationCache", RecommendationCacheSchema, "recommendation_cache");
