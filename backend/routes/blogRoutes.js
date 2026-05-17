const express = require("express");
const router = express.Router(); // ✅ THIS LINE WAS MISSING

const Blog = require("../models/Blog");

// ✅ CREATE BLOG
router.post("/", async (req, res) => {
  const blog = new Blog(req.body);
  await blog.save();
  res.json(blog);
});

// ✅ GET ALL BLOGS
router.get("/", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

// ✅ GET SINGLE BLOG
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

// ✅ UPDATE BLOG
router.put("/:id", async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(blog);
});

// ✅ DELETE BLOG
router.delete("/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;