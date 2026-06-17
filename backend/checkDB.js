const mongoose = require("mongoose");
const Category = require("./models/Category");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/myntra");
    const categories = await Category.find();
    console.log("Found categories:", categories.length);
    categories.forEach(c => console.log("- " + c.name));
    await mongoose.disconnect();
}
check();
