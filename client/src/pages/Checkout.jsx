import { useState } from "react";
import api from "../api/axios";
import { HiOutlineCreditCard } from "react-icons/hi";

const Checkout = () => {
  // ================= STATE =================
  const [loading, setLoading] = useState(false);

  // ================= HANDLE PAYMENT =================
  const handlePayment = async () => {
    try {
      setLoading(true);

      // 🔥 STEP 1: Get logged-in user
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("⚠️ Please login first");
        return;
      }

      // 🔥 STEP 2: Get cart data from localStorage
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      if (cart.length === 0) {
        alert("⚠️ Your cart is empty");
        return;
      }

      // 🔥 STEP 3: Convert cart → backend format
      const books = cart.map((book) => ({
        bookId: book._id, // backend expects this
      }));

      // 🔥 STEP 4: Calculate total price
      const amount = cart.reduce(
        (total, book) => total + Number(book.price || 0),
        0
      );

      console.log("📦 Sending books:", books);
      console.log("💰 Total amount:", amount);

      // 🔥 STEP 5: Call backend payment init API
      const res = await api.post("/api/ssl/init", {
        amount,
        userId,
        books,
      });

      // 🔥 STEP 6: Redirect to SSLCommerz
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

  // ================= UI =================
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