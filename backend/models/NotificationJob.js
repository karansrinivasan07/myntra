const mongoose = require("mongoose");

const NotificationJobSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    deviceToken: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "dlq"],
      default: "pending",
    },
    runAt: {
      type: Date,
      default: Date.now,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    errors: [
      {
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for rapid polling in worker
NotificationJobSchema.index({ status: 1, runAt: 1 });

module.exports = mongoose.model("NotificationJob", NotificationJobSchema);
