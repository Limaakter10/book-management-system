const Message = require("../models/Message");

// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const msg = await Message.create({
      name,
      email,
      message,
      isResolved: false,
    });

    res.status(201).json(msg);

  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// ================= GET ALL =================
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);

  } catch (err) {
    console.error("GET MESSAGE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// ================= RESOLVE MESSAGE 🔥 =================
exports.resolveMessage = async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(updated);

  } catch (err) {
    console.error("RESOLVE ERROR:", err);
    res.status(500).json({ message: "Failed to update message" });
  }
};