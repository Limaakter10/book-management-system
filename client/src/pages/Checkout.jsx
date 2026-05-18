import { useState } from "react";
import api from "../api/axios";
import { HiOutlineCreditCard } from "react-icons/hi";

const Checkout = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // ── Step 1: logged-in user
      const userId = localStorage.getItem("userId");
      if (!userId) { alert("⚠️ Please login first"); return; }

      // ── Step 2: cart data
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) { alert("⚠️ Your cart is empty"); return; }

      // ── Step 3: books array — FIX: title + price যোগ করা হয়েছে
      // আগে শুধু bookId ছিল → invoice এ "Book" আর ৳0 দেখাত
      // এখন title + price সহ পাঠানো হচ্ছে → invoice এ সঠিক data দেখাবে
      const books = cart.map((book) => ({
        bookId: book._id,               // DB reference
        title:  book.title  || "Book",  // ← invoice এ book name
        price:  Number(book.price || 0) // ← invoice এ price
      }));

      // ── Step 4: total amount
      const amount = cart.reduce(
        (total, book) => total + Number(book.price || 0), 0
      );

      // ── Step 5: SSL init call
      const res = await api.post("/api/ssl/init", {
        amount,
        userId,
        books, // ← title + price সহ
      });

      // ── Step 6: SSLCommerz এ redirect
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert("❌ Payment URL not generated");
      }

    } catch (error) {
      console.error("❌ Payment Error:", error);
      alert("Something went wrong during payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition"
    >
      <HiOutlineCreditCard className="text-xl" />
      {loading ? "Processing Payment..." : "Pay Now"}
    </button>
  );
};

export default Checkout;