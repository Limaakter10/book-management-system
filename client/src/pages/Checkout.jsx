import { useState } from "react";
import api from "../api/axios";
import { HiOutlineCreditCard } from "react-icons/hi";

const Checkout = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("⚠️ Please login first");
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) {
        alert("⚠️ Your cart is empty");
        return;
      }

      // Calculate books data with discount applied
      const books = cart.map((item) => {
        const originalPrice = Number(item.price || 0);
        const discountPercent = Number(item.discount || 0);
        const discountedPrice =
          discountPercent > 0
            ? originalPrice - (originalPrice * discountPercent) / 100
            : originalPrice;

        return {
          bookId: item._id,
          title: item.title || "Book",
          price: discountedPrice,
          originalPrice: originalPrice,
          discount: discountPercent,
        };
      });

      // Calculate subtotal (sum of discounted prices)
      const subtotal = books.reduce((sum, b) => sum + b.price, 0);
      const tax = subtotal * 0.05; // 5% tax
      const totalAmount = subtotal + tax;

      // Send data to server to initiate payment
      const response = await api.post("/api/ssl/init", {
        userId,
        books,
        subtotal,
        tax,
        amount: totalAmount,
      });

      if (response?.data?.url) {
        window.location.href = response.data.url;
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