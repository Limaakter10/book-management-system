const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const User = require("../models/User");

// ================= CREATE ORDER =================
router.post("/init", async (req, res) => {
  try {
    const { userId, books, amount } = req.body;

    const order = await Order.create({
      userId,
      books,
      amount,
      status: "pending",
    });

    res.json({
      success: true,
      orderId: order._id,
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= SEND OTP =================
router.post("/send-otp", (req, res) => {
  res.json({ success: true });
});


// ================= VERIFY OTP =================
router.post("/verify-otp", (req, res) => {
  if (req.body.otp === "1234") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});


// ================= PAYMENT (FINAL STEP) =================
router.post("/pay", async (req, res) => {
  try {
    const { pin, orderId } = req.body;

    // 🔒 fake PIN check
    if (pin !== "12345") {
      return res.json({ success: false, message: "Wrong PIN" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // prevent duplicate payment
    if (order.status === "paid") {
      return res.json({ success: true, message: "Already paid" });
    }

    // ✅ mark as paid
    order.status = "paid";
    await order.save();

    // ✅ extract bookIds
    const bookIds = order.books.map(b => b.bookId);

    // ✅ add books to library
    await User.findByIdAndUpdate(order.userId, {
      $addToSet: {
        library: { $each: bookIds },
      },
    });

    res.json({
      success: true,
      message: "Payment successful & books added",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;