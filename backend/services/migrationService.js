const RecentlyViewed = require("../models/RecentlyViewed");
const BrowsingHistory = require("../models/BrowsingHistory");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Seeds a default test user so login works even with MongoMemoryServer.
 */
async function seedDefaultUser() {
  try {
    // Seed regular test user
    const existing = await User.findOne({ email: "test@myntra.com" });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        fullName: "Test User",
        email: "test@myntra.com",
        password: hashedPassword,
        role: "user",
      });
      console.log("[Migration] Seeded default user: test@myntra.com / password123");
    }

    // Seed admin user
    const existingAdmin = await User.findOne({ email: "admin@myntra.com" });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        fullName: "Administrator",
        email: "admin@myntra.com",
        password: hashedAdminPassword,
        role: "admin",
      });
      console.log("[Migration] Seeded default admin: admin@myntra.com / admin123");
    }
  } catch (err) {
    console.error("[Migration] Error seeding default users:", err.message);
  }
}

/**
 * Migrates legacy RecentlyViewed records to the new BrowsingHistory collection.
 */
async function migrateRecentlyViewedToBrowsingHistory() {
  try {
    const count = await RecentlyViewed.countDocuments();
    if (count === 0) {
      return;
    }
    console.log(`[Migration] Found ${count} legacy RecentlyViewed records. Migrating...`);

    const legacyRecords = await RecentlyViewed.find();
    let migratedCount = 0;

    for (const record of legacyRecords) {
      try {
        await BrowsingHistory.findOneAndUpdate(
          { userId: record.userId, productId: record.productId },
          { $setOnInsert: { viewedAt: record.viewedAt } },
          { upsert: true, new: true }
        );
        migratedCount++;
      } catch (err) {
        console.error(`[Migration] Error migrating record for user ${record.userId}, product ${record.productId}:`, err.message);
      }
    }

    console.log(`[Migration] Successfully migrated ${migratedCount} records to BrowsingHistory.`);
    await RecentlyViewed.deleteMany({});
    console.log(`[Migration] Legacy RecentlyViewed collection cleaned up.`);
  } catch (err) {
    console.error(`[Migration] Error during RecentlyViewed migration:`, err);
  }
}

/**
 * Maps categories back to product documents so they can be indexed.
 */
async function migrateProductCategories() {
  try {
    console.log(`[Migration] Building product-to-category associations...`);
    const categories = await Category.find();

    const productToCategoriesMap = {};
    for (const cat of categories) {
      if (Array.isArray(cat.productId)) {
        for (const prodId of cat.productId) {
          if (!prodId) continue;
          const prodIdStr = prodId.toString();
          if (!productToCategoriesMap[prodIdStr]) {
            productToCategoriesMap[prodIdStr] = [];
          }
          if (!productToCategoriesMap[prodIdStr].some(id => id.toString() === cat._id.toString())) {
            productToCategoriesMap[prodIdStr].push(cat._id);
          }
        }
      }
    }

    let updatedCount = 0;
    for (const [prodIdStr, catIds] of Object.entries(productToCategoriesMap)) {
      const result = await Product.updateOne(
        { _id: prodIdStr },
        { $set: { categories: catIds } }
      );
      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }
    console.log(`[Migration] Updated categories field for ${updatedCount} products.`);

    // Direction B: Product.categories -> Category.productId (for seeded / legacy products)
    const products = await Product.find();
    let updatedCategoriesCount = 0;
    for (const prod of products) {
      if (Array.isArray(prod.categories)) {
        for (const catId of prod.categories) {
          if (!catId) continue;
          const res = await Category.updateOne(
            { _id: catId },
            { $addToSet: { productId: prod._id } }
          );
          if (res.modifiedCount > 0) {
            updatedCategoriesCount++;
          }
        }
      }
    }
    console.log(`[Migration] Added products to categories' productId array for ${updatedCategoriesCount} associations.`);
  } catch (err) {
    console.error(`[Migration] Error migrating product categories:`, err);
  }
}

const fs = require("fs");
const path = require("path");

async function seedDataIfEmpty() {
  try {
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, "../category.json"), "utf8"));
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../product.json"), "utf8"));

    // Always ensure all categories exist
    const catMap = {};
    for (const cat of categoriesData) {
      const doc = await Category.findOneAndUpdate(
        { name: cat.name },
        { $setOnInsert: { name: cat.name, subcategory: cat.subcategory, image: cat.image } },
        { upsert: true, new: true }
      );
      catMap[cat.name] = doc._id;
    }
    console.log(`[Migration] Ensured ${Object.keys(catMap).length} categories exist.`);

    // Seed any missing products (check by name+brand)
    const existingProducts = await Product.find({}, { name: 1, brand: 1 });
    const existingSet = new Set(existingProducts.map(p => `${p.name}||${p.brand}`));

    let inserted = 0;
    for (const p of productsData) {
      const key = `${p.name}||${p.brand}`;
      if (existingSet.has(key)) continue;

      const doc = new Product({
        name: p.name,
        brand: p.brand,
        price: p.price,
        discount: p.discount,
        description: p.description,
        sizes: p.sizes,
        images: p.images,
        stock: p.stock || 50,
        status: "active",
        categories: catMap[p.category] ? [catMap[p.category]] : []
      });
      await doc.save();
      inserted++;
    }
    if (inserted > 0) {
      console.log(`[Migration] Seeded ${inserted} new products (${existingProducts.length} already existed).`);
    } else {
      console.log(`[Migration] All ${productsData.length} products already exist.`);
    }
  } catch (err) {
    console.error("[Migration] Seeding failed:", err.message);
  }
}

async function runMigrations() {
  console.log("[Migration] Running server migrations...");
  await seedDefaultUser();
  await seedDataIfEmpty();
  await migrateRecentlyViewedToBrowsingHistory();
  await migrateProductCategories();

  // Set default stock, isDiscontinued, and status for legacy products if missing
  try {
    const stockUpdateRes = await Product.updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 50 } }
    );
    if (stockUpdateRes.modifiedCount > 0) {
      console.log(`[Migration] Set default stock of 50 for ${stockUpdateRes.modifiedCount} legacy products.`);
    }

    const discUpdateRes = await Product.updateMany(
      { isDiscontinued: { $exists: false } },
      { $set: { isDiscontinued: false } }
    );
    if (discUpdateRes.modifiedCount > 0) {
      console.log(`[Migration] Set default isDiscontinued of false for ${discUpdateRes.modifiedCount} legacy products.`);
    }

    const statusUpdateRes = await Product.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    if (statusUpdateRes.modifiedCount > 0) {
      console.log(`[Migration] Set default status of 'active' for ${statusUpdateRes.modifiedCount} legacy products.`);
    }
  } catch (err) {
    console.error("[Migration] Error updating legacy product defaults:", err);
  }

  console.log("[Migration] All migrations completed.");
}

module.exports = {
  runMigrations,
};
