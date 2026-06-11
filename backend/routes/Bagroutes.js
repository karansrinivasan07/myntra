const express = require("express");
const Bag = require("../models/Bag");
const Product = require("../models/Product");
const router = express.Router();
const { emitCartItemAdded } = require("../services/notificationEvents");

router.post("/", async (req, res) => {
  try {
    const Bags = new Bag(req.body);
    const saveitem = await Bags.save();

    // Emit cart abandonment event — schedules a reminder 2 hours from now
    if (req.body.userId && req.body.productId) {
      try {
        const product = await Product.findById(req.body.productId);
        emitCartItemAdded(req.body.userId, product?.name || "");
      } catch (e) {
        // Non-critical — don't fail the bag operation
        emitCartItemAdded(req.body.userId, "");
      }
    }

    res.status(200).json(saveitem);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:userid", async (req, res) => {
  try {
    const bag = await Bag.find({ userId: req.params.userid }).populate(
      "productId"
    );
    res.status(200).json(bag);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error removing item from bag" });
  }
});
module.exports = router;
