import { useEffect, useState } from "react";
import api from "../api/axios"; // ✅ use axios instance

const Recommendation = () => {

  // ================= STATE =================
  const [books, setBooks] = useState([]);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      // ✅ API call (no localhost)
      const res = await api.get("/api/books");

      setBooks(res.data.books || []);

    } catch (err) {
      console.error("Recommendation error:", err);
    }
  };

  // ================= BASE URL =================
  const BASE_URL = "https://book-management-system-ks6w.onrender.com";

  return (
    <div className="p-6 bg-gray-50">

      {/* ================= TITLE ================= */}
      <h2 className="text-2xl font-bold mb-6 text-center">
        📚 Recommended Books
      </h2>

      {/* ================= GRID ================= */}
      <div className="grid md:grid-cols-3 gap-6">

        {books.slice(0, 6).map((book) => (
          <div
            key={book._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition"
          >

            {/* ================= IMAGE ================= */}
            <img
              src={
                book.coverImage
                  ? `${BASE_URL}${book.coverImage}` // ✅ FIXED IMAGE
                  : "https://via.placeholder.com/300"
              }
              alt={book.title}
              className="w-full h-48 object-cover rounded mb-3"
            />

            {/* ================= TITLE ================= */}
            <h3 className="font-semibold text-lg">
              {book.title}
            </h3>

            {/* ================= AUTHOR ================= */}
            <p className="text-sm text-gray-500">
              {book.author}
            </p>

            {/* ================= PRICE ================= */}
            <p className="mt-2 font-bold text-blue-600">
              {book.price === 0 ? "FREE" : `৳ ${book.price}`}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
};

export default Recommendation;