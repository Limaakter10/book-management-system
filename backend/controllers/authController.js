const bcrypt = require("bcryptjs");
const User   = require("../models/User");

// =======================================================
// ✅ REGISTER — password bcrypt hash করে save করো
// POST /api/auth/register
// =======================================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // duplicate check
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    // hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword, // hashed
      role: "user",
    });

    await user.save();

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================================================
// ✅ LOGIN — bcrypt compare করো
// POST /api/auth/login
// =======================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // bcrypt compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      success: true,
      token: "demo-token-" + user._id,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role || "user" },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login };