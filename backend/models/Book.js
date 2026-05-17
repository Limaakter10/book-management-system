const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  price: Number,
  discount: String,

  category: String,
  subCategory: String,

  coverImage: String,
  pdfUrl: String,

  rating: Number,
  numReviews: Number,

  isFeatured: Boolean,
  isActive: Boolean,

  salesCount: Number,
  stock: Number
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);