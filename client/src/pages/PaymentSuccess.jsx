// ============================================================
// 📄 PaymentSuccess.jsx
// Payment success page — order summary + PDF invoice download
// ============================================================

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

// Backend URL — invoice download এর জন্য
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://book-management-system-ks6w.onrender.com";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const tranId         = searchParams.get("tran_id");

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Cart clear + library refresh trigger
  useEffect(() => {
    localStorage.removeItem("cart");
    localStorage.setItem("refreshLibrary", "true");
  }, []);

  // ── tran_id দিয়ে order fetch করো
  useEffect(() => {
    if (!tranId) { setLoading(false); return; }

    api.get(`/api/orders/by-tran/${tranId}`)
      .then(res => { setOrder(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tranId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">

        {/* ── Success Icon ── */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-green-600 mb-1">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your books are now in your library 📚
        </p>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"/>
            Loading order details...
          </div>
        )}

        {/* ── Order Summary ── */}
        {!loading && order && (
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-700 mb-5 space-y-2 border border-gray-100">

            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono font-semibold text-xs">{order.tranId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-600">৳ {order.amount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="capitalize font-medium">{order.method}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>{new Date(order.createdAt).toLocaleDateString("en-BD", {
                day: "2-digit", month: "short", year: "numeric"
              })}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Books</span>
              <span>{order.books?.length} item(s)</span>
            </div>

            {/* Book list */}
            {order.books?.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                {order.books.map((b, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600 py-0.5">
                    <span>📖 {b.title || "Book"}</span>
                    <span>৳ {b.price || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PDF Download Button ── */}
        {/* Backend থেকে actual PDF file আসবে — browser save dialog দেখাবে */}
        {!loading && order && (
          <a
            href={`${BACKEND_URL}/api/invoice/${order.tranId}`}
            download={`ReadNova-Invoice-${order.tranId}.pdf`}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mb-3 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Download Invoice (PDF)
          </a>
        )}

        {/* ── Go to Library ── */}
        <button
          onClick={() => (window.location.href = "/library")}
          className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-2.5 rounded-xl transition"
        >
          Go to My Library →
        </button>

      </div>
    </div>
  );
};

export default PaymentSuccess;