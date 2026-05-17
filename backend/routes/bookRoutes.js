const express = require("express");
const router = express.Router();

const {
  getBooks,
  getBookById,
  addBook,
  updateBook,     // ✅ ADD THIS
  deleteBook      // ✅ ADD THIS
} = require("../controllers/bookController");

const upload = require("../middleware/upload");

// ================= GET =================
router.get("/", getBooks);
router.get("/:id", getBookById);

// ================= CREATE =================
router.post("/", addBook);

// upload with files
router.post(
  "/upload",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  addBook
);

// ================= UPDATE (🔥 FIX) =================
router.put(
  "/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  updateBook
);

// ================= DELETE =================
router.delete("/:id", deleteBook);

module.exports = router;