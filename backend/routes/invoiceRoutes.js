// ============================================================
// 📄 invoiceRoutes.js
// GET /api/invoice/:tranId → actual PDF file generate করে download দেয়
// puppeteer দিয়ে HTML → PDF convert করা হচ্ছে
// ============================================================

const express    = require("express");
const router     = express.Router();
const puppeteer  = require("puppeteer");
const Order      = require("../models/Order");

// ============================================================
// GET /api/invoice/:tranId
// ============================================================
router.get("/:tranId", async (req, res) => {
  let browser = null;

  try {
    // ── Order fetch with user email
    const order = await Order.findOne({ tranId: req.params.tranId })
      .populate("userId", "email name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ── Book rows HTML
    const bookRows = order.books.map((b, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td>${b.title || "Book"}</td>
        <td class="right">৳ ${Number(b.price || 0).toFixed(2)}</td>
      </tr>
    `).join("");

    // ── Status color
    const statusColor =
      order.status === "paid"    ? "#16a34a" :
      order.status === "pending" ? "#ca8a04" : "#dc2626";

    // ── Invoice date
    const invoiceDate = new Date(order.createdAt).toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      day:    "2-digit",
      month:  "long",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });

    // ── Full HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }

          body {
            font-family: 'Arial', sans-serif;
            color: #1a1a1a;
            background: #fff;
            padding: 0;
          }

          /* ── TOP COLOR BAR ── */
          .top-bar {
            background: linear-gradient(135deg, #16a34a, #15803d);
            height: 8px;
          }

          .page { padding: 48px 56px; }

          /* ── HEADER ── */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
          }
          .brand-name {
            font-size: 32px;
            font-weight: 900;
            color: #16a34a;
            letter-spacing: -1px;
          }
          .brand-name span { color: #1a1a1a; }
          .brand-tagline {
            font-size: 12px;
            color: #888;
            margin-top: 2px;
          }
          .invoice-label {
            text-align: right;
          }
          .invoice-label h2 {
            font-size: 28px;
            font-weight: 800;
            color: #1a1a1a;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .invoice-label p {
            font-size: 12px;
            color: #888;
            margin-top: 4px;
          }

          /* ── STATUS BADGE ── */
          .status-badge {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: ${order.status === "paid" ? "#dcfce7" : order.status === "pending" ? "#fef9c3" : "#fee2e2"};
            color: ${statusColor};
            margin-top: 8px;
          }

          /* ── DIVIDER ── */
          .divider {
            border: none;
            border-top: 2px solid #f0f0f0;
            margin: 24px 0;
          }
          .divider-green {
            border: none;
            border-top: 3px solid #16a34a;
            margin: 0 0 32px 0;
          }

          /* ── INFO SECTION ── */
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 36px;
            gap: 32px;
          }
          .info-box {
            flex: 1;
            background: #f9fafb;
            border-radius: 10px;
            padding: 20px 24px;
            border-left: 4px solid #16a34a;
          }
          .info-box h4 {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 12px;
          }
          .info-row {
            display: flex;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 13px;
          }
          .info-key {
            font-weight: 600;
            color: #555;
            min-width: 110px;
            flex-shrink: 0;
          }
          .info-val { color: #1a1a1a; }

          /* ── TABLE ── */
          .table-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          thead tr {
            background: #16a34a;
            color: #fff;
          }
          th {
            padding: 12px 14px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
          }
          td {
            padding: 12px 14px;
            font-size: 13px;
            border-bottom: 1px solid #f0f0f0;
          }
          tbody tr:last-child td { border-bottom: none; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .center { text-align: center; }
          .right   { text-align: right; }

          /* ── TOTAL SECTION ── */
          .total-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
          }
          .total-box {
            min-width: 260px;
            border-top: 2px solid #e5e7eb;
            padding-top: 12px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #555;
            margin-bottom: 6px;
          }
          .total-row.grand {
            font-size: 18px;
            font-weight: 800;
            color: #16a34a;
            border-top: 2px solid #16a34a;
            padding-top: 10px;
            margin-top: 6px;
          }

          /* ── FOOTER ── */
          .footer {
            margin-top: 48px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-left {
            font-size: 12px;
            color: #888;
            line-height: 1.8;
          }
          .footer-right {
            font-size: 12px;
            color: #16a34a;
            font-weight: 700;
            text-align: right;
          }
          .thank-you {
            font-size: 15px;
            font-weight: 700;
            color: #16a34a;
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>

        <!-- Top green bar -->
        <div class="top-bar"></div>

        <div class="page">

          <!-- Header -->
          <div class="header">
            <div>
              <div class="brand-name">Read<span>Nova</span></div>
              <div class="brand-tagline">Digital Library — Ignite Your Knowledge</div>
            </div>
            <div class="invoice-label">
              <h2>Invoice</h2>
              <p>#${order.tranId}</p>
              <div class="status-badge">${order.status}</div>
            </div>
          </div>

          <hr class="divider-green"/>

          <!-- Info Section -->
          <div class="info-section">

            <!-- Bill To -->
            <div class="info-box">
              <h4>Bill To</h4>
              <div class="info-row">
                <span class="info-key">Name:</span>
                <span class="info-val">${order.userId?.name || "Customer"}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Email:</span>
                <span class="info-val">${order.userId?.email || "—"}</span>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="info-box">
              <h4>Invoice Details</h4>
              <div class="info-row">
                <span class="info-key">Invoice No:</span>
                <span class="info-val">${order.tranId}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Date:</span>
                <span class="info-val">${invoiceDate}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Method:</span>
                <span class="info-val" style="text-transform:capitalize">${order.method}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Status:</span>
                <span class="info-val" style="color:${statusColor};font-weight:700;text-transform:capitalize">
                  ${order.status}
                </span>
              </div>
            </div>

          </div>

          <!-- Books Table -->
          <p class="table-title">Items Purchased</p>
          <table>
            <thead>
              <tr>
                <th style="width:40px;text-align:center">#</th>
                <th>Book Title</th>
                <th style="text-align:right;width:120px">Price</th>
              </tr>
            </thead>
            <tbody>${bookRows}</tbody>
          </table>

          <!-- Totals -->
          <div class="total-section">
            <div class="total-box">
              ${order.discountAmount > 0 ? `
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>৳ ${(order.amount + order.discountAmount).toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Discount</span>
                  <span style="color:#dc2626">− ৳ ${order.discountAmount.toFixed(2)}</span>
                </div>
              ` : ""}
              ${order.tax > 0 ? `
                <div class="total-row">
                  <span>Tax</span>
                  <span>+ ৳ ${order.tax.toFixed(2)}</span>
                </div>
              ` : ""}
              <div class="total-row grand">
                <span>Total Paid</span>
                <span>৳ ${Number(order.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-left">
              ReadNova — Digital Library<br/>
              support@readnova.com &nbsp;|&nbsp; +880 1734-567890<br/>
              book-management-system-one-nu.vercel.app
            </div>
            <div class="footer-right">
              <div class="thank-you">Thank you! 📚</div>
              This is a computer-generated invoice.<br/>
              No signature required.
            </div>
          </div>

        </div>
      </body>
      </html>
    `;

    // ── Puppeteer দিয়ে HTML → PDF convert
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format:            "A4",
      printBackground:   true,   // colors/backgrounds include করো
      margin: {
        top:    "0px",
        right:  "0px",
        bottom: "0px",
        left:   "0px",
      },
    });

    await browser.close();

    // ── PDF response — browser এ download dialog আসবে
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ReadNova-Invoice-${order.tranId}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (err) {
    if (browser) await browser.close();
    console.error("Invoice PDF error:", err);
    res.status(500).json({ message: "PDF generation failed", error: err.message });
  }
});

module.exports = router;
