const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const Order   = require("../models/Order");
const Book    = require("../models/Book");

router.get("/stats", async (req, res) => {
  try {
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days    = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments().catch(() => 0);

    const allOrders = await Order.find({})
      .populate("userId", "email name")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ শুধু paid + failed count — অন্য কিছু বাদ
    const paidOrders   = allOrders.filter(o => o.status === "paid").length;
    const failedOrders = allOrders.filter(o => o.status === "failed").length;
    const totalOrders  = paidOrders + failedOrders; // ✅ 142 + 5 = 147

    const totalRevenue = allOrders
      .filter(o => o.status === "paid")
      .reduce((s, o) => s + Number(o.amount || 0), 0);

    const monthlyUsers = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    const monthlySales = allOrders
      .filter(o => o.status === "paid" && new Date(o.createdAt) >= startOfMonth)
      .reduce((s, o) => s + Number(o.amount || 0), 0);

    const weeklySales = allOrders
      .filter(o => o.status === "paid" && new Date(o.createdAt) >= last7Days)
      .reduce((s, o) => s + Number(o.amount || 0), 0);

    const monthNames     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyRevenue = {};
    allOrders
      .filter(o => o.status === "paid")
      .forEach(o => {
        const key = monthNames[new Date(o.createdAt).getMonth()];
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(o.amount || 0);
      });

    // ✅ recent orders এও শুধু paid + failed
    const recentOrders = allOrders
      .filter(o => o.status === "paid" || o.status === "failed")
      .slice(0, 6)
      .map(o => ({
        _id:       o._id,
        userId:    o.userId,
        amount:    o.amount,
        status:    o.status,
        createdAt: o.createdAt,
      }));

    const bookMap = {};
    allOrders
      .filter(o => o.status === "paid")
      .forEach(o => {
        (o.books || []).forEach(b => {
          const title = b.title || "Unknown";
          const price = Number(b.price || 0);
          if (!bookMap[title]) bookMap[title] = { title, sales:0, revenue:0 };
          bookMap[title].sales++;
          bookMap[title].revenue += price;
        });
      });

    const topBooks = Object.values(bookMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    let categoryStats = [];
    try {
      categoryStats = await Book.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 6 },
      ]);
    } catch (_) {}

    let unreadMessages = 0;
    try {
      const Message  = require("../models/Message");
      unreadMessages = await Message.countDocuments({ isResolved: false });
    } catch (_) {}

    res.json({
      totalUsers,
      totalOrders,   // ✅ paid + failed only
      totalRevenue,
      totalBooks,
      paidOrders,
      failedOrders,
      pendingOrders: 0,
      monthlySales,
      weeklySales,
      monthlyUsers,
      monthlyRevenue,
      recentOrders,
      topBooks,
      categoryStats,
      unreadMessages,
      users:  totalUsers,
      orders: totalOrders,
      sales:  totalRevenue,
    });

  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;