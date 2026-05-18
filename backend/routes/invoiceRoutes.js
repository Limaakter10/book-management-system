// ============================================================
// 📄 invoiceRoutes.js
// GET /api/invoice/:tranId → actual PDF file
// pdfkit use করা হচ্ছে — Chrome দরকার নেই, Render এ কাজ করবে
// ============================================================

const express = require("express");
const router  = express.Router();
const PDFDocument = require("pdfkit");
const Order   = require("../models/Order");

router.get("/:tranId", async (req, res) => {
  try {
    // ── Order fetch
    const order = await Order.findOne({ tranId: req.params.tranId })
      .populate("userId", "email name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ── PDF response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ReadNova-Invoice-${order.tranId}.pdf"`
    );

    // ── Create PDF document
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res); // pipe directly to response

    // ── Colors
    const green  = "#16a34a";
    const dark   = "#1a1a1a";
    const gray   = "#6b7280";
    const light  = "#f9fafb";

    // ============================================================
    // TOP GREEN BAR
    // ============================================================
    doc.rect(0, 0, doc.page.width, 8).fill(green);

    // ============================================================
    // HEADER
    // ============================================================
    doc.moveDown(1);

    // Brand name
    doc.fontSize(28).font("Helvetica-Bold").fillColor(green).text("Read", 50, 40, { continued: true });
    doc.fillColor(dark).text("Nova");

    doc.fontSize(11).font("Helvetica").fillColor(gray)
      .text("Digital Library — Ignite Your Knowledge", 50, 75);

    // INVOICE label (right side)
    doc.fontSize(28).font("Helvetica-Bold").fillColor(dark)
      .text("INVOICE", 350, 40, { align: "right", width: 195 });

    doc.fontSize(11).font("Helvetica").fillColor(gray)
      .text(`#${order.tranId}`, 350, 75, { align: "right", width: 195 });

    // Status badge
    const statusColor =
      order.status === "paid"    ? green :
      order.status === "pending" ? "#ca8a04" : "#dc2626";

    doc.fontSize(10).font("Helvetica-Bold").fillColor(statusColor)
      .text(order.status.toUpperCase(), 350, 95, { align: "right", width: 195 });

    // ── Divider line
    doc.moveTo(50, 120).lineTo(545, 120).lineWidth(2).strokeColor(green).stroke();

    // ============================================================
    // INFO BOXES — Bill To + Invoice Details
    // ============================================================
    const boxY = 135;

    // Left box — Bill To
    doc.rect(50, boxY, 230, 100).fill(light);
    doc.rect(50, boxY, 4, 100).fill(green); // left accent

    doc.fontSize(9).font("Helvetica-Bold").fillColor(gray)
      .text("BILL TO", 62, boxY + 12);

    doc.fontSize(11).font("Helvetica-Bold").fillColor(dark)
      .text(order.userId?.name || "Customer", 62, boxY + 28);

    doc.fontSize(10).font("Helvetica").fillColor(gray)
      .text(order.userId?.email || "—", 62, boxY + 46);

    // Right box — Invoice Details
    doc.rect(315, boxY, 230, 100).fill(light);
    doc.rect(315, boxY, 4, 100).fill(green); // left accent

    doc.fontSize(9).font("Helvetica-Bold").fillColor(gray)
      .text("INVOICE DETAILS", 327, boxY + 12);

    const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-BD", {
      timeZone: "Asia/Dhaka",
      day: "2-digit", month: "long", year: "numeric"
    });

    const details = [
      ["Invoice No:", order.tranId.substring(0, 13) + "..."],
      ["Date:",       invoiceDate],
      ["Method:",     order.method.charAt(0).toUpperCase() + order.method.slice(1)],
      ["Status:",     order.status.charAt(0).toUpperCase() + order.status.slice(1)],
    ];

    details.forEach(([key, val], i) => {
      const y = boxY + 28 + i * 16;
      doc.fontSize(9).font("Helvetica-Bold").fillColor(gray).text(key, 327, y);
      doc.fontSize(9).font("Helvetica").fillColor(dark).text(val, 410, y);
    });

    // ============================================================
    // ITEMS TABLE
    // ============================================================
    const tableY = boxY + 120;

    // Table title
    doc.fontSize(9).font("Helvetica-Bold").fillColor(gray)
      .text("ITEMS PURCHASED", 50, tableY);

    // Table header
    const headerY = tableY + 15;
    doc.rect(50, headerY, 495, 28).fill(green);

    doc.fontSize(10).font("Helvetica-Bold").fillColor("#ffffff")
      .text("#",           60,  headerY + 9)
      .text("BOOK TITLE",  90,  headerY + 9)
      .text("PRICE",       490, headerY + 9, { align: "right", width: 50 });

    // Table rows
    let rowY = headerY + 28;
    order.books.forEach((book, i) => {
      // Alternating row background
      if (i % 2 === 0) {
        doc.rect(50, rowY, 495, 26).fill("#f9fafb");
      }

      doc.fontSize(10).font("Helvetica").fillColor(dark)
        .text(`${i + 1}`, 60, rowY + 8)
        .text(book.title || "Book", 90, rowY + 8, { width: 350 })
        .text(`৳ ${Number(book.price || 0).toFixed(2)}`, 490, rowY + 8, { align: "right", width: 50 });

      // Row border
      doc.moveTo(50, rowY + 26).lineTo(545, rowY + 26)
        .lineWidth(0.5).strokeColor("#e5e7eb").stroke();

      rowY += 26;
    });

    // ============================================================
    // TOTALS
    // ============================================================
    const totalY = rowY + 16;

    // Discount
    if (order.discountAmount > 0) {
      doc.fontSize(10).font("Helvetica").fillColor(gray)
        .text("Discount:", 350, totalY)
        .fillColor("#dc2626")
        .text(`− ৳ ${order.discountAmount.toFixed(2)}`, 490, totalY, { align: "right", width: 50 });
    }

    // Tax
    if (order.tax > 0) {
      doc.fontSize(10).font("Helvetica").fillColor(gray)
        .text("Tax:", 350, totalY + 18)
        .fillColor(dark)
        .text(`+ ৳ ${order.tax.toFixed(2)}`, 490, totalY + 18, { align: "right", width: 50 });
    }

    // Grand total box
    const grandY = totalY + (order.tax > 0 ? 36 : order.discountAmount > 0 ? 18 : 0);
    doc.rect(350, grandY, 195, 32).fill(green);

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#ffffff")
      .text("TOTAL PAID", 360, grandY + 10)
      .text(`৳ ${Number(order.amount).toFixed(2)}`, 490, grandY + 10, { align: "right", width: 50 });

    // ============================================================
    // FOOTER
    // ============================================================
    const footerY = doc.page.height - 80;

    doc.moveTo(50, footerY).lineTo(545, footerY)
      .lineWidth(1).strokeColor("#e5e7eb").stroke();

    doc.fontSize(9).font("Helvetica").fillColor(gray)
      .text("ReadNova — Digital Library", 50, footerY + 12)
      .text("support@readnova.com  |  +880 1734-567890", 50, footerY + 26)
      .text("book-management-system-one-nu.vercel.app", 50, footerY + 40);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(green)
      .text("Thank you for your purchase! 📚", 350, footerY + 12, { align: "right", width: 195 });

    doc.fontSize(8).font("Helvetica").fillColor(gray)
      .text("This is a computer-generated invoice.", 350, footerY + 28, { align: "right", width: 195 })
      .text("No signature required.", 350, footerY + 40, { align: "right", width: 195 });

    // ── Finalize PDF
    doc.end();

  } catch (err) {
    console.error("Invoice PDF error:", err);
    res.status(500).json({ message: "PDF generation failed", error: err.message });
  }
});

module.exports = router;