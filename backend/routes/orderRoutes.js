const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");

// =======================================================
// ✅ APPROVE ORDER
// =======================================================
router.post("/approve/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔥 update status
    order.status = "approved";
    await order.save();

    // 🔥 add books to user library
    await User.findByIdAndUpdate(order.userId, {
      $addToSet: {
        library: { $each: order.books }
      }
    });

    res.json({
      success: true,
      message: "Order approved & books added"
    });

  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;