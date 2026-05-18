// ============================================================
// 📄 admin/Orders.jsx
// Admin panel — সব orders দেখাবে।
// প্রতিটা order এ: user email, date, books, amount, invoice button
// ============================================================

import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FaBoxOpen, FaUser, FaMoneyBillWave, FaCreditCard,
  FaCheckCircle, FaClock, FaTimesCircle,
  FaCalendarAlt, FaFileInvoice, FaEnvelope, FaBook
} from "react-icons/fa";

const Orders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all orders (user email populate করে)
  useEffect(() => {
    api.get("/api/orders/all")
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // ── Status badge
  const StatusBadge = ({ status }) => {
    const map = {
      paid:     { icon: <FaCheckCircle />, cls: "text-green-600 bg-green-50",   label: "Paid"     },
      approved: { icon: <FaCheckCircle />, cls: "text-green-600 bg-green-50",   label: "Approved" },
      pending:  { icon: <FaClock />,       cls: "text-yellow-600 bg-yellow-50", label: "Pending"  },
      failed:   { icon: <FaTimesCircle />, cls: "text-red-500 bg-red-50",       label: "Failed"   },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  // ============================================================
  // INVOICE PRINT — admin থেকে যেকোনো order এর invoice print
  // ============================================================
  const printInvoice = (order) => {
    const bookRows = order.books
      .map((b, i) => `
        <tr>
          <td style="padding:10px 8px;border:1px solid #e5e7eb;">${i + 1}</td>
          <td style="padding:10px 8px;border:1px solid #e5e7eb;">${b.title || "Book"}</td>
          <td style="padding:10px 8px;border:1px solid #e5e7eb;text-align:right;">৳ ${b.price ?? 0}</td>
        </tr>`)
      .join("");

    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html lang="en"><head>
        <meta charset="UTF-8"/>
        <title>Invoice — ${order.tranId}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Arial,sans-serif;padding:48px;color:#111;font-size:14px}
          .header{display:flex;justify-content:space-between;align-items:flex-start;
            margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid #16a34a}
          .brand{font-size:24px;font-weight:bold;color:#16a34a}
          .brand span{color:#111}
          .badge{background:#dcfce7;color:#16a34a;padding:4px 12px;
            border-radius:20px;font-size:13px;font-weight:bold}
          .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 32px;
            margin-bottom:28px;background:#f9fafb;padding:16px;border-radius:8px}
          .info-row{display:flex;gap:8px}
          .info-label{font-weight:bold;min-width:130px;color:#374151}
          table{width:100%;border-collapse:collapse;margin-bottom:16px}
          thead tr{background:#f3f4f6}
          th{padding:10px 8px;border:1px solid #e5e7eb;text-align:left;
            font-size:13px;color:#374151}
          .totals{text-align:right;margin-top:8px}
          .grand-total{font-size:18px;font-weight:bold;color:#16a34a;margin-top:8px}
          .footer{margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;
            text-align:center;font-size:12px;color:#9ca3af}
          @media print{button{display:none!important}}
        </style>
      </head><body>

        <div class="header">
          <div>
            <div class="brand">Read<span>Nova</span></div>
            <div style="font-size:13px;color:#666;margin-top:4px">Admin Copy — Invoice</div>
          </div>
          <div class="badge">✅ ${order.status}</div>
        </div>

        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Invoice No:</span>
            <span>${order.tranId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${new Date(order.createdAt).toLocaleString("en-BD", {
              timeZone: "Asia/Dhaka",
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer Email:</span>
            <span>${order.userId?.email || "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer Name:</span>
            <span>${order.userId?.name || "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span style="text-transform:capitalize">${order.method}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span style="color:#16a34a;font-weight:bold">${order.status}</span>
          </div>
        </div>

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

        <div class="totals">
          ${order.discountAmount > 0
            ? `<p style="color:#dc2626">Discount: − ৳ ${order.discountAmount}</p>`
            : ""}
          ${order.tax > 0
            ? `<p style="color:#6b7280">Tax: + ৳ ${order.tax}</p>`
            : ""}
          <p class="grand-total">Total Paid: ৳ ${order.amount}</p>
        </div>

        <div class="footer">
          ReadNova — Digital Library | support@readnova.com<br/>
          This is an admin copy of the invoice.
        </div>

        <script>window.onload=()=>{window.print();}</script>
      </body></html>
    `);
    win.document.close();
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) return (
    <div className="flex justify-center items-center h-40 text-gray-400 text-sm">
      Loading orders...
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">

      {/* Title */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <FaBoxOpen className="text-blue-500" />
        Orders
        <span className="text-sm font-normal text-gray-400 ml-1">
          ({orders.length} total)
        </span>
      </h2>

      {orders.length === 0 && (
        <p className="text-gray-400 text-center mt-16">No orders yet.</p>
      )}

      {orders.map(order => (
        <div key={order._id}
          className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition"
        >
          {/* Row 1: Email + Date + Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">

            {/* User Email */}
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
              <FaEnvelope className="text-blue-400 flex-shrink-0" />
              {order.userId?.email || order.userId}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FaCalendarAlt />
              {new Date(order.createdAt).toLocaleString("en-BD", {
                timeZone: "Asia/Dhaka",
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit"
              })}
            </div>

            <StatusBadge status={order.status} />
          </div>

          {/* Row 2: Amount + Method + TranId */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" />
              <span><b>Amount:</b> ৳ {order.amount}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-purple-400" />
              <span className="capitalize"><b>Method:</b> {order.method}</span>
            </div>
            <div className="text-xs text-gray-400 flex items-center">
              Tran: {order.tranId}
            </div>
          </div>

          {/* Row 3: Books list */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
              <FaBook className="text-orange-400" /> Books Purchased
            </p>
            <ul className="text-sm text-gray-700 pl-4 list-disc space-y-0.5">
              {order.books.map((b, i) => (
                <li key={i}>
                  {b.title || "Unknown Title"}
                  <span className="text-gray-400 ml-2 text-xs">৳ {b.price ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Invoice Button */}
          <button
            onClick={() => printInvoice(order)}
            className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg transition border border-blue-200"
          >
            <FaFileInvoice /> Print / Download Invoice
          </button>

        </div>
      ))}

    </div>
  );
};

export default Orders;