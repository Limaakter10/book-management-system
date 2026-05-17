const User = require("../models/User");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ SAVE name + role
    const user = new User({
      name,                  // ✅ now saved
      email,
      password,
      role: "user"           // ✅ default role
    });

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ SEND CLEAN USER DATA (IMPORTANT)
    res.json({
      success: true,
      token: "demo-token",
      user: {
        _id: user._id,              // ✅ needed
        email: user.email,
        role: user.role || "user"   // ✅ VERY IMPORTANT
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { register, login };