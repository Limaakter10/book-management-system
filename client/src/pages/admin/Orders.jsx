// ============================================================
// 📄 admin/Orders.jsx — All orders with user email + invoice
// ============================================================

import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FaBoxOpen, FaMoneyBillWave, FaCreditCard,
  FaCheckCircle, FaClock, FaTimesCircle,
  FaCalendarAlt, FaFilePdf, FaEnvelope, FaBook,
  FaSearch, FaDownload,
} from "react-icons/fa";

const BACKEND_URL = "https://book-management-system-ks6w.onrender.com";

// ── helpers ───────────────────────────────────────────────────
const STATUS_MAP = {
  paid:      { label: "Paid",      bg: "#f0fdf4", color: "#16a34a", icon: <FaCheckCircle /> },
  approved:  { label: "Approved",  bg: "#f0fdf4", color: "#16a34a", icon: <FaCheckCircle /> },
  confirmed: { label: "Confirmed", bg: "#eff6ff", color: "#1d4ed8", icon: <FaCheckCircle /> },
  pending:   { label: "Pending",   bg: "#fefce8", color: "#ca8a04", icon: <FaClock />       },
  failed:    { label: "Failed",    bg: "#fef2f2", color: "#dc2626", icon: <FaTimesCircle /> },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", icon: <FaTimesCircle /> },
};

const dateStr = (d) =>
  d ? new Date(d).toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

// ═════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════
const Orders = () => {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);
  const [dlLoading, setDlLoading] = useState(null); // tranId of downloading order

  // ── fetch all orders ──────────────────────────────────────
  useEffect(() => {
    api.get("/api/orders/all")
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // ── filter ────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      o.userId?.email?.toLowerCase().includes(q) ||
      o.userId?.name?.toLowerCase().includes(q)  ||
      o.tranId?.toLowerCase().includes(q)         ||
      o.status?.toLowerCase().includes(q)
    );
  });

  // ── invoice download (fetch blob → save) ──────────────────
  const downloadInvoice = async (tranId, type = "user") => {
    const key = tranId + (type === "admin" ? "a" : "u");
    setDlLoading(key);
    try {
      const url = type === "admin"
        ? `${BACKEND_URL}/api/invoice/admin/${tranId}`
        : `${BACKEND_URL}/api/invoice/${tranId}`;

      const res  = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const burl = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = burl;
      a.download = type === "admin"
        ? `ReadNova-AdminInvoice-${tranId}.pdf`
        : `ReadNova-Invoice-${tranId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(burl);
    } catch (err) {
      alert("Invoice download failed. Please try again.");
    } finally {
      setDlLoading(null);
    }
  };

  // ── stats ─────────────────────────────────────────────────
  const totalRevenue = orders
    .filter(o => ["paid","approved"].includes(o.status))
    .reduce((s, o) => s + (o.amount || 0), 0);
  const paidCount   = orders.filter(o => ["paid","approved"].includes(o.status)).length;
  const pendingCount= orders.filter(o => o.status === "pending").length;

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:200, color:"#94a3b8", fontSize:14 }}>
      <div style={{ width:24, height:24, border:"2px solid #e2e8f0", borderTop:"2px solid #0e5a6f", borderRadius:"50%", animation:"spin 0.8s linear infinite", marginRight:10 }} />
      Loading orders…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding:"24px", maxWidth:900, margin:"0 auto", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

      {/* ── header ─────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:"#0f172a", display:"flex", alignItems:"center", gap:8 }}>
          <FaBoxOpen style={{ color:"#0e5a6f" }} />
          Orders
          <span style={{ fontSize:13, fontWeight:400, color:"#94a3b8" }}>({orders.length} total)</span>
        </h2>

        {/* search */}
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 12px", minWidth:240 }}>
          <FaSearch style={{ color:"#94a3b8", fontSize:13 }} />
          <input
            style={{ border:"none", outline:"none", fontSize:13, color:"#0f172a", background:"transparent", fontFamily:"'Plus Jakarta Sans', sans-serif" }}
            placeholder="Search by email, tran ID, status…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── stat cards ─────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Orders",   value:orders.length,             color:"#0e5a6f", bg:"#e6f2f6" },
          { label:"Paid",           value:paidCount,                  color:"#16a34a", bg:"#f0fdf4" },
          { label:"Pending",        value:pendingCount,               color:"#ca8a04", bg:"#fefce8" },
          { label:"Total Revenue",  value:`BDT ${totalRevenue}`,      color:"#7c3aed", bg:"#f5f3ff" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background:bg, borderRadius:10, padding:"14px 16px", border:"1px solid #e2e8f0" }}>
            <p style={{ fontSize:20, fontWeight:700, color }}>{value}</p>
            <p style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── empty ──────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8", fontSize:14 }}>
          <FaBoxOpen style={{ fontSize:40, marginBottom:12, opacity:0.3 }} />
          <p>{search ? "No matching orders" : "No orders yet."}</p>
        </div>
      )}

      {/* ── order cards ────────────────────────────────────── */}
      {filtered.map(order => {
        const st      = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
        const isOpen  = expanded === order._id;
        const isPaid  = ["paid","approved"].includes(order.status);
        const userEmail= order.userId?.email || String(order.userId || "—");
        const userName = order.userId?.name  || "";
        const books    = order.books || [];

        return (
          <div key={order._id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, marginBottom:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

            {/* ── main row ─────────────────────────────────── */}
            <div
              style={{ padding:"16px 20px", display:"flex", alignItems:"center", flexWrap:"wrap", gap:12, cursor:"pointer" }}
              onClick={() => setExpanded(isOpen ? null : order._id)}
            >
              {/* user */}
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, color:"#0f172a" }}>
                  <FaEnvelope style={{ color:"#0e5a6f", flexShrink:0 }} />
                  {userEmail}
                </div>
                {userName && (
                  <p style={{ fontSize:11, color:"#94a3b8", marginTop:2, marginLeft:18 }}>{userName}</p>
                )}
              </div>

              {/* date */}
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#94a3b8" }}>
                <FaCalendarAlt />
                {dateStr(order.createdAt)}
              </div>

              {/* status badge */}
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:st.bg, color:st.color, fontSize:11, fontWeight:600 }}>
                {st.icon} {st.label}
              </div>

              {/* amount */}
              <div style={{ fontSize:15, fontWeight:700, color:"#0e5a6f", display:"flex", alignItems:"center", gap:5 }}>
                <FaMoneyBillWave style={{ color:"#16a34a" }} />
                BDT {order.amount}
              </div>

              {/* expand arrow */}
              <span style={{ color:"#94a3b8", fontSize:11 }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* ── expanded details ─────────────────────────── */}
            {isOpen && (
              <div style={{ borderTop:"1px solid #f1f5f9", padding:"16px 20px", background:"#f8fafc" }}>

                {/* tran + method */}
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

                {/* books */}
                <div style={{ marginBottom:14 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"#94a3b8", marginBottom:8, display:"flex", alignItems:"center", gap:5 }}>
                    <FaBook style={{ color:"#f97316" }} /> BOOKS PURCHASED
                  </p>
                  {books.length === 0
                    ? <p style={{ fontSize:13, color:"#94a3b8" }}>No book details</p>
                    : books.map((b, i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#374151", padding:"5px 0", borderBottom:"1px solid #f1f5f9" }}>
                          <span>📖 {b.title || b.bookId?.title || "Book"}</span>
                          <span style={{ color:"#64748b" }}>BDT {b.price || 0}</span>
                        </div>
                      ))
                  }
                  {/* total */}
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:700, color:"#0e5a6f", marginTop:8, paddingTop:8, borderTop:"2px solid #e2e8f0" }}>
                    <span>Total</span>
                    <span>BDT {order.amount}</span>
                  </div>
                </div>

                {/* invoice download — only for paid */}
                {isPaid && (
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>

                    {/* user copy */}
                    <button
                      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:8, background:"#f0fdf4", border:"1px solid #86efac", color:"#16a34a", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif", opacity: dlLoading === order.tranId + "u" ? 0.7 : 1 }}
                      onClick={() => downloadInvoice(order.tranId, "user")}
                      disabled={dlLoading === order.tranId + "u"}
                    >
                      {dlLoading === order.tranId + "u"
                        ? <><div style={{ width:14, height:14, border:"2px solid #86efac", borderTop:"2px solid #16a34a", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /> Generating…</>
                        : <><FaFilePdf /> invoice Copy</>
                      }
                    </button>

                    {/* admin copy */}
                    {/* <button
                      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:8, background:"#fefce8", border:"1px solid #fde047", color:"#854d0e", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif", opacity: dlLoading === order.tranId + "a" ? 0.7 : 1 }}
                      onClick={() => downloadInvoice(order.tranId, "admin")}
                      disabled={dlLoading === order.tranId + "a"}
                    >
                      {dlLoading === order.tranId + "a"
                        ? <><div style={{ width:14, height:14, border:"2px solid #fde047", borderTop:"2px solid #854d0e", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /> Generating…</>
                        : <><FaFilePdf /> Admin Copy</>
                      }
                    </button> */}

                  </div>
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

export default Orders;