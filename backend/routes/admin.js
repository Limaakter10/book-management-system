// ============================================================
// 📄 backend/routes/admin.js
// GET /api/admin/stats — full dashboard stats
// ============================================================

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

    // ── basic counts ─────────────────────────────────────────
    const totalUsers  = await User.countDocuments();
    const totalBooks  = await Book.countDocuments().catch(() => 0);
    const allOrders   = await Order.find({})
      .populate("userId", "email name")
      .populate("books.bookId", "title price category")
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders   = allOrders.length;
    const paidOrders    = allOrders.filter(o => ["paid","approved"].includes(o.status)).length;
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;

    // ✅ শুধু paid/approved orders এর revenue — pending/failed বাদ
    const totalRevenue  = allOrders
      .filter(o => ["paid","approved"].includes(o.status))
      .reduce((s, o) => s + Number(o.amount || 0), 0);

    // ── monthly / weekly (paid only) ─────────────────────────
    const monthlyUsers = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    const monthlySales = allOrders
      .filter(o => ["paid","approved"].includes(o.status) && new Date(o.createdAt) >= startOfMonth)
      .reduce((s, o) => s + Number(o.amount || 0), 0);

    const weeklySales = allOrders
      .filter(o => ["paid","approved"].includes(o.status) && new Date(o.createdAt) >= last7Days)
      .reduce((s, o) => s + Number(o.amount || 0), 0);

    // ── monthly revenue map (paid only) ──────────────────────
    const monthNames     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyRevenue = {};
    allOrders
      .filter(o => ["paid","approved"].includes(o.status))
      .forEach(o => {
        const key = monthNames[new Date(o.createdAt).getMonth()];
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(o.amount || 0);
      });

    // ── recent orders (last 6) ────────────────────────────────
    const recentOrders = allOrders.slice(0, 6).map(o => ({
      _id:       o._id,
      userId:    o.userId,
      amount:    o.amount,
      status:    o.status,
      createdAt: o.createdAt,
    }));

    // ── top books by revenue (paid only) ─────────────────────
    const bookMap = {};
    allOrders
      .filter(o => ["paid","approved"].includes(o.status))
      .forEach(o => {
        (o.books || []).forEach(b => {
          const title = b.title || b.bookId?.title || "Unknown";
          const price = Number(b.price || b.bookId?.price || 0);
          if (!bookMap[title]) bookMap[title] = { title, sales:0, revenue:0 };
          bookMap[title].sales++;
          bookMap[title].revenue += price;
        });
      });

    const topBooks = Object.values(bookMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // ── category stats ────────────────────────────────────────
    let categoryStats = [];
    try {
      categoryStats = await Book.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 6 },
      ]);
    } catch (_) {}

    // ── unread messages ───────────────────────────────────────
    let unreadMessages = 0;
    try {
      const Message = require("../models/Message");
      unreadMessages = await Message.countDocuments({ read: false });
    } catch (_) {}

    // ── respond ───────────────────────────────────────────────
    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,   // ✅ paid/approved only
      totalBooks,
      pendingOrders,
      paidOrders,
      monthlySales,
      weeklySales,
      monthlyUsers,
      monthlyRevenue,
      recentOrders,
      topBooks,
      categoryStats,
      unreadMessages,
      // legacy aliases
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