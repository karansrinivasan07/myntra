const mongoose = require("mongoose");

const BrowsingHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    viewedAt: { type: Date, default: Date.now, index: { expires: 90 * 24 * 60 * 60 } }, // 90 days TTL
  },
  { timestamps: true }
);

// Compound unique index to avoid duplicates
BrowsingHistorySchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for sorting history by viewedAt per user
BrowsingHistorySchema.index({ userId: 1, viewedAt: -1 });

module.exports = mongoose.model("BrowsingHistory", BrowsingHistorySchema, "browsing_history");
