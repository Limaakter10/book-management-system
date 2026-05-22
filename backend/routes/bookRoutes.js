const express = require("express");
const router  = express.Router();
const {
  getBooks, getBookById, addBook, updateBook, deleteBook
} = require("../controllers/bookController");
const upload = require("../middleware/upload");

// ── GET ───────────────────────────────────────────────────────
router.get("/",    getBooks);
router.get("/:id", getBookById);

// ── CREATE ───────────────────────────────────────────────────
router.post("/", addBook);
router.post(
  "/upload",
  upload.fields([{ name:"coverImage", maxCount:1 }, { name:"pdf", maxCount:1 }]),
  addBook
);

// ── UPDATE ───────────────────────────────────────────────────
router.put(
  "/:id",
  upload.fields([{ name:"coverImage", maxCount:1 }, { name:"pdf", maxCount:1 }]),
  updateBook
);

// ── FEATURED TOGGLE ──────────────────────────────────────────
// PATCH /api/books/:id/featured
// Body: { isFeatured: true } or { isFeatured: false }
router.patch("/:id/featured", async (req, res) => {
  try {
    const Book = require("../models/Book");
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isFeatured: req.body.isFeatured },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Updated!", book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE ───────────────────────────────────────────────────
router.delete("/:id", deleteBook);

module.exports = router;