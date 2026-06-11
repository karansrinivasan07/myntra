const express = require("express");
const router = express.Router();
const DeviceToken = require("../models/DeviceToken");
const Notification = require("../models/Notification");
const { enqueueNotification } = require("../services/notificationQueue");

/**
 * Register a device token for a user
 */
router.post("/register", async (req, res) => {
  const { userId, token, platform, timezone } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: "userId and token are required" });
  }

  try {
    // Upsert the token to handle updates and prevent duplicates
    const deviceToken = await DeviceToken.findOneAndUpdate(
      { token },
      {
        userId,
        platform: platform || "unknown",
        timezone: timezone || "UTC",
        lastUsedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Device token registered successfully", deviceToken });
  } catch (error) {
    console.error("Error registering device token:", error);
    res.status(500).json({ message: "Error registering device token" });
  }
});

/**
 * Remove a device token (e.g. on logout)
 */
router.post("/remove", async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: "userId and token are required" });
  }

  try {
    await DeviceToken.deleteOne({ userId, token });
    res.status(200).json({ message: "Device token removed successfully" });
  } catch (error) {
    console.error("Error removing device token:", error);
    res.status(500).json({ message: "Error removing device token" });
  }
});

/**
 * Trigger sending a push notification (event publisher)
 */
router.post("/send", async (req, res) => {
  const { userId, title, body, data, type, scheduledAt } = req.body;

  if (!userId || !title || !body) {
    return res.status(400).json({ message: "userId, title, and body are required" });
  }

  try {
    // Create the notification in db
    const notification = new Notification({
      userId,
      title,
      body,
      data: data || {},
      type: type || "real-time",
      status: "pending",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    });

    await notification.save();

    // Enqueue the notification job to background queue
    await enqueueNotification(notification);

    res.status(201).json({ message: "Notification queued successfully", notification });
  } catch (error) {
    console.error("Error triggering notification:", error);
    res.status(500).json({ message: "Error triggering notification" });
  }
});

/**
 * Fetch all notifications for a user
 */
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

/**
 * Mark a notification as read
 */
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
});

module.exports = router;
