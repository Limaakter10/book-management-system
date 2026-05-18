// ============================================================
// FILE: src/pages/admin/Dashboard.jsx
// PURPOSE: Professional Admin Dashboard for ReadNOVA
//
// SECTIONS:
//   1. Header with greeting + download report
//   2. Stat cards (Users, Orders, Revenue, Weekly)
//   3. Revenue chart (SVG bar chart — no library needed)
//   4. Recent Orders table
//   5. Top Books & Category breakdown
//   6. Quick action cards
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

// ── Spinner ───────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                height: "100vh", background: "#f0f8ff" }}>
    <div style={{ width: 48, height: 48, border: "5px solid #dde8f0",
                  borderTopColor: "#1a6b7c", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ title, value, icon, sub, color, trend }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px",
                border: "1px solid #dde8f0",
                boxShadow: "0 2px 12px rgba(26,107,124,0.07)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default" }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,107,124,0.13)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,107,124,0.07)"; }}>

    {/* Icon circle */}
    <div style={{ width: 50, height: 50, borderRadius: 14,
                  background: `${color}18`, border: `1.5px solid ${color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", marginBottom: 14 }}>
      {icon}
    </div>

    <div style={{ fontSize: "0.78rem", color: "#9ca3af", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: 4 }}>
      {title}
    </div>

    <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#1a1a1a",
                  fontFamily: "Georgia,serif", lineHeight: 1.1 }}>
      {value}
    </div>

    {sub && (
      <div style={{ fontSize: "0.78rem", color: trend === "up" ? "#10b981" : "#9ca3af",
                    marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
        {trend === "up" ? "▲" : trend === "down" ? "▼" : "●"} {sub}
      </div>
    )}
  </div>
);

// ── SVG Bar Chart (no library needed) ─────────────────────────
const BarChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 560, H = 180, PAD = 40;
  const barW = Math.floor((W - PAD * 2) / data.length) - 8;

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "24px",
                  border: "1px solid #dde8f0",
                  boxShadow: "0 2px 12px rgba(26,107,124,0.07)" }}>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1rem",
                   fontWeight: 700, color: "#1a1a1a", marginBottom: 18 }}>
        {title}
      </h3>
      <svg viewBox={`0 0 ${W} ${H + 40}`} width="100%" style={{ overflow: "visible" }}>
        {/* Y axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={PAD} y1={H - H * f} x2={W - PAD} y2={H - H * f}
                  stroke="#f3f4f6" strokeWidth="1"/>
            <text x={PAD - 6} y={H - H * f + 4} textAnchor="end"
                  fontSize="9" fill="#9ca3af">
              {Math.round(max * f)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const x  = PAD + i * ((W - PAD * 2) / data.length) + 4;
          const bh = Math.max(4, (d.value / max) * H);
          const y  = H - bh;
          return (
            <g key={i}>
              {/* Bar background (light) */}
              <rect x={x} y={0} width={barW} height={H}
                    fill="#f0f8ff" rx={6}/>
              {/* Filled bar */}
              <rect x={x} y={y} width={barW} height={bh}
                    fill="url(#barGrad)" rx={6}/>
              {/* Value label */}
              <text x={x + barW / 2} y={y - 5} textAnchor="middle"
                    fontSize="9" fontWeight="700" fill="#1a6b7c">
                {d.value > 0 ? `৳${d.value}` : ""}
              </text>
              {/* X label */}
              <text x={x + barW / 2} y={H + 18} textAnchor="middle"
                    fontSize="9.5" fill="#6b7280">
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Gradient def */}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a6b7c" stopOpacity="1"/>
            <stop offset="100%" stopColor="#0f3d47" stopOpacity="0.9"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Placed     : { bg: "#eff6ff", color: "#1d4ed8" },
    Processing : { bg: "#fffbeb", color: "#92400e" },
    Shipped    : { bg: "#f0fdf4", color: "#166534" },
    Delivered  : { bg: "#dcfce7", color: "#14532d" },
    Cancelled  : { bg: "#fff1f2", color: "#9f1239" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem",
                   fontWeight: 700, background: s.bg, color: s.color,
                   whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [time,    setTime]    = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/admin/stats");
        setStats(res.data.stats || res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        // Use mock data so dashboard still renders
        setStats({
          totalUsers   : 0,
          totalOrders  : 0,
          totalRevenue : 0,
          totalBooks   : 0,
          pendingOrders: 0,
          monthlySales : 0,
          weeklySales  : 0,
          paidOrders   : 0,
          monthlyUsers : 0,
          monthlyRevenue: {},
          recentOrders : [],
          topBooks     : [],
          categoryStats: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  // ── Derived values ───────────────────────────────────────────
  const totalRevenue  = stats?.totalRevenue  || stats?.sales  || 0;
  const totalOrders   = stats?.totalOrders   || stats?.orders || 0;
  const totalUsers    = stats?.totalUsers    || stats?.users  || 0;
  const totalBooks    = stats?.totalBooks    || 0;
  const pendingOrders = stats?.pendingOrders || 0;
  const weeklySales   = stats?.weeklySales   || 0;
  const monthlyUsers  = stats?.monthlyUsers  || 0;
  const paidOrders    = stats?.paidOrders    || 0;

  const avgOrder       = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;
  const conversionRate = totalOrders > 0
    ? ((paidOrders / totalOrders) * 100).toFixed(1)
    : 0;

  // Build bar chart data from monthlyRevenue object
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData  = Object.entries(stats?.monthlyRevenue || {}).map(([label, value]) => ({
    label,
    value: Math.round(value),
  })).slice(-7); // last 7 months

  // If no monthly data, use mock
  const finalChart = chartData.length > 0 ? chartData : monthNames.slice(0, 7).map(m => ({
    label: m, value: 0,
  }));

  const recentOrders = stats?.recentOrders || [];
  const topBooks     = stats?.topBooks     || [];
  const categories   = stats?.categoryStats || [];

  // ── Download CSV report ──────────────────────────────────────
  const downloadReport = () => {
    const now = new Date().toLocaleString("en-BD");
    const rows = [
      ["ReadNOVA Admin Report", now],
      [],
      ["Metric", "Value"],
      ["Total Users",    totalUsers],
      ["Total Orders",   totalOrders],
      ["Total Revenue",  `৳${totalRevenue}`],
      ["Total Books",    totalBooks],
      ["Pending Orders", pendingOrders],
      ["Weekly Sales",   `৳${weeklySales}`],
      ["Avg Order Value",`৳${avgOrder}`],
      ["Conversion Rate",`${conversionRate}%`],
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ReadNOVA-Report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Greeting ─────────────────────────────────────────────────
  const hour = time.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const dateStr = time.toLocaleDateString("en-BD", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = time.toLocaleTimeString("en-BD", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif",
                  background: "#f0f8ff", minHeight: "100vh",
                  padding: "0 0 48px" }}>

      {/* ────────────────────────────────────────────────────
          HEADER
      ──────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg,#1a6b7c 0%,#0f3d47 100%)",
                    padding: "28px 32px", position: "relative", overflow: "hidden" }}>

        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 180,
                      height: 180, borderRadius: "50%",
                      background: "rgba(245,166,35,0.12)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: -50, left: "40%", width: 140,
                      height: 140, borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)", pointerEvents: "none" }}/>

        <div style={{ position: "relative", zIndex: 1, display: "flex",
                      alignItems: "center", justifyContent: "space-between",
                      flexWrap: "wrap", gap: 16 }}>

          {/* Left: greeting */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)",
                           letterSpacing: "0.06em", textTransform: "uppercase",
                           marginBottom: 4 }}>
              {greeting} 👋
            </div>
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.5rem,3vw,2rem)",
                          fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              Admin Dashboard
            </h1>
            <div style={{ display: "flex", gap: 16, fontSize: "0.82rem",
                           color: "rgba(255,255,255,0.65)" }}>
              <span>📅 {dateStr}</span>
              <span>🕐 {timeStr}</span>
            </div>
          </div>

          {/* Right: buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={downloadReport} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", background: "#f5a623", color: "#1a1a1a",
              border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer",
              fontFamily: "inherit", fontSize: "0.875rem",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#e09b1a"}
              onMouseLeave={e => e.currentTarget.style.background = "#f5a623"}>
              ⬇️ Download Report
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>

        {/* ────────────────────────────────────────────────────
            STAT CARDS  (4 columns)
        ──────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
                       gap: 16, marginBottom: 24 }}>
          <StatCard title="Total Users"    value={totalUsers}
            icon="👥" color="#1a6b7c"
            sub={`+${monthlyUsers} this month`} trend="up"/>
          <StatCard title="Total Orders"   value={totalOrders}
            icon="📦" color="#7c3aed"
            sub={`${pendingOrders} pending`} trend=""/>
          <StatCard title="Total Revenue"  value={`৳${totalRevenue.toLocaleString()}`}
            icon="💰" color="#059669"
            sub={`৳${weeklySales.toLocaleString()} this week`} trend="up"/>
          <StatCard title="Total Books"    value={totalBooks}
            icon="📚" color="#f5a623"
            sub="In catalogue" trend=""/>
        </div>

        {/* ────────────────────────────────────────────────────
            SECONDARY STATS ROW
        ──────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
                       gap: 16, marginBottom: 24 }}>
          {[
            { label: "Avg Order Value", val: `৳${avgOrder}`, icon: "📊" },
            { label: "Conversion Rate", val: `${conversionRate}%`, icon: "📈" },
            { label: "Paid Orders",     val: paidOrders, icon: "✅" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14,
                                         padding: "18px 20px",
                                         border: "1px solid #dde8f0",
                                         boxShadow: "0 1px 6px rgba(26,107,124,0.05)",
                                         display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: "1.8rem" }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a1a1a",
                               fontFamily: "Georgia,serif" }}>{s.val}</div>
                <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ────────────────────────────────────────────────────
            REVENUE CHART + CATEGORY BREAKDOWN
        ──────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px",
                       gap: 20, marginBottom: 24 }}>

          {/* Bar chart */}
          <BarChart data={finalChart} title="📊 Monthly Revenue (৳)"/>

          {/* Category breakdown */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px",
                        border: "1px solid #dde8f0",
                        boxShadow: "0 2px 12px rgba(26,107,124,0.07)" }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1rem",
                          fontWeight: 700, color: "#1a1a1a", marginBottom: 18 }}>
              📂 Books by Category
            </h3>
            {categories.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "24px 0",
                             fontSize: "0.85rem" }}>
                No category data yet
              </div>
            ) : (
              categories.map((cat, i) => {
                const maxCount = Math.max(...categories.map(c => c.count), 1);
                const pct      = Math.round((cat.count / maxCount) * 100);
                const colors   = ["#1a6b7c","#f5a623","#10b981","#7c3aed","#e94560","#3b82f6"];
                const col      = colors[i % colors.length];
                return (
                  <div key={cat._id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                                   marginBottom: 5, fontSize: "0.82rem" }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        {cat._id || "General"}
                      </span>
                      <span style={{ color: col, fontWeight: 700 }}>{cat.count}</span>
                    </div>
                    <div style={{ height: 7, background: "#f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`,
                                     background: col, borderRadius: 10,
                                     transition: "width 0.6s ease" }}/>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────
            RECENT ORDERS + TOP BOOKS  (2 columns)
        ──────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px",
                       gap: 20, marginBottom: 24 }}>

          {/* Recent Orders Table */}
          <div style={{ background: "#fff", borderRadius: 16,
                        border: "1px solid #dde8f0",
                        boxShadow: "0 2px 12px rgba(26,107,124,0.07)",
                        overflow: "hidden" }}>

            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f3f4f6",
                           display: "flex", justifyContent: "space-between",
                           alignItems: "center" }}>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1rem",
                            fontWeight: 700, color: "#1a1a1a" }}>
                📦 Recent Orders
              </h3>
              <Link to="/admin/orders"
                    style={{ fontSize: "0.8rem", fontWeight: 700,
                              color: "#1a6b7c", textDecoration: "none" }}>
                View all →
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse",
                               minWidth: "560px" }}>
                <thead>
                  <tr style={{ background: "#f7fbfc" }}>
                    {["Order ID","Customer","Email","Date","Amount","Status"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left",
                                            fontSize: "10px", fontWeight: 700,
                                            color: "#9ca3af", textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            borderBottom: "1px solid #f3f4f6",
                                            whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "32px",
                                                color: "#9ca3af", fontSize: "0.85rem" }}>
                        No recent orders
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, idx) => {
                      const date = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                            day: "2-digit", month: "short", year: "numeric"
                          })
                        : "—";
                      return (
                        <tr key={order._id}
                            style={{ borderBottom: "1px solid #f9fafb",
                                      background: idx % 2 === 0 ? "#fff" : "#fafcfd" }}>
                          {/* Order ID */}
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "0.75rem",
                                            fontWeight: 700, color: "#1a6b7c",
                                            background: "#eef6f8", padding: "2px 7px",
                                            borderRadius: 5 }}>
                              #{order._id?.slice(-7).toUpperCase()}
                            </span>
                          </td>
                          {/* Name */}
                          <td style={{ padding: "10px 14px", fontSize: "0.82rem",
                                        fontWeight: 600, color: "#1a1a1a",
                                        whiteSpace: "nowrap" }}>
                            {order.user?.name || "—"}
                          </td>
                          {/* Email */}
                          <td style={{ padding: "10px 14px", fontSize: "0.78rem",
                                        color: "#1a6b7c", whiteSpace: "nowrap" }}>
                            {order.user?.email || "—"}
                          </td>
                          {/* Date */}
                          <td style={{ padding: "10px 14px", fontSize: "0.78rem",
                                        color: "#6b7280", whiteSpace: "nowrap" }}>
                            {date}
                          </td>
                          {/* Amount */}
                          <td style={{ padding: "10px 14px", fontWeight: 800,
                                        color: "#059669", fontSize: "0.85rem",
                                        whiteSpace: "nowrap" }}>
                            ৳{Number(order.totalPrice || 0).toFixed(0)}
                          </td>
                          {/* Status */}
                          <td style={{ padding: "10px 14px" }}>
                            <StatusBadge status={order.orderStatus || "Placed"}/>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Books */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px",
                        border: "1px solid #dde8f0",
                        boxShadow: "0 2px 12px rgba(26,107,124,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
                           alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1rem",
                            fontWeight: 700, color: "#1a1a1a" }}>
                🏆 Top Books
              </h3>
              <Link to="/admin/books"
                    style={{ fontSize: "0.8rem", fontWeight: 700,
                              color: "#1a6b7c", textDecoration: "none" }}>
                View all →
              </Link>
            </div>

            {topBooks.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af",
                             padding: "24px 0", fontSize: "0.85rem" }}>
                No sales data yet
              </div>
            ) : (
              topBooks.map((book, i) => (
                <div key={book._id}
                     style={{ display: "flex", gap: 12, marginBottom: 14,
                               paddingBottom: 14,
                               borderBottom: i < topBooks.length - 1
                                 ? "1px solid #f3f4f6" : "none",
                               alignItems: "center" }}>

                  {/* Rank badge */}
                  <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                 background: i < 3 ? "#f5a623" : "#eef6f8",
                                 color: i < 3 ? "#fff" : "#1a6b7c",
                                 display: "flex", alignItems: "center",
                                 justifyContent: "center",
                                 fontWeight: 800, fontSize: "0.78rem" }}>
                    #{i + 1}
                  </div>

                  {/* Cover */}
                  <div style={{ width: 38, height: 50, borderRadius: 6, flexShrink: 0,
                                 background: "linear-gradient(135deg,#1a6b7c,#0f3d47)",
                                 overflow: "hidden" }}>
                    {book.coverImage &&
                      <img src={book.coverImage} alt={book.title}
                           style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1a1a",
                                   whiteSpace: "nowrap", overflow: "hidden",
                                   textOverflow: "ellipsis" }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>
                      {book.salesCount || 0} sold
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────
            QUICK ACTIONS
        ──────────────────────────────────────────────────── */}
        <div>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1rem",
                        fontWeight: 700, color: "#1a1a1a", marginBottom: 14 }}>
            ⚡ Quick Actions
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { icon: "➕", label: "Add New Book",       to: "/admin/books",   color: "#1a6b7c" },
              { icon: "👥", label: "Manage Users",        to: "/admin/users",   color: "#7c3aed" },
              { icon: "📦", label: "View All Orders",     to: "/admin/orders",  color: "#059669" },
              { icon: "📊", label: "Download Report",     action: downloadReport, color: "#f5a623" },
            ].map(q => (
              q.to ? (
                <Link key={q.label} to={q.to}
                      style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 14, padding: "18px 16px",
                                 border: `1.5px solid ${q.color}22`,
                                 boxShadow: "0 1px 6px rgba(26,107,124,0.05)",
                                 display: "flex", flexDirection: "column",
                                 alignItems: "center", gap: 10, cursor: "pointer",
                                 transition: "all 0.2s", textAlign: "center" }}
                       onMouseEnter={e => { e.currentTarget.style.background = `${q.color}0f`;
                                             e.currentTarget.style.transform = "translateY(-2px)"; }}
                       onMouseLeave={e => { e.currentTarget.style.background = "#fff";
                                             e.currentTarget.style.transform = "none"; }}>
                    <span style={{ fontSize: "1.8rem" }}>{q.icon}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: q.color }}>
                      {q.label}
                    </span>
                  </div>
                </Link>
              ) : (
                <div key={q.label}
                     onClick={q.action}
                     style={{ background: "#fff", borderRadius: 14, padding: "18px 16px",
                               border: `1.5px solid ${q.color}22`,
                               boxShadow: "0 1px 6px rgba(26,107,124,0.05)",
                               display: "flex", flexDirection: "column",
                               alignItems: "center", gap: 10, cursor: "pointer",
                               transition: "all 0.2s", textAlign: "center" }}
                     onMouseEnter={e => { e.currentTarget.style.background = `${q.color}0f`;
                                           e.currentTarget.style.transform = "translateY(-2px)"; }}
                     onMouseLeave={e => { e.currentTarget.style.background = "#fff";
                                           e.currentTarget.style.transform = "none"; }}>
                  <span style={{ fontSize: "1.8rem" }}>{q.icon}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: q.color }}>
                    {q.label}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>

      </div>

      {/* Global CSS for spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          /* Stack grids on tablet */
        }
      `}</style>

    </div>
  );
}