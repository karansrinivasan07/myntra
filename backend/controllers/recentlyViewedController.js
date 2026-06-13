const BrowsingHistory = require("../models/BrowsingHistory");
const mongoose = require("mongoose");

const LIMIT_ITEMS = 50;

/** GET /recently-viewed */
exports.getRecentlyViewed = async (req, res) => {
  const userId = req.user?.id || req.params.userId || req.headers["x-user-id"] || req.body.userId || req.query.userId;
  if (!userId) return res.status(401).json({ message: "Unauthenticated" });
  try {
    const items = await BrowsingHistory.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(LIMIT_ITEMS)
      .populate("productId", "name price images");
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** POST /recently-viewed */
exports.addOrUpdate = async (req, res) => {
  const userId = req.user?.id || req.body.userId || req.headers["x-user-id"] || req.query.userId;
  const { productId } = req.body;
  if (!userId) return res.status(401).json({ message: "Unauthenticated" });
  if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ message: "Invalid productId" });

  try {
    await BrowsingHistory.findOneAndUpdate(
      { userId, productId },
      { $set: { viewedAt: new Date() } },
      { upsert: true, new: true }
    );

    // enforce max 50 items
    const count = await BrowsingHistory.countDocuments({ userId });
    if (count > LIMIT_ITEMS) {
      const excess = count - LIMIT_ITEMS;
      const oldest = await BrowsingHistory.find({ userId })
        .sort({ viewedAt: 1 })
        .limit(excess);
      await BrowsingHistory.deleteMany({ _id: { $in: oldest.map(o => o._id) } });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** POST /recently-viewed/sync */
exports.sync = async (req, res) => {
  const userId = req.user?.id || req.body.userId || req.headers["x-user-id"] || req.query.userId;
  const { items } = req.body; // array of { productId, viewedAt }
  if (!userId) return res.status(401).json({ message: "Unauthenticated" });
  if (!Array.isArray(items)) return res.status(400).json({ message: "Invalid payload" });

  try {
    const bulkOps = items.map(i => ({
      updateOne: {
        filter: { userId, productId: i.productId },
        update: { $max: { viewedAt: new Date(i.viewedAt) } },
        upsert: true,
      }
    }));
    if (bulkOps.length) await BrowsingHistory.bulkWrite(bulkOps);

    // Trim to 50 after sync
    const count = await BrowsingHistory.countDocuments({ userId });
    if (count > LIMIT_ITEMS) {
      const excess = count - LIMIT_ITEMS;
      const toDelete = await BrowsingHistory.find({ userId })
        .sort({ viewedAt: 1 })
        .limit(excess);
      await BrowsingHistory.deleteMany({ _id: { $in: toDelete.map(d => d._id) } });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
