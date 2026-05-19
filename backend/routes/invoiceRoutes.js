const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");

// GET /api/invoice/:tranId
router.get("/:tranId", async (req, res) => {
  try {
    const order = await Order.findOne({ tranId: req.params.tranId })
      .populate("userId", "email name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ReadNova-Invoice-${order.tranId}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Colors
    const green = "#16a34a";
    const dark = "#1a1a1a";
    const gray = "#6b7280";
    const light = "#f9fafb";

    // HEADER
    doc.rect(0, 0, doc.page.width, 8).fill(green);
    doc.moveDown(1);
    doc.fontSize(28).font("Helvetica-Bold").fillColor(green)
      .text("Read", 50, 40, { continued: true })
      .fillColor(dark)
      .text("Nova");
    doc.fontSize(11).font("Helvetica").fillColor(gray)
      .text("Digital Library — Ignite Your Knowledge", 50, 75);
    doc.fontSize(28).font("Helvetica-Bold").fillColor(dark)
      .text("INVOICE", 350, 40, { align: "right", width: 195 });
    doc.fontSize(11).font("Helvetica").fillColor(gray)
      .text(`#${order.tranId}`, 350, 75, { align: "right", width: 195 });
    const status = (order.status || "paid").toUpperCase();
    doc.fontSize(10).font("Helvetica-Bold")
      .fillColor(status === "PAID" ? green : "#ca8a04")
      .text(status, 350, 95, { align: "right", width: 195 });
    doc.moveTo(50, 120).lineTo(545, 120).lineWidth(2).strokeColor(green).stroke();

    // BILL TO & DETAILS
    const boxY = 135;

    // Bill To
    doc.rect(50, boxY, 230, 100).fill(light);
    doc.rect(50, boxY, 4, 100).fill(green);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(gray)
      .text("BILL TO", 62, boxY + 12);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(dark)
      .text(order.userId?.name || "Customer", 62, boxY + 28);
    doc.fontSize(10).font("Helvetica").fillColor(gray)
      .text(order.userId?.email || "-", 62, boxY + 46);

    // Invoice Details
    doc.rect(315, boxY, 230, 100).fill(light);
    doc.rect(315, boxY, 4, 100).fill(green);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(gray)
      .text("INVOICE DETAILS", 327, boxY + 12);

    const date = new Date(order.createdAt).toLocaleDateString("en-GB");
    const method = (order.method || "ssl").charAt(0).toUpperCase() + (order.method || "ssl").slice(1);

    const details = [
      ["Invoice No:", order.tranId.slice(0, 12) + "..."],
      ["Date:", date],
      ["Method:", method],
      ["Status:", status],
    ];

    details.forEach(([label, value], i) => {
      const y = boxY + 28 + i * 16;
      doc.fontSize(9).font("Helvetica-Bold").fillColor(gray).text(label, 327, y);
      doc.fontSize(9).font("Helvetica").fillColor(dark).text(value, 410, y);
    });

    // Items Table
    const tableY = boxY + 120;
    doc.fontSize(9).font("Helvetica-Bold").fillColor(gray)
      .text("ITEMS PURCHASED", 50, tableY);
    const headerY = tableY + 15;
    doc.rect(50, headerY, 495, 28).fill(green);
    doc.fillColor("#fff").fontSize(10).font("Helvetica-Bold")
      .text("#", 60, headerY + 9)
      .text("BOOK TITLE", 90, headerY + 9)
      .text("PRICE", 490, headerY + 9, { align: "right", width: 50 });

    let rowY = headerY + 28;
    let total = 0;

    (order.books || []).forEach((book, index) => {
      const price = Number(book.price ?? 0);
      total += price;
      if (index % 2 === 0) {
        doc.rect(50, rowY, 495, 26).fill("#f9fafb");
      }
      doc.fillColor(dark).fontSize(10).font("Helvetica")
        .text(`${index + 1}`, 60, rowY + 8)
        .text(book.title || "Book", 90, rowY + 8, { width: 350 })
        .text(`BDT ${price.toFixed(2)}`, 490, rowY + 8, {
          align: "right",
          width: 50,
        });
      rowY += 26;
    });

    // Final Total
    const finalTotal = Number(order.amount || total);
    doc.rect(350, rowY + 10, 195, 32).fill(green);
    doc.fillColor("#fff").fontSize(12).font("Helvetica-Bold")
      .text("TOTAL PAID", 360, rowY + 20)
      .text(`BDT ${finalTotal.toFixed(2)}`, 490, rowY + 20, {
        align: "right",
        width: 50,
      });

    // Footer
    const footerY = doc.page.height - 80;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#e5e7eb").stroke();
    doc.fillColor(gray).fontSize(9)
      .text("ReadNova — Digital Library", 50, footerY + 12)
      .text("support@readnova.com | +880 1734-567890", 50, footerY + 26);
    doc.fillColor(green).fontSize(9).font("Helvetica-Bold")
      .text("Thank you for your purchase!", 350, footerY + 12, {
        align: "right",
        width: 195,
      });

    doc.end();
  } catch (err) {
    console.error("Invoice Generation Error:", err);
    res.status(500).json({ message: "PDF generation failed" });
  }
});

module.exports = router;