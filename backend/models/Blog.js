const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  author: String,
  category: String
}, { timestamps: true }); // ✅ THIS IS REQUIRED

module.exports = mongoose.model("Blog", blogSchema);