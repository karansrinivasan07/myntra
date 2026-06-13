/**
 * seedAll.js
 * ──────────
 * 1. Ensures all 7 categories exist (Men, Women, Kids, Beauty, Footwear, Accessories, Sports)
 * 2. Inserts 20 realistic products, skipping any that already exist
 *
 * Run: node backend/scripts/seedAll.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product  = require("../models/Product");

/* ─────────────────────────── Categories ─────────────────────────── */
const CATEGORIES = [
  {
    name: "Men",
    subcategory: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Suits", "Kurtas", "Activewear"],
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop",
  },
  {
    name: "Women",
    subcategory: ["Dresses", "Tops", "Ethnic Wear", "Western Wear", "Jeans", "Co-ords", "Activewear"],
    image: "https://images.unsplash.com/photo-1618244972963-dbad0c4abf18?w=500&auto=format&fit=crop",
  },
  {
    name: "Kids",
    subcategory: ["Boys Clothing", "Girls Clothing", "Infants", "Toys", "School Essentials"],
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop",
  },
  {
    name: "Beauty",
    subcategory: ["Makeup", "Skincare", "Haircare", "Fragrances", "Personal Care"],
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
  },
  {
    name: "Footwear",
    subcategory: ["Sneakers", "Heels", "Boots", "Sandals", "Formal Shoes", "Sports Shoes"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
  },
  {
    name: "Accessories",
    subcategory: ["Bags", "Wallets", "Sunglasses", "Watches", "Jewellery", "Belts"],
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop",
  },
  {
    name: "Sports",
    subcategory: ["Running", "Yoga", "Gym & Fitness", "Cricket", "Football", "Swimming"],
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=500&auto=format&fit=crop",
  },
];

/* ─────────────────────────── Products ───────────────────────────── */
const pct = (orig, price) => `${Math.round(((orig - price) / orig) * 100)}% OFF`;

const PRODUCTS = [
  /* ── Men (5) ── */
  {
    _cat: "Men",
    name: "Slim Fit Oxford Shirt",
    brand: "Arrow",
    price: 1299, orig: 2199,
    stock: 80,
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Premium cotton Oxford shirt with a modern slim fit. Ideal for both office and smart-casual occasions. Features button-down collar and subtle texture weave.",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Men",
    name: "Relaxed Fit Chino Pants",
    brand: "H&M",
    price: 1799, orig: 2999,
    stock: 60,
    sizes: ["28", "30", "32", "34", "36"],
    description: "Versatile chino pants crafted from stretch cotton for all-day comfort. A wardrobe essential for modern men. Available in earthy tones.",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Men",
    name: "Graphic Print Oversized Tee",
    brand: "Bewakoof",
    price: 449, orig: 799,
    stock: 150,
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Bold graphic oversized tee made from 100% cotton. Drop-shoulder fit for a relaxed streetwear look. Machine washable.",
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Men",
    name: "Slim Fit Formal Blazer",
    brand: "Raymond",
    price: 4999, orig: 8999,
    stock: 35,
    sizes: ["38", "40", "42", "44"],
    description: "Impeccably tailored slim-fit blazer in premium wool blend. Perfect for formal events and business meetings with a polished silhouette.",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549062573-edc78a6a74e8?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Men",
    name: "Printed Linen Kurta",
    brand: "Fabindia",
    price: 1599, orig: 2499,
    stock: 70,
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Handcrafted linen kurta with traditional block print. Lightweight and breathable — perfect for festive occasions and casual outings.",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop",
    ],
  },

  /* ── Women (5) ── */
  {
    _cat: "Women",
    name: "Floral Wrap Midi Dress",
    brand: "AND",
    price: 1799, orig: 3499,
    stock: 55,
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Elegant wrap-style midi dress with allover floral print. V-neck silhouette with self-tie waist belt for a flattering feminine look.",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Women",
    name: "High-Waist Straight Jeans",
    brand: "Levi's",
    price: 2299, orig: 3999,
    stock: 90,
    sizes: ["26", "28", "30", "32", "34"],
    description: "Classic straight-cut high-waist jeans in rigid denim. A timeless staple that pairs with everything from crop tops to blazers.",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Women",
    name: "Embroidered Anarkali Kurta",
    brand: "W",
    price: 2499, orig: 4499,
    stock: 40,
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Stunning Anarkali kurta adorned with intricate zari embroidery. Made from premium georgette — perfect for weddings and festive wear.",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617917571552-20d2a25e5e19?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Women",
    name: "Ribbed Knit Co-ord Set",
    brand: "Zara",
    price: 2999, orig: 4999,
    stock: 45,
    sizes: ["XS", "S", "M", "L"],
    description: "Chic ribbed knit co-ord set including crop top and wide-leg trousers. Effortlessly stylish for both day and evening looks.",
    images: [
      "https://images.unsplash.com/photo-1618244972963-dbad0c4abf18?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Women",
    name: "Linen Blend Wide-Leg Trousers",
    brand: "Vero Moda",
    price: 1499, orig: 2799,
    stock: 65,
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Breezy wide-leg trousers in linen blend for a relaxed yet polished silhouette. Perfect for warm-weather dressing.",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4c0a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop",
    ],
  },

  /* ── Footwear (3) ── */
  {
    _cat: "Footwear",
    name: "Air Cushion Running Shoes",
    brand: "Puma",
    price: 3999, orig: 5999,
    stock: 100,
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"],
    description: "High-performance running shoes with air-cushion midsole for superior shock absorption. Lightweight mesh upper for breathability.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Footwear",
    name: "Block Heel Ankle Boots",
    brand: "Steve Madden",
    price: 3499, orig: 5499,
    stock: 50,
    sizes: ["UK3", "UK4", "UK5", "UK6", "UK7"],
    description: "Versatile block-heel ankle boots in genuine leather with a side zip closure. Pairs perfectly with jeans, dresses, and everything in between.",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Footwear",
    name: "Canvas Low-Top Sneakers",
    brand: "Converse",
    price: 2799, orig: 3999,
    stock: 120,
    sizes: ["UK4", "UK5", "UK6", "UK7", "UK8", "UK9", "UK10"],
    description: "Iconic canvas low-top sneakers with vulcanised rubber sole and cushioned insole. A timeless classic for any casual look.",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&auto=format&fit=crop",
    ],
  },

  /* ── Accessories (3) ── */
  {
    _cat: "Accessories",
    name: "Leather Bifold Wallet",
    brand: "Baggit",
    price: 699, orig: 1299,
    stock: 200,
    sizes: ["One Size"],
    description: "Slim bifold wallet crafted from genuine leather with RFID-blocking lining. Fits 8 card slots and a cash compartment.",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594913?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Accessories",
    name: "Polarised Aviator Sunglasses",
    brand: "Ray-Ban",
    price: 4999, orig: 7999,
    stock: 60,
    sizes: ["One Size"],
    description: "Classic aviator sunglasses with polarised lenses offering 100% UV protection. Lightweight metal frame with adjustable nose pads.",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Accessories",
    name: "Printed Canvas Tote Bag",
    brand: "Anouk",
    price: 499, orig: 999,
    stock: 180,
    sizes: ["One Size"],
    description: "Spacious canvas tote bag with a bold printed design. Features a zip-top closure and interior pocket. Perfect for shopping or everyday carry.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop",
    ],
  },

  /* ── Beauty (2) ── */
  {
    _cat: "Beauty",
    name: "Matte Lipstick Set - 5 Shades",
    brand: "Maybelline",
    price: 799, orig: 1499,
    stock: 300,
    sizes: ["One Size"],
    description: "Long-lasting matte lipstick set with 5 carefully curated shades. 12-hour wear formula that stays comfortable and never dries out.",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4e6232bf2f31?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Beauty",
    name: "Vitamin C Brightening Serum",
    brand: "The Ordinary",
    price: 1199, orig: 1999,
    stock: 250,
    sizes: ["30ml"],
    description: "Potent 20% Vitamin C serum formulated to brighten skin tone, reduce dark spots, and boost collagen production. Suitable for all skin types.",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop",
    ],
  },

  /* ── Sports (2) ── */
  {
    _cat: "Sports",
    name: "Dri-Fit Training T-Shirt",
    brand: "Nike",
    price: 1499, orig: 2499,
    stock: 140,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Nike Dri-FIT technology moves sweat away from the body for quicker evaporation, keeping you dry and comfortable during intense training sessions.",
    images: [
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&auto=format&fit=crop",
    ],
  },
  {
    _cat: "Sports",
    name: "High-Waist Yoga Leggings",
    brand: "Adidas",
    price: 2199, orig: 3499,
    stock: 110,
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Four-way stretch yoga leggings with high-waist band for core support. Moisture-wicking AEROREADY technology keeps you comfortable through every pose.",
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&auto=format&fit=crop",
    ],
  },
];

/* ─────────────────────────── Main ───────────────────────────────── */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log("\n✅  MongoDB connected\n");

  /* 1. Upsert categories */
  console.log("📂  Ensuring categories...");
  const catMap = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: { name: cat.name, subcategory: cat.subcategory, image: cat.image } },
      { upsert: true, new: true }
    );
    catMap[cat.name] = doc._id;
    console.log(`    ✔  ${cat.name} (${doc._id})`);
  }

  /* 2. Insert products */
  console.log("\n📦  Seeding products...");
  const existing = await Product.find({}, { name: 1, brand: 1 });
  const existingSet = new Set(existing.map(p => `${p.name}||${p.brand}`));

  let inserted = 0, skipped = 0;

  for (const p of PRODUCTS) {
    const key = `${p.name}||${p.brand}`;
    if (existingSet.has(key)) {
      console.log(`    ⏭  Skip (exists): ${p.name}`);
      skipped++;
      continue;
    }

    const doc = new Product({
      name:          p.name,
      brand:         p.brand,
      price:         p.price,
      discount:      pct(p.orig, p.price),
      description:   p.description,
      sizes:         p.sizes,
      images:        p.images,
      stock:         p.stock,
      isDiscontinued: false,
      categories:    catMap[p._cat] ? [catMap[p._cat]] : [],
    });

    await doc.save();
    console.log(`    ✅  [${p._cat}] ${p.name} (${p.brand}) — ₹${p.price} · ${pct(p.orig, p.price)}`);
    inserted++;
  }

  console.log(`\n🎉  Seed complete! Inserted: ${inserted}, Skipped (already existed): ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
