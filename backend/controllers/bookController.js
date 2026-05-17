const Book = require("../models/Book");

// ===============================
// ✅ GET ALL BOOKS (FILTER)
// ===============================
const getBooks = async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    let filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (subCategory) {
      filter.subCategory = subCategory;
    }

    const books = await Book.find(filter);

    res.json({
      success: true,
      count: books.length,
      books
    });

  } catch (error) {
    console.log("GET BOOKS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch books"
    });
  }
};

// ===============================
// ✅ GET SINGLE BOOK (FOR READER)
// ===============================
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // 🔥 IMPORTANT: return direct object (fix reader)
    res.json(book);

  } catch (error) {
    console.log("GET ONE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching book"
    });
  }
};

// ===============================
// ✅ ADD BOOK (WITH FILE UPLOAD)
// ===============================
const addBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,

      pdfUrl: req.files?.pdf
        ? `/uploads/pdfs/${req.files.pdf[0].filename}`
        : "",

      coverImage: req.files?.coverImage
        ? `/uploads/covers/${req.files.coverImage[0].filename}`
        : ""
    };

    const newBook = new Book(bookData);
    const savedBook = await newBook.save();

    res.status(201).json({
      success: true,
      book: savedBook
    });

  } catch (error) {
    console.log("ADD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add book"
    });
  }
};

// ===============================
// ✅ UPDATE BOOK (🔥 FIXED)
// ===============================
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // ===== TEXT FIELDS =====
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.price = req.body.price || book.price;
    book.category = req.body.category || book.category;
    book.subCategory = req.body.subCategory || book.subCategory;
    book.discount = req.body.discount || book.discount;

    // ===== FILES =====
    if (req.files?.coverImage) {
      book.coverImage = `/uploads/covers/${req.files.coverImage[0].filename}`;
    }

    if (req.files?.pdf) {
      book.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
    }

    const updatedBook = await book.save();

    res.json({
      success: true,
      book: updatedBook
    });

  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book"
    });
  }
};

// ===============================
// ✅ DELETE BOOK
// ===============================
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    res.json({
      success: true,
      message: "Book deleted successfully"
    });

  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete book"
    });
  }
};

// ===============================
module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
};