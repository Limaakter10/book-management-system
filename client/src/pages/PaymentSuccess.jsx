// ============================================================
// 📄 PaymentSuccess.jsx
// Payment success — order summary + direct PDF invoice download
// ============================================================

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://book-management-system-ks6w.onrender.com";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const tranId         = searchParams.get("tran_id");

  const [order,       setOrder]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);

  // clear cart + trigger library refresh
  useEffect(() => {
    localStorage.removeItem("cart");
    localStorage.setItem("refreshLibrary", "true");
  }, []);

  // fetch order by tran_id
  useEffect(() => {
    if (!tranId) { setLoading(false); return; }
    api.get(`/api/orders/by-tran/${tranId}`)
      .then(res => { setOrder(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tranId]);

  // ── Direct PDF download (no print dialog) ──────────────────
  const handleDownloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/invoice/${order.tranId}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch invoice");

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `ReadNova-Invoice-${order.tranId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* success icon */}
        <div style={S.iconWrap}>
          <svg style={{ width: 40, height: 40, color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 style={S.title}>Payment Successful!</h1>
        <p style={S.subtitle}>Your books are now in your library 📚</p>

        {/* loading */}
        {loading && (
          <div style={S.loadingWrap}>
            <div style={S.spinner} />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading order details…</span>
          </div>
        )}

        {/* order summary */}
        {!loading && order && (
          <div style={S.summary}>

            <SummaryRow label="Transaction ID" value={
              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>
                {order.tranId}
              </span>
            } />
            <SummaryRow label="Amount Paid" value={
              <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 16 }}>
                ৳ {order.amount}
              </span>
            } />
            <SummaryRow label="Method" value={
              <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                {order.method || "SSL"}
              </span>
            } />
            <SummaryRow label="Date" value={
              new Date(order.createdAt).toLocaleDateString("en-BD", {
                day: "2-digit", month: "long", year: "numeric",
              })
            } />
            <SummaryRow label="Books" value={`${order.books?.length || 0} item(s)`} />

            {/* book list */}
            {order.books?.length > 0 && (
              <div style={S.bookList}>
                {order.books.map((b, i) => (
                  <div key={i} style={S.bookItem}>
                    <span>📖 {b.title || b.bookId?.title || "Book"}</span>
                    <span style={{ color: "#64748b" }}>৳ {b.price || 0}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* download invoice button */}
        {!loading && order && (
          <button
            style={{ ...S.downloadBtn, ...(downloading ? S.downloadBtnDisabled : {}) }}
            onClick={handleDownloadInvoice}
            disabled={downloading}
          >
            {downloading
              ? (
                <>
                  <div style={S.btnSpinner} />
                  Generating PDF…
                </>
              )
              : (
                <>
                  <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                  Download Invoice (PDF)
                </>
              )
            }
          </button>
        )}

        {/* go to library */}
        <button
          style={S.libraryBtn}
          onClick={() => window.location.href = "/library"}
        >
          Go to My Library →
        </button>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── sub-component ─────────────────────────────────────────────
const SummaryRow = ({ label, value }) => (
  <div style={{
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "8px 0",
    borderBottom: "1px solid #f1f5f9", fontSize: 14,
  }}>
    <span style={{ color: "#64748b" }}>{label}</span>
    <span style={{ color: "#1a1a1a" }}>{value}</span>
  </div>
);

// ── styles ────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "24px 16px",
    background: "#f8fafc",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    padding: "36px 32px",
    width: "100%", maxWidth: 460,
    textAlign: "center",
  },
  iconWrap: {
    width: 80, height: 80,
    background: "#dcfce7",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 16px",
  },
  title:    { fontSize: 22, fontWeight: 700, color: "#16a34a", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 20 },

  loadingWrap: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, marginBottom: 16,
  },
  spinner: {
    width: 18, height: 18,
    border: "2px solid #e2e8f0",
    borderTop: "2px solid #16a34a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  summary: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 16px",
    textAlign: "left",
    marginBottom: 20,
  },
  bookList: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #e2e8f0",
  },
  bookItem: {
    display: "flex", justifyContent: "space-between",
    fontSize: 13, color: "#374151",
    padding: "4px 0",
  },

  downloadBtn: {
    width: "100%",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "#16a34a",
    color: "#fff",
    border: "none", borderRadius: 12,
    padding: "14px 20px",
    fontSize: 15, fontWeight: 700,
    cursor: "pointer",
    marginBottom: 10,
    transition: "background 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  downloadBtnDisabled: {
    background: "#86efac",
    cursor: "not-allowed",
  },
  btnSpinner: {
    width: 18, height: 18,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  libraryBtn: {
    width: "100%",
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 20px",
    fontSize: 14, fontWeight: 500,
    color: "#64748b",
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

export default PaymentSuccess;