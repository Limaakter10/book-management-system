const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const msg = await Message.create(req.body);
  res.json(msg);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
};