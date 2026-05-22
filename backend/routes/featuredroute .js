// ============================================================
// backend/routes/bookRoutes.js এ এই route add করো
// Book কে featured/unfeatured করার API
// ============================================================

// PATCH /api/books/:id/featured
// Body: { isFeatured: true/false }
router.patch("/:id/featured", async (req, res) => {
  try {
    const { isFeatured } = req.body;

    // Book find করো এবং isFeatured update করো
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isFeatured: isFeatured }, // true বা false
      { new: true }               // updated book return করো
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Updated!", book });

  } catch (err) {
    console.error("Featured update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});