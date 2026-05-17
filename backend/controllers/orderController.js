import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    res.json({ message: "Order placed", order });

  } catch (err) {
    res.status(500).json(err);
  }
};