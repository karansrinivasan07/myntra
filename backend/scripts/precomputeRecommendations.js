const mongoose = require("mongoose");
const dotenv = require("dotenv");
const BrowsingHistory = require("../models/BrowsingHistory");
const Wishlist = require("../models/Wishlist");
const Order = require("../models/Order");
const User = require("../models/User");
const recommendationService = require("../services/recommendationService");

dotenv.config({ path: __dirname + "/../.env" });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not set in backend/.env file.");
  process.exit(1);
}

const BATCH_SIZE = 10; // Process 10 users at a time

async function precompute() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Gather active users from the last 7 days
    console.log("Identifying active users in the last 7 days...");
    
    const [viewedUsers, wishlistedUsers, orderingUsers] = await Promise.all([
      BrowsingHistory.distinct("userId", { viewedAt: { $gte: sevenDaysAgo } }),
      Wishlist.distinct("userId", { createdAt: { $gte: sevenDaysAgo } }),
      Order.distinct("userId", { createdAt: { $gte: sevenDaysAgo } })
    ]);

    const activeUserSet = new Set([
      ...viewedUsers.map(id => id.toString()),
      ...wishlistedUsers.map(id => id.toString()),
      ...orderingUsers.map(id => id.toString())
    ]);

    const activeUserIds = Array.from(activeUserSet).filter(Boolean);
    console.log(`Found ${activeUserIds.length} active users.`);

    if (activeUserIds.length === 0) {
      console.log("No active users to precompute recommendations for. Exiting.");
      mongoose.connection.close();
      return;
    }

    // 2. Process users in batches
    console.log(`Processing recommendations in batches of ${BATCH_SIZE}...`);
    let processedCount = 0;

    for (let i = 0; i < activeUserIds.length; i += BATCH_SIZE) {
      const batch = activeUserIds.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (userId) => {
        try {
          // Precompute user profile recommendations (no target product context)
          await recommendationService.getRecommendations(userId, null, 10);
        } catch (err) {
          console.error(`Failed to precompute recommendations for user ${userId}:`, err.message);
        }
      }));

      processedCount += batch.length;
      console.log(`Processed: ${processedCount}/${activeUserIds.length}`);
    }

    console.log("\nPrecomputation batch finished successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Precomputation failed:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

precompute();
