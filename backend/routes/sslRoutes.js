const express = require("express");
const router = express.Router();
const SSLCommerzPayment = require("sslcommerz-lts");
const Order = require("../models/Order");
const User = require("../models/User");

// ================= CONFIG =================
const store_id = "readn69f8e2c970f3f";
const store_passwd = "readn69f8e2c970f3f@ssl";
const is_live = false;

// ✅ Local এ localhost, Production এ Render
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const BASE_URL = IS_PRODUCTION
  ? "https://book-management-system-ks6w.onrender.com"
  : "http://localhost:3000";

const FRONTEND_URL = IS_PRODUCTION
  ? "https://book-management-system-one-nu.vercel.app"
  : "http://localhost:5173";

// =======================================================
// ✅ TEST ROUTE
// =======================================================
router.get("/test", (req, res) => {
  res.send("SSL route working ✅");
});

// =======================================================
// ✅ INIT PAYMENT
// =======================================================
router.post("/init", async (req, res) => {
  try {
    console.log("📦 INIT called:", req.body);

    const { amount, userId, books } = req.body;

    if (!amount || !userId || !books) {
      return res.status(400).json({
        message: "Amount, userId and books are required",
      });
    }

    const tran_id = "TXN_" + Date.now().toString();
await Order.create({
  userId,
  books,
  amount,
  status: "failed",  // ✅ pending এর বদলে failed
  tranId: tran_id,
});

    const data = {
      total_amount: Number(amount),
      currency: "BDT",
      tran_id,

      success_url: `${BASE_URL}/api/ssl/success`,
      fail_url:    `${BASE_URL}/api/ssl/fail`,
      cancel_url:  `${BASE_URL}/api/ssl/cancel`,
      ipn_url:     `${BASE_URL}/api/ssl/ipn`,

      shipping_method:  "NO",
      product_name:     "Book",
      product_category: "Books",
      product_profile:  "general",

      cus_name:     "Customer",
      cus_email:    "customer@email.com",
      cus_phone:    "01700000000",
      cus_add1:     "Dhaka",
      cus_city:     "Dhaka",
      cus_postcode: "1219",
      cus_country:  "Bangladesh",

      ship_name:     "Customer",
      ship_add1:     "Dhaka",
      ship_city:     "Dhaka",
      ship_postcode: "1219",
      ship_country:  "Bangladesh",
    };

    console.log("🔗 BASE_URL:", BASE_URL);

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const response = await sslcz.init(data);

    console.log("📡 SSLCommerz response:", response?.GatewayPageURL);

    if (!response?.GatewayPageURL) {
      console.error("❌ No GatewayPageURL:", response);
      return res.status(500).json({
        message: "Payment URL not generated",
        details: response,
      });
    }

    res.json({ url: response.GatewayPageURL });

  } catch (err) {
    console.error("🔥 INIT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// 🔥 IPN
// =======================================================
router.post("/ipn", async (req, res) => {
  try {
    const tran_id = req.body.tran_id;
    const order = await Order.findOne({ tranId: tran_id });

    if (!order) return res.sendStatus(200);
    if (order.status === "paid") return res.sendStatus(200);

    order.status = "paid";
    await order.save();

    const bookIds = order.books.map((b) => b.bookId);
    await User.findByIdAndUpdate(order.userId, {
      $addToSet: { library: { $each: bookIds } },
    });

    console.log("✅ IPN: Books added to library");
    res.sendStatus(200);

  } catch (err) {
    console.error("IPN ERROR:", err);
    res.sendStatus(500);
  }
});

// =======================================================
// ✅ SUCCESS
// =======================================================
router.all("/success", async (req, res) => {
  try {
    const tran_id = req.body.tran_id || req.query.tran_id;
    const order = await Order.findOne({ tranId: tran_id });

    if (!order) {
      return res.redirect(`${FRONTEND_URL}/payment-fail`);
    }

    if (order.status !== "paid") {
      order.status = "paid";
      await order.save();

      const bookIds = order.books.map((b) => b.bookId);
      await User.findByIdAndUpdate(order.userId, {
        $addToSet: { library: { $each: bookIds } },
      });

      console.log("📚 SUCCESS: Books added to library");
    }

    res.redirect(`${FRONTEND_URL}/payment-success?tran_id=${tran_id}`);

  } catch (err) {
    console.error("SUCCESS ERROR:", err);
    res.redirect(`${FRONTEND_URL}/payment-fail`);
  }
});

// =======================================================
// ❌ FAIL
// =======================================================
router.all("/fail", (req, res) => {
  res.redirect(`${FRONTEND_URL}/payment-fail`);
});

// =======================================================
// 🚫 CANCEL
// =======================================================
router.all("/cancel", (req, res) => {
  res.redirect(`${FRONTEND_URL}/payment-cancel`);
});

module.exports = router;