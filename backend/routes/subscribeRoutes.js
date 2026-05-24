// ============================================================
// 📄 backend/routes/subscribeRoutes.js
// POST /api/subscribe — email save করে + confirmation email পাঠায়
// ============================================================

const express      = require("express");
const router       = express.Router();
const nodemailer   = require("nodemailer");
const Subscriber   = require("../models/Subscriber");

// ── Nodemailer transporter (Gmail) ────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // .env: EMAIL_USER=limaakter9077@gmail.com
    pass: process.env.EMAIL_PASS, // .env: EMAIL_PASS=haju avfh iyyr hekn
  },
});

// ── POST /api/subscribe ───────────────────────────────────
router.post("/", async (req, res) => {
  const { email } = req.body;

  // ── Validation ────────────────────────────────────────
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  try {
    // ── Check duplicate ───────────────────────────────
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    // ── Save to database ──────────────────────────────
    await Subscriber.create({ email: email.toLowerCase() });

    // ── Send confirmation email to subscriber ─────────
    await transporter.sendMail({
      from:    `"ReadNOVA" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "🎉 Welcome to ReadNOVA Newsletter!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            body { font-family: Arial, sans-serif; background: #f0f7fa; margin: 0; padding: 20px; }
            .wrap { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .hd { background: linear-gradient(135deg,#0e5a6f,#083a47); padding: 32px 24px; text-align: center; }
            .hd h1 { color: #fff; font-size: 28px; margin: 0; letter-spacing: -0.5px; }
            .hd h1 span { color: #facc15; }
            .hd p { color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px; }
            .body { padding: 28px 32px 24px; }
            .body p { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 14px; }
            ul { color: #374151; font-size: 14px; line-height: 2.2; padding-left: 20px; margin: 0 0 20px; }
            .btn { display: inline-block; padding: 13px 28px; background: linear-gradient(135deg,#0e5a6f,#0c4a5a); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin: 8px 0 20px; }
            .ft { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="hd">
              <h1>Read<span>NOVA</span></h1>
              <p>Digital Book Library — Ignite Your Knowledge</p>
            </div>
            <div class="body">
              <p>Hello! 👋</p>
              <p>Thank you for subscribing to <strong>ReadNOVA Newsletter</strong>! You'll now be the first to know about:</p>
              <ul>
                <li>📚 New book arrivals every week</li>
                <li>🎉 Exclusive discounts and offers</li>
                <li>⭐ Featured and bestselling books</li>
                <li>📖 Blog posts and reading tips</li>
              </ul>
              <p>Ready to explore? Browse our collection now:</p>
              <a href="https://book-management-system-one-nu.vercel.app/shop" class="btn">
                Browse Books →
              </a>
              <p style="font-size:13px;color:#94a3b8">
                If you did not subscribe to ReadNOVA, you can safely ignore this email.
              </p>
            </div>
            <div class="ft">
              © ${new Date().getFullYear()} ReadNOVA · Dhaka, Bangladesh<br/>
              support@readnova.com
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // ── Notify admin ──────────────────────────────────
    transporter.sendMail({
      from:    `"ReadNOVA System" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_USER,
      subject: `📬 New Subscriber: ${email}`,
      html:    `
        <p><strong>New newsletter subscriber!</strong></p>
        <p>Email: <strong>${email}</strong></p>
        <p>Time: ${new Date().toLocaleString("en-BD", { timeZone:"Asia/Dhaka" })}</p>
      `,
    }).catch(() => {}); // admin notify fail হলেও user response block হবে না

    res.json({ success: true, message: "Subscribed successfully! Check your inbox." });

  } catch (err) {
    console.error("SUBSCRIBE ERROR:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }
    if (err.message?.includes("Invalid login") || err.message?.includes("auth")) {
      return res.status(500).json({ message: "Email config error. Please contact admin." });
    }

    res.status(500).json({ message: "Failed to subscribe. Please try again." });
  }
});

// ── GET /api/subscribe/list — Admin: all subscribers দেখো ──
router.get("/list", async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .sort({ subscribedAt: -1 })
      .select("email subscribedAt");
    res.json({ count: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscribers" });
  }
});

module.exports = router;