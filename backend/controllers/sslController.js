import Order from "../models/Order.js";
import User from "../models/User.js";

export const sslSuccess = async (req, res) => {
  try {
    const { tran_id } = req.body;

    const order = await Order.findById(tran_id);

    if (!order) {
      return res.redirect("http://localhost:5173/payment-fail");
    }

    // ✅ update order
    order.status = "approved";
    await order.save();

    // ✅ add books to library
    const user = await User.findById(order.userId);

    if (user) {
      const bookIds = order.books.map(b => b.bookId.toString());

      user.library = [
        ...new Set([
          ...user.library.map(id => id.toString()),
          ...bookIds
        ])
      ];

      await user.save();
    }

    res.redirect("http://localhost:5173/payment-success");

  } catch (err) {
    console.log(err);
    res.redirect("http://localhost:5173/payment-fail");
  }
};