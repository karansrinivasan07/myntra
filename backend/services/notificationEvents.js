const EventEmitter = require("events");
const Notification = require("../models/Notification");
const { enqueueNotification } = require("./notificationQueue");
const { checkRateLimit } = require("./rateLimiter");

/**
 * Central event bus for the notification system.
 * Business logic emits events → this consumer creates notifications & enqueues them.
 */
class NotificationEventBus extends EventEmitter {}

const eventBus = new NotificationEventBus();

// ─── Event Consumers ────────────────────────────────────────────────

/**
 * ORDER CREATED — Real-time notification
 */
eventBus.on("order:created", async ({ userId, orderId, total }) => {
  try {
    if (!checkRateLimit(userId)) {
      console.log(`[EventBus] Rate limit hit for user ${userId}, skipping order:created notification`);
      return;
    }

    const notification = new Notification({
      userId,
      title: "Order Placed Successfully! 🎉",
      body: `Your order #${orderId.toString().slice(-6).toUpperCase()} for ₹${total} has been confirmed. We'll update you when it ships.`,
      data: { screen: "/orders", type: "order", orderId: orderId.toString() },
      type: "real-time",
      status: "pending",
      scheduledAt: new Date(),
    });

    await notification.save();
    await enqueueNotification(notification);
    console.log(`[EventBus] order:created → Notification queued for user ${userId}`);
  } catch (error) {
    console.error("[EventBus] Error handling order:created:", error);
  }
});

/**
 * ORDER SHIPPED — Real-time notification
 */
eventBus.on("order:shipped", async ({ userId, orderId, trackingNumber }) => {
  try {
    if (!checkRateLimit(userId)) return;

    const notification = new Notification({
      userId,
      title: "Your Order Has Shipped! 📦",
      body: `Order #${orderId.toString().slice(-6).toUpperCase()} is on its way. Tracking: ${trackingNumber}`,
      data: { screen: "/orders", type: "order", orderId: orderId.toString() },
      type: "real-time",
      status: "pending",
      scheduledAt: new Date(),
    });

    await notification.save();
    await enqueueNotification(notification);
    console.log(`[EventBus] order:shipped → Notification queued for user ${userId}`);
  } catch (error) {
    console.error("[EventBus] Error handling order:shipped:", error);
  }
});

/**
 * ORDER DELIVERED — Real-time notification
 */
eventBus.on("order:delivered", async ({ userId, orderId }) => {
  try {
    if (!checkRateLimit(userId)) return;

    const notification = new Notification({
      userId,
      title: "Order Delivered! ✅",
      body: `Your order #${orderId.toString().slice(-6).toUpperCase()} has been delivered. Enjoy your purchase!`,
      data: { screen: "/orders", type: "order", orderId: orderId.toString() },
      type: "real-time",
      status: "pending",
      scheduledAt: new Date(),
    });

    await notification.save();
    await enqueueNotification(notification);
    console.log(`[EventBus] order:delivered → Notification queued for user ${userId}`);
  } catch (error) {
    console.error("[EventBus] Error handling order:delivered:", error);
  }
});

/**
 * PAYMENT CONFIRMED — Real-time notification
 */
eventBus.on("payment:confirmed", async ({ userId, amount, paymentMethod }) => {
  try {
    if (!checkRateLimit(userId)) return;

    const notification = new Notification({
      userId,
      title: "Payment Confirmed 💳",
      body: `Payment of ₹${amount} via ${paymentMethod} was successful.`,
      data: { screen: "/orders", type: "payment" },
      type: "real-time",
      status: "pending",
      scheduledAt: new Date(),
    });

    await notification.save();
    await enqueueNotification(notification);
    console.log(`[EventBus] payment:confirmed → Notification queued for user ${userId}`);
  } catch (error) {
    console.error("[EventBus] Error handling payment:confirmed:", error);
  }
});

/**
 * CART ITEM ADDED — Scheduled cart abandonment reminder (2 hours later)
 */
eventBus.on("cart:item_added", async ({ userId, productName }) => {
  try {
    // Schedule a reminder 2 hours from now
    const scheduledTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const notification = new Notification({
      userId,
      title: "Your Bag Misses You! 🛍️",
      body: productName
        ? `"${productName}" is still in your bag. Complete your purchase before it's gone!`
        : "You have items in your bag waiting for you. Don't miss out!",
      data: { screen: "/(tabs)/bag", type: "cart" },
      type: "scheduled",
      status: "pending",
      scheduledAt: scheduledTime,
    });

    await notification.save();
    await enqueueNotification(notification);
    console.log(`[EventBus] cart:item_added → Abandonment reminder scheduled for user ${userId} at ${scheduledTime.toISOString()}`);
  } catch (error) {
    console.error("[EventBus] Error handling cart:item_added:", error);
  }
});

/**
 * PROMO SCHEDULED — Scheduled promotional notification
 */
eventBus.on("promo:scheduled", async ({ userId, title, body, scheduledAt }) => {
  try {
    if (!checkRateLimit(userId)) return;

    const notification = new Notification({
      userId,
      title: title || "Special Offer Just For You! 🔥",
      body: body || "Check out our latest deals and save big!",
      data: { screen: "/(tabs)/index", type: "promo" },
      type: "scheduled",
      status: "pending",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    });

    await notification.save();
    await enqueueNotification(notification);
    console.log(`[EventBus] promo:scheduled → Notification queued for user ${userId}`);
  } catch (error) {
    console.error("[EventBus] Error handling promo:scheduled:", error);
  }
});

// ─── Event Publisher Helpers ─────────────────────────────────────────

function emitOrderCreated(userId, orderId, total) {
  eventBus.emit("order:created", { userId, orderId, total });
}

function emitOrderShipped(userId, orderId, trackingNumber) {
  eventBus.emit("order:shipped", { userId, orderId, trackingNumber });
}

function emitOrderDelivered(userId, orderId) {
  eventBus.emit("order:delivered", { userId, orderId });
}

function emitPaymentConfirmed(userId, amount, paymentMethod) {
  eventBus.emit("payment:confirmed", { userId, amount, paymentMethod });
}

function emitCartItemAdded(userId, productName) {
  eventBus.emit("cart:item_added", { userId, productName });
}

function emitPromoScheduled(userId, title, body, scheduledAt) {
  eventBus.emit("promo:scheduled", { userId, title, body, scheduledAt });
}

module.exports = {
  eventBus,
  emitOrderCreated,
  emitOrderShipped,
  emitOrderDelivered,
  emitPaymentConfirmed,
  emitCartItemAdded,
  emitPromoScheduled,
};
