const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userrouter = require("./routes/Userroutes");
const categoryrouter = require("./routes/Categoryroutes");
const productrouter = require("./routes/Productroutes");
const Bagroutes = require("./routes/Bagroutes");
const Wishlistroutes = require("./routes/Wishlistroutes");
const OrderRoutes = require("./routes/OrderRoutes");
const recentlyViewedRouter = require('./routes/recentlyViewed');
const notificationRouter = require('./routes/notifications');
const transactionRouter = require("./routes/TransactionRoutes");
const recommendationRouter = require("./routes/recommendationRoutes");
const adminrouter = require("./routes/Adminroutes");
const { startWorker } = require("./services/notificationQueue");
const { runMigrations } = require("./services/migrationService");
const cors = require('cors');
dotenv.config();
const app = express();
app.use(express.json());
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} - Body:`, req.body);
  next();
});
app.get("/", (req, res) => {
  res.send("✅ Myntra backend in working");
});
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use("/user", userrouter);
app.use("/category", categoryrouter);
app.use("/product", productrouter);
app.use("/admin/products", adminrouter);
app.use("/bag", Bagroutes);
app.use("/cart", require("./routes/CartRoutes"));
app.use("/wishlist", Wishlistroutes);
app.use("/order", OrderRoutes);
app.use("/recently-viewed", recentlyViewedRouter);
app.use("/notifications", notificationRouter);
app.use("/transactions", transactionRouter);
app.use("/recommendations", recommendationRouter);


const startServer = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/myntra";

  try {
    // Attempt 1: Connect to provided URI
    console.log("Connecting to MongoDB: " + mongoUri);
    await mongoose.connect(mongoUri, {
      family: 4,
      serverSelectionTimeoutMS: 5000 // Fast fail
    });
    console.log("Mongodb connected");
  } catch (err) {
    console.log("Primary MongoDB connection failed (" + err.message + "). Falling back to MongoMemoryServer...");
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const backupUri = mongod.getUri();
      await mongoose.connect(backupUri);
      console.log("Mongodb Memory Server connected at " + backupUri);
    } catch (innerErr) {
      console.error("Critical: Failed to start both primary and backup MongoDB:", innerErr);
      return; // Stop if everything fails
    }
  }

  try {
    // Run startup migrations
    await runMigrations();
    // Start background notification queue worker
    startWorker(5000);
  } catch (err) {
    console.error("Post-connection initialization failed:", err);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};

startServer();
