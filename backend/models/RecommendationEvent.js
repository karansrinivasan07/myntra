const mongoose = require("mongoose");

const RecommendationEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    eventType: {
      type: String,
      enum: ["impression", "click", "add_to_cart", "purchase"],
      required: true,
      index: true,
    },
    algorithmVersion: { type: String, default: "v1", required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecommendationEvent", RecommendationEventSchema, "recommendation_event");
