const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  discount: String,
  link: String
}, { timestamps: true });

module.exports = mongoose.model("Ad", adSchema);