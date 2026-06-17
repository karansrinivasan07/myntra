const Product = require("../models/Product");
const Category = require("../models/Category");
const Wishlist = require("../models/Wishlist");
const Order = require("../models/Order");
const BrowsingHistory = require("../models/BrowsingHistory");
const RecommendationCache = require("../models/RecommendationCache");

// Scoring Weights
const WEIGHT_CAT = 0.35;
const WEIGHT_WISH = 0.30;
const WEIGHT_HIST = 0.20;
const WEIGHT_POP = 0.15;
const WEIGHT_NEW = 0.10; // Additive boost weight

// Repeat purchase categories (case-insensitive checks)
const REPEAT_PURCHASE_CATEGORIES = [
  "beauty",
  "makeup",
  "skincare",
  "haircare",
  "fragrances",
  "personal care",
  "infants",
  "toys",
  "activewear"
];

// In-memory caching for database aggregations (valid for 5 minutes)
let popularityMapCache = null;
let maxPopularityScore = 0;
let cacheTimestamp = 0;

// In-memory caching for wishlist user sets (valid for 1 minute)
let wishlistMapCache = null; // productId -> Set of userIds
let wishlistCacheTimestamp = 0;

/**
 * Computes and caches product popularity scores.
 * popularity = (wishlistCount * 3) + (viewCount * 1) + (orderCount * 5)
 */
async function getPopularityMap() {
  const now = Date.now();
  if (popularityMapCache && (now - cacheTimestamp < 5 * 60 * 1000)) {
    return { popularityMap: popularityMapCache, maxScore: maxPopularityScore };
  }

  try {
    const popMap = {};

    // 1. Wishlist Counts
    const wishlistCounts = await Wishlist.aggregate([
      { $group: { _id: "$productId", count: { $sum: 1 } } }
    ]);
    wishlistCounts.forEach(item => {
      if (item._id) {
        popMap[item._id.toString()] = (popMap[item._id.toString()] || 0) + item.count * 3;
      }
    });

    // 2. Browsing History Counts
    const viewCounts = await BrowsingHistory.aggregate([
      { $group: { _id: "$productId", count: { $sum: 1 } } }
    ]);
    viewCounts.forEach(item => {
      if (item._id) {
        popMap[item._id.toString()] = (popMap[item._id.toString()] || 0) + item.count * 1;
      }
    });

    // 3. Order Quantity Counts
    const orderCounts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", count: { $sum: "$items.quantity" } } }
    ]);
    orderCounts.forEach(item => {
      if (item._id) {
        popMap[item._id.toString()] = (popMap[item._id.toString()] || 0) + item.count * 5;
      }
    });

    let maxScore = 0;
    Object.values(popMap).forEach(score => {
      if (score > maxScore) maxScore = score;
    });

    popularityMapCache = popMap;
    maxPopularityScore = maxScore;
    cacheTimestamp = now;

    return { popularityMap: popMap, maxScore };
  } catch (err) {
    console.error("Error calculating popularity map:", err);
    return { popularityMap: popularityMapCache || {}, maxScore: maxPopularityScore || 1 };
  }
}

/**
 * Retrieves and caches the sets of user IDs who wishlisted each product.
 */
async function getWishlistMap() {
  const now = Date.now();
  if (wishlistMapCache && (now - wishlistCacheTimestamp < 60 * 1000)) {
    return wishlistMapCache;
  }

  try {
    const wMap = {};
    const wishlists = await Wishlist.find({}, "userId productId");
    wishlists.forEach(item => {
      if (item.productId && item.userId) {
        const prodIdStr = item.productId.toString();
        const userIdStr = item.userId.toString();
        if (!wMap[prodIdStr]) {
          wMap[prodIdStr] = new Set();
        }
        wMap[prodIdStr].add(userIdStr);
      }
    });

    wishlistMapCache = wMap;
    wishlistCacheTimestamp = now;
    return wMap;
  } catch (err) {
    console.error("Error building wishlist map:", err);
    return wishlistMapCache || {};
  }
}

/**
 * Core scoring algorithm.
 */
async function getRecommendationsInternal(userId, currentProductId, limit = 10) {
  const now = Date.now();

  // 1. Load Categories and create reverse maps
  const categories = await Category.find();
  const categoryNamesMap = {}; // catId -> name
  categories.forEach(c => {
    categoryNamesMap[c._id.toString()] = c.name;
  });

  // 2. Fetch User Profile Data (Wishlist, History, Orders)
  let userWishlistIds = [];
  let userHistoryIds = [];
  let userCategories = new Set();
  let userBrands = {}; // brand -> count
  let userHistoryCategoryCounts = {}; // catId -> count
  let excludedProductIds = new Set();

  if (currentProductId) {
    excludedProductIds.add(currentProductId.toString());
  }

  if (userId) {
    // A. Wishlist
    const wishlists = await Wishlist.find({ userId });
    userWishlistIds = wishlists.map(w => w.productId.toString());
    userWishlistIds.forEach(id => excludedProductIds.add(id));

    // B. History
    const history = await BrowsingHistory.find({ userId }).sort({ viewedAt: -1 }).limit(50).populate("productId");
    userHistoryIds = history.map(h => h.productId?._id?.toString()).filter(Boolean);
    userHistoryIds.forEach(id => excludedProductIds.add(id));

    // C. Past Orders (Recent Purchase Exclusion)
    const orders = await Order.find({ userId });
    const purchasedProductIds = [];
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.productId) purchasedProductIds.push(item.productId.toString());
        });
      }
    });

    if (purchasedProductIds.length > 0) {
      // Find details of purchased products to check categories
      const purchasedProducts = await Product.find({ _id: { $in: purchasedProductIds } });
      purchasedProducts.forEach(prod => {
        const prodCategories = prod.categories || [];
        const isRepeatPurchase = prodCategories.some(catId => {
          const catName = categoryNamesMap[catId.toString()]?.toLowerCase();
          return catName && REPEAT_PURCHASE_CATEGORIES.includes(catName);
        });

        // Exclude only if it is NOT a repeat purchase category
        if (!isRepeatPurchase) {
          excludedProductIds.add(prod._id.toString());
        }
      });
    }

    // D. Extract user preferred categories and brands from history/wishlist details
    const wishlistProducts = await Product.find({ _id: { $in: userWishlistIds } });
    const historyProducts = history.map(h => h.productId).filter(Boolean);

    wishlistProducts.concat(historyProducts).forEach(prod => {
      if (prod.brand) {
        userBrands[prod.brand] = (userBrands[prod.brand] || 0) + 1;
      }
      if (prod.categories) {
        prod.categories.forEach(catId => {
          const catIdStr = catId.toString();
          userCategories.add(catIdStr);
          userHistoryCategoryCounts[catIdStr] = (userHistoryCategoryCounts[catIdStr] || 0) + 1;
        });
      }
    });
  }

  // 3. Load Current Product Categories
  let currentProductCategories = new Set();
  let currentProductBrand = null;
  if (currentProductId) {
    const currentProduct = await Product.findById(currentProductId);
    if (currentProduct) {
      currentProductBrand = currentProduct.brand;
      if (currentProduct.categories) {
        currentProduct.categories.forEach(catId => currentProductCategories.add(catId.toString()));
      }
    }
  }

  // Define target categories for similarity calculations
  let targetCategories = currentProductId ? currentProductCategories : userCategories;

  // 4. Candidate Generation
  const candidateIdsSet = new Set();

  // A. Products in target categories
  if (targetCategories.size > 0) {
    const productsInCats = await Product.find({
      categories: { $in: Array.from(targetCategories) },
      isDiscontinued: { $ne: true },
      stock: { $gt: 0 }
    }, "_id");
    productsInCats.forEach(p => candidateIdsSet.add(p._id.toString()));
  }

  // B. Fallback: Globally Popular Products (top 50)
  const { popularityMap, maxScore } = await getPopularityMap();
  const sortedPopularIds = Object.keys(popularityMap)
    .sort((a, b) => popularityMap[b] - popularityMap[a])
    .slice(0, 50);
  sortedPopularIds.forEach(id => candidateIdsSet.add(id));

  // Remove excluded products
  excludedProductIds.forEach(id => candidateIdsSet.delete(id));

  // If no candidates left, return empty list
  if (candidateIdsSet.size === 0) {
    return [];
  }

  // Fetch full details of candidates
  const candidates = await Product.find({
    _id: { $in: Array.from(candidateIdsSet) },
    isDiscontinued: { $ne: true },
    stock: { $gt: 0 }
  });

  const wishlistMap = await getWishlistMap();

  // 5. Score Candidates
  const scoredCandidates = candidates.map(prod => {
    const prodIdStr = prod._id.toString();
    const prodCategories = (prod.categories || []).map(c => c.toString());

    // A. Category Similarity (Jaccard similarity)
    let catSimilarity = 0;
    if (targetCategories.size > 0 && prodCategories.length > 0) {
      const intersection = prodCategories.filter(c => targetCategories.has(c));
      const union = new Set([...Array.from(targetCategories), ...prodCategories]);
      catSimilarity = intersection.length / union.size;
    }

    // B. Wishlist Overlap (Collaborative Filtering)
    let wishlistOverlap = 0;
    if (currentProductId) {
      const currWishlistUsers = wishlistMap[currentProductId.toString()] || new Set();
      const candWishlistUsers = wishlistMap[prodIdStr] || new Set();
      if (currWishlistUsers.size > 0 && candWishlistUsers.size > 0) {
        const intersection = Array.from(currWishlistUsers).filter(u => candWishlistUsers.has(u));
        const union = new Set([...Array.from(currWishlistUsers), ...Array.from(candWishlistUsers)]);
        wishlistOverlap = intersection.length / union.size;
      }
    } else if (userId && userWishlistIds.length > 0) {
      // User-based overlap score
      let scoreSum = 0;
      let matches = 0;
      const candWishlistUsers = wishlistMap[prodIdStr] || new Set();
      if (candWishlistUsers.size > 0) {
        userWishlistIds.forEach(wId => {
          const wUsers = wishlistMap[wId] || new Set();
          if (wUsers.size > 0) {
            const overlap = Array.from(wUsers).filter(u => candWishlistUsers.has(u)).length;
            scoreSum += overlap;
            matches++;
          }
        });
        wishlistOverlap = matches > 0 ? (scoreSum / matches) : 0;
      }
    }
    // Normalize wishlist overlap (cap at 1.0)
    wishlistOverlap = Math.min(1.0, wishlistOverlap);

    // C. Browsing History Similarity (Content-based)
    let historySimilarity = 0;
    if (userId && userHistoryIds.length > 0) {
      const historyLength = userHistoryIds.length;
      const brandCountInHistory = userHistoryIds.filter(id => {
        // Find if candidate brand matches history items (simplified content match)
        return prod.brand && userBrands[prod.brand];
      }).length;

      let catMatches = 0;
      prodCategories.forEach(c => {
        catMatches += userHistoryCategoryCounts[c] || 0;
      });

      const brandScore = brandCountInHistory / historyLength;
      const catScore = Math.min(1.0, catMatches / historyLength);
      historySimilarity = 0.5 * brandScore + 0.5 * catScore;
    }

    // D. Popularity (Normalized)
    const rawPop = popularityMap[prodIdStr] || 0;
    const popularityScore = maxScore > 0 ? (rawPop / maxScore) : 0;

    // E. New Product Boost
    let newProductBoost = 0;
    if (prod.createdAt) {
      const ageInMs = now - new Date(prod.createdAt).getTime();
      const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
      if (ageInDays <= 7) {
        newProductBoost = Math.max(0, 1.0 - (ageInDays / 7));
      }
    }

    // Weighted Score
    const finalScore =
      (catSimilarity * WEIGHT_CAT) +
      (wishlistOverlap * WEIGHT_WISH) +
      (historySimilarity * WEIGHT_HIST) +
      (popularityScore * WEIGHT_POP) +
      (newProductBoost * WEIGHT_NEW);

    return {
      product: prod,
      score: finalScore,
      brand: prod.brand,
      categories: prodCategories
    };
  });

  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // 6. Diversity Filtering: Max 2 per brand, Max 3 per category
  const finalRecommendations = [];
  const brandCounts = {};
  const categoryCounts = {};

  for (const candidate of scoredCandidates) {
    const { product, brand, categories: prodCats } = candidate;

    // Check brand diversity constraint
    if (brand) {
      const bCount = brandCounts[brand] || 0;
      if (bCount >= 2) continue;
    }

    // Check category diversity constraint
    let catExceeded = false;
    for (const c of prodCats) {
      const cCount = categoryCounts[c] || 0;
      if (cCount >= 3) {
        catExceeded = true;
        break;
      }
    }
    if (catExceeded) continue;

    // Add to recommendation list
    finalRecommendations.push(product);

    // Update counts
    if (brand) {
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    }
    prodCats.forEach(c => {
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    });

    if (finalRecommendations.length >= limit) {
      break;
    }
  }

  return finalRecommendations;
}

/**
 * Fetches recommendations, utilizing cache if available.
 */
async function getRecommendations(userId, currentProductId, limit = 10) {
  try {
    const cacheKey = {
      userId: userId || null,
      currentProductId: currentProductId || null
    };

    // Check cache
    const cacheEntry = await RecommendationCache.findOne(cacheKey);
    if (cacheEntry && Array.isArray(cacheEntry.recommendations) && cacheEntry.recommendations.length > 0) {
      // Validate cached items still exist, are not discontinued, and are in stock
      const populatedProducts = await Product.find({
        _id: { $in: cacheEntry.recommendations },
        isDiscontinued: { $ne: true },
        stock: { $gt: 0 }
      });

      // Maintain original cached sort order
      const productMap = {};
      populatedProducts.forEach(p => {
        productMap[p._id.toString()] = p;
      });

      const orderedRecommendations = cacheEntry.recommendations
        .map(id => productMap[id.toString()])
        .filter(Boolean);

      if (orderedRecommendations.length > 0) {
        return orderedRecommendations;
      }
    }

    // Cache miss or empty cache: compute recommendations
    let recommendations = await getRecommendationsInternal(userId, currentProductId, limit);

    if (recommendations.length === 0) {
      recommendations = await getPopularProductsFallback(limit);
    }

    // Save recommendations to cache (if any found)
    if (recommendations.length > 0) {
      const recIds = recommendations.map(r => r._id);
      await RecommendationCache.findOneAndUpdate(
        cacheKey,
        {
          $set: {
            recommendations: recIds,
            algorithmVersion: "v1",
            createdAt: new Date() // resets TTL index timer
          }
        },
        { upsert: true, new: true }
      );
    }

    return recommendations;
  } catch (err) {
    console.error("Error in getRecommendations:", err);
    // Fallback strategy: return popular items on error
    return await getPopularProductsFallback(limit);
  }
}

/**
 * Fallback to popular products in stock.
 */
async function getPopularProductsFallback(limit = 10) {
  try {
    const { popularityMap } = await getPopularityMap();
    const sortedPopularIds = Object.keys(popularityMap)
      .sort((a, b) => popularityMap[b] - popularityMap[a]);

    if (sortedPopularIds.length > 0) {
      const popularProducts = await Product.find({
        _id: { $in: sortedPopularIds },
        isDiscontinued: { $ne: true },
        stock: { $gt: 0 }
      });

      const productMap = {};
      popularProducts.forEach(p => {
        productMap[p._id.toString()] = p;
      });

      const result = sortedPopularIds
        .map(id => productMap[id])
        .filter(Boolean)
        .slice(0, limit);

      if (result.length > 0) {
        return result;
      }
    }

    // Ultimate fallback: return latest in stock products
    return await Product.find({ isDiscontinued: { $ne: true }, stock: { $gt: 0 } }).limit(limit);
  } catch (err) {
    console.error("Popular fallback query failed:", err);
    // Ultimate fallback: return latest in stock products
    return await Product.find({ isDiscontinued: { $ne: true }, stock: { $gt: 0 } }).limit(limit);
  }
}

/**
 * Invalidates cache entries containing a specific product.
 */
async function invalidateProduct(productId) {
  if (!productId) return;
  try {
    const prodIdStr = productId.toString();
    const result = await RecommendationCache.deleteMany({
      $or: [
        { currentProductId: productId },
        { recommendations: productId }
      ]
    });
    if (result.deletedCount > 0) {
      console.log(`[Cache Invalidation] Cleared ${result.deletedCount} cache entries for product ${prodIdStr}`);
    }
  } catch (err) {
    console.error(`Error invalidating cache for product ${productId}:`, err);
  }
}

module.exports = {
  getRecommendations,
  getPopularProductsFallback,
  invalidateProduct
};
