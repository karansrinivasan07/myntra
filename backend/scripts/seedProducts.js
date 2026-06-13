/**
 * seedProducts.js
 * ───────────────
 * Inserts 20 realistic Myntra-style products across 6 categories.
 * Run: node backend/scripts/seedProducts.js
 *
 * Distribution:
 *   Men (5) · Women (5) · Footwear (3) · Accessories (3) · Beauty (2) · Sports (2)
 * Tags:
 *   5 Featured · 5 Trending · 5 Best Sellers
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

/* ── Models ─────────────────────────────────────────────────── */
const Product  = require("../models/Product");
const Category = require("../models/Category");

/* ── Helpers ─────────────────────────────────────────────────── */
const pct = (orig, price) => `${Math.round(((orig - price) / orig) * 100)}% OFF`;

/* ── Product Definitions ─────────────────────────────────────── */
const PRODUCTS = [

  /* ═══════════════════════════ MEN (5) ═══════════════════════════ */
  {
    _category: "Men",
    name: "Slim Fit Oxford Shirt",
    brand: "Arrow",
    price: 1299,
    originalPrice: 2199,
    rating: 4.3,
    reviews: 1840,
    stock: 80,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Light Blue", "Navy"],
    tags: ["featured"],
    description: "Premium cotton Oxford shirt with a modern slim fit. Ideal for both office and smart-casual occasions. Features a button-down collar and subtle texture weave.",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Men",
    name: "Relaxed Fit Chino Pants",
    brand: "H&M",
    price: 1799,
    originalPrice: 2999,
    rating: 4.1,
    reviews: 932,
    stock: 60,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Khaki", "Olive", "Charcoal"],
    tags: ["trending"],
    description: "Versatile chino pants crafted from stretch cotton for all-day comfort. A wardrobe essential for modern men.",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Men",
    name: "Graphic Print Oversized Tee",
    brand: "Bewakoof",
    price: 449,
    originalPrice: 799,
    rating: 4.0,
    reviews: 3210,
    stock: 150,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Grey"],
    tags: ["trending", "bestseller"],
    description: "Bold graphic oversized tee made from 100% cotton. Drop-shoulder fit for a relaxed streetwear look.",
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Men",
    name: "Slim Fit Formal Blazer",
    brand: "Raymond",
    price: 4999,
    originalPrice: 8999,
    rating: 4.5,
    reviews: 670,
    stock: 35,
    sizes: ["38", "40", "42", "44"],
    colors: ["Navy", "Charcoal", "Black"],
    tags: ["featured", "bestseller"],
    description: "Impeccably tailored slim-fit blazer in premium wool blend. Perfect for formal events and business meetings.",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549062573-edc78a6a74e8?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Men",
    name: "Printed Linen Kurta",
    brand: "Fabindia",
    price: 1599,
    originalPrice: 2499,
    rating: 4.4,
    reviews: 1120,
    stock: 70,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Beige", "White", "Teal"],
    tags: ["bestseller"],
    description: "Handcrafted linen kurta with traditional block print. Lightweight and breathable — perfect for festive occasions.",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop",
    ],
  },

  /* ══════════════════════════ WOMEN (5) ══════════════════════════ */
  {
    _category: "Women",
    name: "Floral Wrap Midi Dress",
    brand: "AND",
    price: 1799,
    originalPrice: 3499,
    rating: 4.6,
    reviews: 2340,
    stock: 55,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Coral", "Teal", "Mauve"],
    tags: ["featured", "trending"],
    description: "Elegant wrap-style midi dress with an allover floral print. V-neck silhouette with a self-tie waist belt for a flattering feminine look.",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Women",
    name: "High-Waist Straight Jeans",
    brand: "Levi's",
    price: 2299,
    originalPrice: 3999,
    rating: 4.3,
    reviews: 1890,
    stock: 90,
    sizes: ["26", "28", "30", "32", "34"],
    colors: ["Light Wash", "Dark Indigo", "Black"],
    tags: ["bestseller"],
    description: "Classic straight-cut high-waist jeans in rigid denim. A timeless staple that pairs with everything from crop tops to blazers.",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Women",
    name: "Embroidered Anarkali Kurta",
    brand: "W",
    price: 2499,
    originalPrice: 4499,
    rating: 4.7,
    reviews: 980,
    stock: 40,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Magenta", "Royal Blue", "Mustard"],
    tags: ["featured"],
    description: "Stunning Anarkali kurta adorned with intricate zari embroidery. Made from premium georgette — perfect for weddings and festive wear.",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617917571552-20d2a25e5e19?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Women",
    name: "Ribbed Knit Co-ord Set",
    brand: "Zara",
    price: 2999,
    originalPrice: 4999,
    rating: 4.4,
    reviews: 1560,
    stock: 45,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Camel", "Cream", "Rust"],
    tags: ["trending"],
    description: "Chic ribbed knit co-ord set including a crop top and wide-leg trousers. Effortlessly stylish for both day and evening looks.",
    images: [
      "https://images.unsplash.com/photo-1618244972963-dbad0c4abf18?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Women",
    name: "Linen Blend Wide-Leg Trousers",
    brand: "Vero Moda",
    price: 1499,
    originalPrice: 2799,
    rating: 4.2,
    reviews: 720,
    stock: 65,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Beige", "Sage Green"],
    tags: ["bestseller"],
    description: "Breezy wide-leg trousers in a linen blend for a relaxed yet polished silhouette. Perfect for warm-weather dressing.",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4c0a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop",
    ],
  },

  /* ══════════════════════════ FOOTWEAR (3) ══════════════════════════ */
  {
    _category: "Footwear",
    name: "Air Cushion Running Shoes",
    brand: "Puma",
    price: 3999,
    originalPrice: 5999,
    rating: 4.5,
    reviews: 3400,
    stock: 100,
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"],
    colors: ["Black/White", "Grey/Neon", "Navy/Red"],
    tags: ["featured", "trending"],
    description: "High-performance running shoes with air-cushion midsole technology for superior shock absorption. Lightweight mesh upper for breathability.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Footwear",
    name: "Block Heel Ankle Boots",
    brand: "Steve Madden",
    price: 3499,
    originalPrice: 5499,
    rating: 4.3,
    reviews: 890,
    stock: 50,
    sizes: ["UK3", "UK4", "UK5", "UK6", "UK7"],
    colors: ["Black", "Tan", "Burgundy"],
    tags: ["bestseller"],
    description: "Versatile block-heel ankle boots in genuine leather with a side zip closure. Pairs perfectly with jeans, dresses, and everything in between.",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Footwear",
    name: "Canvas Low-Top Sneakers",
    brand: "Converse",
    price: 2799,
    originalPrice: 3999,
    rating: 4.6,
    reviews: 5200,
    stock: 120,
    sizes: ["UK4", "UK5", "UK6", "UK7", "UK8", "UK9", "UK10"],
    colors: ["White", "Black", "Red"],
    tags: ["trending", "bestseller"],
    description: "Iconic canvas low-top sneakers with a vulcanised rubber sole and cushioned insole. A timeless classic for any casual look.",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&auto=format&fit=crop",
    ],
  },

  /* ══════════════════════════ ACCESSORIES (3) ══════════════════════════ */
  {
    _category: "Accessories",
    name: "Leather Bifold Wallet",
    brand: "Baggit",
    price: 699,
    originalPrice: 1299,
    rating: 4.2,
    reviews: 2100,
    stock: 200,
    sizes: ["One Size"],
    colors: ["Brown", "Black", "Tan"],
    tags: ["featured"],
    description: "Slim bifold wallet crafted from genuine leather with RFID-blocking lining. Fits 8 card slots and a cash compartment.",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594913?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Accessories",
    name: "Polarised Aviator Sunglasses",
    brand: "Ray-Ban",
    price: 4999,
    originalPrice: 7999,
    rating: 4.7,
    reviews: 1650,
    stock: 60,
    sizes: ["One Size"],
    colors: ["Gold/Brown", "Silver/Grey", "Black/Green"],
    tags: ["bestseller"],
    description: "Classic aviator sunglasses with polarised lenses offering 100% UV protection. Lightweight metal frame with adjustable nose pads.",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Accessories",
    name: "Printed Canvas Tote Bag",
    brand: "Anouk",
    price: 499,
    originalPrice: 999,
    rating: 4.1,
    reviews: 880,
    stock: 180,
    sizes: ["One Size"],
    colors: ["Natural", "Black", "Navy"],
    tags: ["trending"],
    description: "Spacious canvas tote bag with a bold printed design. Features a zip-top closure and interior pocket. Perfect for shopping or everyday carry.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop",
    ],
  },

  /* ══════════════════════════ BEAUTY (2) ══════════════════════════ */
  {
    _category: "Beauty",
    name: "Matte Lipstick Set - 5 Shades",
    brand: "Maybelline",
    price: 799,
    originalPrice: 1499,
    rating: 4.4,
    reviews: 4800,
    stock: 300,
    sizes: ["One Size"],
    colors: ["Nude", "Red", "Burgundy", "Mauve", "Coral"],
    tags: ["featured", "bestseller"],
    description: "Long-lasting matte lipstick set with 5 carefully curated shades. 12-hour wear formula that stays comfortable and never dries out.",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4e6232bf2f31?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Beauty",
    name: "Vitamin C Brightening Serum",
    brand: "The Ordinary",
    price: 1199,
    originalPrice: 1999,
    rating: 4.6,
    reviews: 6200,
    stock: 250,
    sizes: ["30ml"],
    colors: ["N/A"],
    tags: ["trending"],
    description: "Potent 20% Vitamin C serum formulated to brighten skin tone, reduce dark spots, and boost collagen production. Suitable for all skin types.",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop",
    ],
  },

  /* ══════════════════════════ SPORTS (2) ══════════════════════════ */
  {
    _category: "Sports",
    name: "Dri-Fit Training T-Shirt",
    brand: "Nike",
    price: 1499,
    originalPrice: 2499,
    rating: 4.5,
    reviews: 2980,
    stock: 140,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Royal Blue", "White"],
    tags: ["featured", "trending"],
    description: "Nike Dri-FIT technology moves sweat away from the body for quicker evaporation, keeping you dry and comfortable during intense training sessions.",
    images: [
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&auto=format&fit=crop",
    ],
  },
  {
    _category: "Sports",
    name: "High-Waist Yoga Leggings",
    brand: "Adidas",
    price: 2199,
    originalPrice: 3499,
    rating: 4.6,
    reviews: 3750,
    stock: 110,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Dark Grey", "Plum"],
    tags: ["bestseller"],
    description: "Four-way stretch yoga leggings with a high-waist band for core support. Moisture-wicking AEROREADY technology keeps you comfortable through every pose.",
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&auto=format&fit=crop",
    ],
  },
];

/* ── Category name → ObjectId map ──────────────────────────────── */
async function getCategoryMap() {
  const cats = await Category.find({}, { name: 1 });
  const map = {};
  cats.forEach(c => { map[c.name] = c._id; });
  return map;
}

/* ── Main ───────────────────────────────────────────────────────── */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log("✅  MongoDB connected");

  const catMap = await getCategoryMap();
  console.log("📂  Categories found:", Object.keys(catMap).join(", "));

  // Skip products that already exist (by name + brand)
  const existing = await Product.find({}, { name: 1, brand: 1 });
  const existingSet = new Set(existing.map(p => `${p.name}|${p.brand}`));

  let inserted = 0;
  let skipped  = 0;

  for (const data of PRODUCTS) {
    const key = `${data.name}|${data.brand}`;
    if (existingSet.has(key)) {
      console.log(`  ⏭  Skipped (already exists): ${data.name}`);
      skipped++;
      continue;
    }

    const catId = catMap[data._category];
    const discountStr = pct(data.originalPrice, data.price);

    const doc = new Product({
      name:          data.name,
      brand:         data.brand,
      price:         data.price,
      discount:      discountStr,
      description:   data.description,
      sizes:         data.sizes,
      images:        data.images,
      stock:         data.stock,
      isDiscontinued: false,
      categories:    catId ? [catId] : [],
      // Extra metadata stored in description suffix (readable, no schema change)
    });

    await doc.save();
    console.log(`  ✅  Inserted [${data._category}]: ${data.name} (${data.brand}) — ₹${data.price} · ${discountStr}`);
    inserted++;
  }

  console.log(`\n🎉  Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
