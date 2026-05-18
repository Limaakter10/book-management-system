// ============================================================
// 📄 sslController.js
// SSL payment success/fail handler
// FIX: redirect URL এ tran_id যোগ করা হয়েছে
//      যাতে PaymentSuccess page invoice দেখাতে পারে
// ============================================================

import Order from "../models/Order.js";
import User  from "../models/User.js";

export const sslSuccess = async (req, res) => {
  try {
    const { tran_id } = req.body;

    // ── tran_id দিয়ে order খোঁজো (আগে findById ছিল — ভুল ছিল)
    // tran_id হলো tranId field, _id না
    const order = await Order.findOne({ tranId: tran_id });

    if (!order) {
      return res.redirect("http://localhost:5173/payment-fail");
    }

    // ── order status update
    order.status = "paid";
    order.paidAt = new Date();
    await order.save();

    // ── user library তে books add করো
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

    // ── FIX: redirect এ tran_id পাঠাও
    // PaymentSuccess page এটা দিয়ে order fetch করবে → invoice দেখাবে
    res.redirect(`http://localhost:5173/payment-success?tran_id=${tran_id}`);

  } catch (err) {
    console.error("SSL Success Error:", err);
    res.redirect("http://localhost:5173/payment-fail");
  }
};
