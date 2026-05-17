const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Order = require("../models/Order");

router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();

    const allOrders = await Order.find({});

    const orders = allOrders.length;

    const sales = allOrders.reduce((sum, o) => {
      return sum + Number(o.amount || 0);
    }, 0);

    const paidOrders = allOrders.filter(o => o.status === "paid").length;

    // DATE
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 7);

    // MONTHLY USERS
    const monthlyUsers = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // MONTHLY SALES
    const monthlySales = allOrders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    // WEEKLY SALES
    const weeklySales = allOrders
      .filter(o => new Date(o.createdAt) >= last7Days)
      .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    res.json({
      users,
      orders,
      sales,
      monthlyUsers,
      monthlySales,
      weeklySales,
      paidOrders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;