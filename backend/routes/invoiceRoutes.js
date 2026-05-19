const express     = require("express");
const router      = express.Router();
const PDFDocument = require("pdfkit");
const Order       = require("../models/Order");

// ── PDF BUILDER ─────────────────────────────────────────────
const buildInvoicePDF = (doc, order, user, isAdmin) => {

  // ===== HEADER =====
  doc.fontSize(22).text("ReadNOVA Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(10);
  doc.text(`Customer: ${user?.name || "-"}`);
  doc.text(`Email: ${user?.email || "-"}`);
  doc.text(`Transaction ID: ${order.tranId}`);
  doc.moveDown();

  // ===== BOOKS =====
  doc.fontSize(12).text("Books Purchased:");
  doc.moveDown(0.5);

  let total = 0;

  (order.books || []).forEach((b, i) => {

    const title = b.title || "Book";

    // ✅ FIXED PRICE LOGIC
    const original = b.originalPrice ?? b.bookId?.price ?? 0;
    const discount = b.discount ?? 0;
    const final    = b.price ?? original;

    total += final;

    const priceText =
      discount > 0
        ? `BDT ${final} (was ${original}, -${discount}%)`
        : `BDT ${final}`;

    doc.text(`${i + 1}. ${title} — ${priceText}`);
  });

  doc.moveDown();

  // ===== TOTAL =====
  doc.fontSize(14).text(`Total Paid: BDT ${total}`, {
    align: "right"
  });

  doc.moveDown(2);

  // ===== FOOTER =====
  doc.fontSize(9).fillColor("gray")
    .text("Thank you for your purchase!", { align: "center" })
    .text("ReadNOVA Digital Book Store", { align: "center" });
};

// ── FETCH ORDER ─────────────────────────────────────────────
const fetchOrder = async (tranId) => {
  return Order.findOne({ tranId: String(tranId) }) // ✅ important fix
    .populate("userId", "name email phone address")
    .populate("books.bookId", "title price");
};

// ── ENRICH DATA ─────────────────────────────────────────────
const enrichBooks = (order) => {
  const plain = order.toObject ? order.toObject() : { ...order };

  plain.books = (plain.books || []).map(b => ({
    ...b,
    title: b.title || b.bookId?.title || "Book",
    price: b.price ?? b.bookId?.price ?? 0,
  }));

  return plain;
};

// ============================================================
// ✅ ADMIN ROUTE FIRST
// ============================================================
router.get("/admin/:tranId", async (req, res) => {
  try {
    const raw = await fetchOrder(req.params.tranId);

    if (!raw) {
      console.log("❌ ORDER NOT FOUND:", req.params.tranId);
      return res.status(404).json({ message: "Order not found" });
    }

    const order = enrichBooks(raw);
    const user  = order.userId;

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Admin-Invoice-${order.tranId}.pdf"`
    );

    doc.pipe(res);
    buildInvoicePDF(doc, order, user, true);
    doc.end(); // ✅ IMPORTANT

  } catch (err) {
    console.error("ADMIN INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});

// ============================================================
// ✅ USER ROUTE LAST
// ============================================================
router.get("/:tranId", async (req, res) => {
  try {
    const raw = await fetchOrder(req.params.tranId);

    if (!raw) {
      console.log("❌ ORDER NOT FOUND:", req.params.tranId);
      return res.status(404).json({ message: "Order not found" });
    }

    const order = enrichBooks(raw);
    const user  = order.userId;

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Invoice-${order.tranId}.pdf"`
    );

    doc.pipe(res);
    buildInvoicePDF(doc, order, user, false);
    doc.end(); // ✅ IMPORTANT

  } catch (err) {
    console.error("INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});

module.exports = router;