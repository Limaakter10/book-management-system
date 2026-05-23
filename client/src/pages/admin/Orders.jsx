import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FaBoxOpen, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle,
  FaCalendarAlt, FaFilePdf, FaEnvelope, FaBook,
  FaSearch,
} from "react-icons/fa";

// ✅ env based URL
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://book-management-system-ks6w.onrender.com";

// ── Status map ────────────────────────────────────────────────
const STATUS_MAP = {
  paid     : { label:"Paid",      bg:"#f0fdf4", color:"#16a34a", icon:<FaCheckCircle /> },
  failed   : { label:"Failed",    bg:"#fef2f2", color:"#dc2626", icon:<FaTimesCircle /> },
  cancelled: { label:"Cancelled", bg:"#fef2f2", color:"#dc2626", icon:<FaTimesCircle /> },
};

// ── Date formatter ────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleString("en-BD", {
    timeZone:"Asia/Dhaka", day:"2-digit", month:"short",
    year:"numeric", hour:"2-digit", minute:"2-digit",
  }) : "—";

// ── Format number — দশমিক নেই ─────────────────────────────────
const fmt = (n) => Math.round(Number(n || 0)).toLocaleString("en-BD");

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
const Orders = () => {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all"); // all | paid | failed
  const [expanded,  setExpanded]  = useState(null);
  const [dlLoading, setDlLoading] = useState(null);

  useEffect(() => {
    api.get("/api/orders/all")
      .then(res  => { setOrders(res.data); setLoading(false); })
      .catch(err => { console.error(err);  setLoading(false); });
  }, []);

  // ── Stats ─────────────────────────────────────────────────
  const paidOrders   = orders.filter(o => o.status === "paid");
  const failedOrders = orders.filter(o => o.status === "failed");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.amount || 0), 0);

  // ── Filter + Search ───────────────────────────────────────
  let filtered = orders;
  if (filter === "paid")   filtered = paidOrders;
  if (filter === "failed") filtered = failedOrders;

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(o =>
      o.userId?.email?.toLowerCase().includes(q) ||
      o.userId?.name?.toLowerCase().includes(q)  ||
      o.tranId?.toLowerCase().includes(q)         ||
      o.status?.toLowerCase().includes(q)
    );
  }

  // ── Invoice download ──────────────────────────────────────
  const downloadInvoice = async (tranId) => {
    setDlLoading(tranId);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/invoice/${tranId}`);
      if (!res.ok) throw new Error("Server error");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `ReadNova-Invoice-${tranId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Invoice download failed. Please try again.");
    } finally {
      setDlLoading(null);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center",
                  height:200, color:"#94a3b8", fontSize:14 }}>
      <div style={{ width:24, height:24, border:"2px solid #e2e8f0",
                    borderTop:"2px solid #0e5a6f", borderRadius:"50%",
                    animation:"spin 0.8s linear infinite", marginRight:10 }}/>
      Loading orders…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding:"24px", maxWidth:900, margin:"0 auto",
                  fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:"#0f172a",
                     display:"flex", alignItems:"center", gap:8 }}>
          <FaBoxOpen style={{ color:"#0e5a6f" }} />
          Orders
          <span style={{ fontSize:13, fontWeight:400, color:"#94a3b8" }}>
            ({filtered.length} shown)
          </span>
        </h2>

        {/* Search */}
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff",
                      border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 12px",
                      minWidth:240 }}>
          <FaSearch style={{ color:"#94a3b8", fontSize:13 }} />
          <input
            style={{ border:"none", outline:"none", fontSize:13, color:"#0f172a",
                     background:"transparent", fontFamily:"'Plus Jakarta Sans', sans-serif" }}
            placeholder="Search by email, tran ID, status…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────── */}
      <div style={{ display:"grid",
                    gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))",
                    gap:14, marginBottom:20 }}>

        {/* Total */}
        <div style={cardStyle("#e6f2f6", "#0e5a6f")}>
          <p style={{ fontSize:24, fontWeight:800, color:"#0e5a6f" }}>{orders.length}</p>
          <p style={{ fontSize:11, color:"#64748b", marginTop:2 }}>Total Orders</p>
        </div>

        {/* Paid */}
        <div style={cardStyle("#f0fdf4", "#16a34a")}>
          <p style={{ fontSize:24, fontWeight:800, color:"#16a34a" }}>{paidOrders.length}</p>
          <p style={{ fontSize:11, color:"#64748b", marginTop:2 }}>Paid Orders</p>
        </div>

        {/* Failed */}
        <div style={cardStyle("#fef2f2", "#dc2626")}>
          <p style={{ fontSize:24, fontWeight:800, color:"#dc2626" }}>{failedOrders.length}</p>
          <p style={{ fontSize:11, color:"#64748b", marginTop:2 }}>Failed Orders</p>
        </div>

        {/* Revenue — ✅ দশমিক নেই */}
        <div style={cardStyle("#f5f3ff", "#7c3aed")}>
          <p style={{ fontSize:18, fontWeight:800, color:"#7c3aed" }}>৳{fmt(totalRevenue)}</p>
          <p style={{ fontSize:11, color:"#64748b", marginTop:2 }}>Total Revenue</p>
        </div>
      </div>

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[
          { key:"all",    label:`All (${orders.length})` },
          { key:"paid",   label:`Paid (${paidOrders.length})` },
          { key:"failed", label:`Failed (${failedOrders.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding:"7px 16px", borderRadius:20, cursor:"pointer",
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:12, fontWeight:600, border:"none",
            background: filter === t.key ? "#0e5a6f" : "#f1f5f9",
            color:      filter === t.key ? "#fff"    : "#64748b",
            transition:"all 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0",
                      color:"#94a3b8", fontSize:14 }}>
          <FaBoxOpen style={{ fontSize:40, marginBottom:12, opacity:0.3 }} />
          <p>{search ? "No matching orders found." : "No orders found."}</p>
        </div>
      )}

      {/* ── Order Cards ───────────────────────────────────── */}
      {filtered.map(order => {
        const statusKey = order.status?.toLowerCase() || "failed";
        const st        = STATUS_MAP[statusKey] ?? STATUS_MAP.failed;
        const isOpen    = expanded === order._id;
        const isPaid    = order.status === "paid";
        const userEmail = order.userId?.email || String(order.userId || "—");
        const userName  = order.userId?.name  || "";
        const books     = order.books || [];

        return (
          <div key={order._id} style={{
            background:"#fff", border:"1px solid #e2e8f0",
            borderRadius:12, marginBottom:14, overflow:"hidden",
            boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
          }}>

            {/* Collapsed row */}
            <div
              style={{ padding:"16px 20px", display:"flex", alignItems:"center",
                       flexWrap:"wrap", gap:12, cursor:"pointer" }}
              onClick={() => setExpanded(isOpen ? null : order._id)}
            >
              {/* Email + Name */}
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6,
                              fontSize:13, fontWeight:600, color:"#0f172a" }}>
                  <FaEnvelope style={{ color:"#0e5a6f", flexShrink:0 }} />
                  {userEmail}
                </div>
                {userName && (
                  <p style={{ fontSize:11, color:"#94a3b8", marginTop:2, marginLeft:18 }}>
                    {userName}
                  </p>
                )}
              </div>

              {/* Date */}
              <div style={{ display:"flex", alignItems:"center", gap:5,
                            fontSize:11, color:"#94a3b8" }}>
                <FaCalendarAlt /> {formatDate(order.createdAt)}
              </div>

              {/* Status badge */}
              <div style={{ display:"flex", alignItems:"center", gap:5,
                            padding:"3px 10px", borderRadius:20,
                            background:st.bg, color:st.color,
                            fontSize:11, fontWeight:600 }}>
                {st.icon} {st.label}
              </div>

              {/* Amount — ✅ দশমিক নেই */}
              <div style={{ fontSize:15, fontWeight:700, color:"#0e5a6f",
                            display:"flex", alignItems:"center", gap:5 }}>
                <FaMoneyBillWave style={{ color:"#16a34a" }} />
                ৳{fmt(order.amount)}
              </div>

              <span style={{ color:"#94a3b8", fontSize:11 }}>
                {isOpen ? "▲" : "▼"}
              </span>
            </div>

            {/* Expanded panel */}
            {isOpen && (
              <div style={{ borderTop:"1px solid #f1f5f9",
                            padding:"16px 20px", background:"#f8fafc" }}>

                {/* Transaction ID + Method */}
                <div style={{ display:"flex", gap:24, flexWrap:"wrap", marginBottom:14 }}>
                  <div style={{ fontSize:12, color:"#64748b" }}>
                    <span style={{ fontWeight:600, color:"#0f172a" }}>Transaction ID: </span>
                    <span style={{ fontFamily:"monospace" }}>{order.tranId}</span>
                  </div>
                  <div style={{ fontSize:12, color:"#64748b" }}>
                    <span style={{ fontWeight:600, color:"#0f172a" }}>Method: </span>
                    <span style={{ textTransform:"capitalize" }}>{order.method || "—"}</span>
                  </div>
                </div>

                {/* Books list */}
                <div style={{ marginBottom:14 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"#94a3b8",
                              marginBottom:8, display:"flex", alignItems:"center", gap:5 }}>
                    <FaBook style={{ color:"#f97316" }} /> BOOKS PURCHASED
                  </p>
                  {books.length === 0
                    ? <p style={{ fontSize:13, color:"#94a3b8" }}>No book details available</p>
                    : books.map((b, i) => (
                        <div key={i} style={{
                          display:"flex", justifyContent:"space-between",
                          fontSize:13, color:"#374151",
                          padding:"5px 0", borderBottom:"1px solid #f1f5f9",
                        }}>
                          <span>📖 {b.title || b.bookId?.title || "Book"}</span>
                          {/* ✅ দশমিক নেই */}
                          <span style={{ color:"#64748b" }}>৳{fmt(b.price)}</span>
                        </div>
                      ))
                  }

                  {/* Total */}
                  <div style={{ display:"flex", justifyContent:"space-between",
                                fontSize:14, fontWeight:700, color:"#0e5a6f",
                                marginTop:8, paddingTop:8, borderTop:"2px solid #e2e8f0" }}>
                    <span>Total</span>
                    {/* ✅ দশমিক নেই */}
                    <span>৳{fmt(order.amount)}</span>
                  </div>
                </div>

                {/* ✅ Invoice শুধু paid order এ */}
                {isPaid && (
                  <button
                    onClick={() => downloadInvoice(order.tranId)}
                    disabled={dlLoading === order.tranId}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:7,
                      padding:"8px 18px", borderRadius:8,
                      background:"#f0fdf4", border:"1px solid #86efac",
                      color:"#16a34a", fontSize:12, fontWeight:600,
                      cursor: dlLoading === order.tranId ? "not-allowed" : "pointer",
                      fontFamily:"'Plus Jakarta Sans', sans-serif",
                      opacity: dlLoading === order.tranId ? 0.7 : 1,
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e => {
                      if (dlLoading !== order.tranId) {
                        e.currentTarget.style.background = "#16a34a";
                        e.currentTarget.style.color      = "#fff";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#f0fdf4";
                      e.currentTarget.style.color      = "#16a34a";
                    }}
                  >
                    {dlLoading === order.tranId ? (
                      <>
                        <div style={{ width:14, height:14, border:"2px solid #86efac",
                                      borderTop:"2px solid #16a34a", borderRadius:"50%",
                                      animation:"spin 0.8s linear infinite" }}/>
                        Generating…
                      </>
                    ) : (
                      <><FaFilePdf /> Download Invoice</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ── Card style helper ─────────────────────────────────────────
const cardStyle = (bg, border) => ({
  background   : bg,
  borderRadius : 10,
  padding      : "14px 16px",
  border       : `1px solid ${border}33`,
});

export default Orders;