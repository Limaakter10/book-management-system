const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Subscriber = require("../models/Subscriber");

// ✅ POST /api/subscribe
router.post("/", async (req, res) => {
  const { email } = req.body;

  // validation
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  try {
    // ✅ transporter inside route (VERY IMPORTANT)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // check duplicate
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    // save to DB
    await Subscriber.create({ email: email.toLowerCase() });

    // send email to user
    await transporter.sendMail({
      from: `"ReadNOVA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to ReadNOVA!",
      html: `
        <h2>Welcome to ReadNOVA 📚</h2>
        <p>Thanks for subscribing to our newsletter!</p>
        <p>You'll receive updates about books, offers and more.</p>
      `,
    });

    // send admin notification
    await transporter.sendMail({
      from: `"ReadNOVA System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "📬 New Subscriber",
      text: email,
    });

    res.json({
      success: true,
      message: "Subscribed successfully! Check your inbox.",
    });

  } catch (err) {
    console.error("SUBSCRIBE ERROR FULL:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Already subscribed!" });
    }

    res.status(500).json({
      message: "Failed to subscribe. Please try again.",
    });
  }
});

// ✅ GET all subscribers (admin)
router.get("/list", async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .select("email createdAt");

    res.json({
      count: subscribers.length,
      subscribers,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscribers" });
  }
});

module.exports = router;