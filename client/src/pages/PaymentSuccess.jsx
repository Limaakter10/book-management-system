// ============================================================
// 📄 PaymentSuccess.jsx
// SSL payment success এর পর এই page আসে।
// URL থেকে tran_id নিয়ে order fetch করে invoice দেখায়।
// ============================================================

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

const PaymentSuccess = () => {
  // URL এ ?tran_id=XXX আছে — সেটা নাও
  const [searchParams]  = useSearchParams();
  const tranId          = searchParams.get("tran_id");

  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Step 1: cart clear, library refresh trigger
  useEffect(() => {
    localStorage.removeItem("cart");
    localStorage.setItem("refreshLibrary", "true");
  }, []);

  // ── Step 2: tran_id দিয়ে order fetch
  useEffect(() => {
    if (!tranId) {
      setLoading(false);
      return;
    }

    api.get(`/api/orders/by-tran/${tranId}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Order fetch error:", err);
        setNotFound(true);
        setLoading(false);
      });
  }, [tranId]);

  // ============================================================
  // INVOICE DOWNLOAD
  // Browser এর print dialog দিয়ে PDF হিসেবে save করা যাবে
  // ============================================================
  const downloadInvoice = () => {
    if (!order) return;

    // Invoice HTML বানাও
    const bookRows = order.books
      .map((b, i) => `
        <tr>
          <td style="padding:10px 8px;border:1px solid #e5e7eb;">${i + 1}</td>
          <td style="padding:10px 8px;border:1px solid #e5e7eb;">${b.title || "Book"}</td>
          <td style="padding:10px 8px;border:1px solid #e5e7eb;text-align:right;">৳ ${b.price ?? 0}</td>
        </tr>`)
      .join("");

    // নতুন window খোলো — invoice HTML দিয়ে
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>Invoice — ${order.tranId}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 48px;
            color: #111;
            font-size: 14px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 2px solid #16a34a;
          }
          .brand { font-size: 24px; font-weight: bold; color: #16a34a; }
          .brand span { color: #111; }
          .invoice-title { font-size: 13px; color: #666; margin-top: 4px; }
          .badge {
            background: #dcfce7; color: #16a34a;
            padding: 4px 12px; border-radius: 20px;
            font-size: 13px; font-weight: bold;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 32px;
            margin-bottom: 28px;
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
          }
          .info-row { display: flex; gap: 8px; }
          .info-label { font-weight: bold; min-width: 130px; color: #374151; }
          .info-val { color: #111; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          thead tr { background: #f3f4f6; }
          th {
            padding: 10px 8px;
            border: 1px solid #e5e7eb;
            text-align: left;
            font-size: 13px;
            color: #374151;
          }
          .totals { text-align: right; margin-top: 8px; }
          .totals p { margin: 4px 0; font-size: 14px; }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #16a34a;
            margin-top: 8px;
          }
          .footer {
            margin-top: 48px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print { button { display: none !important; } }
        </style>
      </head>
      <body>

        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand">Read<span>Nova</span></div>
            <div class="invoice-title">Digital Library — Invoice</div>
          </div>
          <div class="badge">✅ Payment Successful</div>
        </div>

        <!-- Order Info -->
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Invoice No:</span>
            <span class="info-val">${order.tranId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-val">${new Date(order.createdAt).toLocaleString("en-BD", {
              timeZone: "Asia/Dhaka",
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-val" style="text-transform:capitalize">${order.method}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-val" style="color:#16a34a;font-weight:bold">
              ${order.status}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer:</span>
            <span class="info-val">${order.userId?.email || "—"}</span>
          </div>
        </div>

        <!-- Books Table -->
        <table>
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>Book Title</th>
              <th style="text-align:right;width:100px">Price</th>
            </tr>
          </thead>
          <tbody>${bookRows}</tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          ${order.discountAmount > 0
            ? `<p style="color:#dc2626">Discount: − ৳ ${order.discountAmount}</p>`
            : ""}
          ${order.tax > 0
            ? `<p style="color:#6b7280">Tax: + ৳ ${order.tax}</p>`
            : ""}
          <p class="grand-total">Total Paid: ৳ ${order.amount}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          ReadNova — Digital Library &nbsp;|&nbsp; support@readnova.com<br/>
          Thank you for your purchase!
        </div>

        <script>
          // Page load হলেই print dialog open → PDF হিসেবে save করা যাবে
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">

      {/* Success Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">

        {/* Icon */}
        <div className="text-6xl mb-4">✅</div>

        <h1 className="text-2xl font-bold text-green-600 mb-1">
          Payment Successful!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your books are now in your library 📚
        </p>

        {/* Order Summary */}
        {loading && (
          <p className="text-gray-400 text-sm mb-4">Loading order details...</p>
        )}

        {!loading && order && (
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-700 mb-5 space-y-1 border">
            <p><span className="font-semibold">Transaction ID:</span> {order.tranId}</p>
            <p><span className="font-semibold">Amount Paid:</span> ৳ {order.amount}</p>
            <p><span className="font-semibold">Method:</span>{" "}
              <span className="capitalize">{order.method}</span>
            </p>
            <p><span className="font-semibold">Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-BD", {
                day: "2-digit", month: "short", year: "numeric"
              })}
            </p>
            <p><span className="font-semibold">Books:</span> {order.books.length} item(s)</p>
          </div>
        )}

        {!loading && notFound && (
          <p className="text-sm text-gray-400 mb-4">
            Order details could not be loaded.
          </p>
        )}

        {/* Invoice Download Button */}
        {!loading && order && (
          <button
            onClick={downloadInvoice}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl mb-3 transition flex items-center justify-center gap-2"
          >
            ⬇️ Download Invoice (PDF)
          </button>
        )}

        {/* Go to Library */}
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