// ================= IMPORT =================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// ================= DATABASE =================
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ebook-shop";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  });

// ================= ROUTES =================

// import routes
const bookRoutes = require("./routes/bookRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const bookReader = require("./routes/bookReader");
const paymentRoutes = require("./routes/paymentRoutes");
const sslRoutes = require("./routes/sslRoutes");
const messageRoutes = require("./routes/messageRoutes");

// use routes
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ssl", sslRoutes); // ✅ ONLY THIS (important)
app.use("/api/read", bookReader);
app.use("/api/admin", require("./routes/admin"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/ads", require("./routes/adRoutes"));
app.use("/api/messages", messageRoutes);
// invoice route
app.use("/api/invoice", require("./routes/invoiceRoutes"));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});