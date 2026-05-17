import { useLocation, useNavigate } from "react-router-dom";

const BASE_URL = "https://book-management-system-ks6w.onrender.com"; // 🔥 backend URL

const BookDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const book = location.state; // 🔥 book data

  // ❌ safety check (important)
  if (!book) {
    return <p className="p-6 text-center">No book data found ❌</p>;
  }

  // ================= ADD TO CART =================
  const handleAddToCart = () => {

    const user = JSON.parse(localStorage.getItem("user"));

    // ❌ if not logged in
    if (!user) {
      alert("Please login first ❌");
      navigate("/login");
      return;
    }

    // 📦 get existing cart
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // 🔁 prevent duplicate
    const already = cart.find((b) => b._id === book._id);
    if (already) {
      alert("Already in cart ⚠️");
      return;
    }

    // ➕ add to cart
    cart.push(book);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Added to cart ✅");

    // 👉 go to cart page
    navigate("/cart");
  };

  return (
    <div className="p-6">

      {/* ================= IMAGE ================= */}
      <img
        src={
          book.coverImage
            ? `${BASE_URL}${book.coverImage}` // ✅ FIX (image path)
            : "https://via.placeholder.com/200"
        }
        className="h-60 mb-4"
      />

      {/* ================= TITLE ================= */}
      <h1 className="text-2xl font-bold">{book.title}</h1>

      {/* ================= DESCRIPTION ================= */}
      <p className="mt-2 text-gray-600">
        {book.description || "No description available"}
      </p>

      {/* ================= PRICE ================= */}
      <p className="mt-2 font-bold text-blue-600">
        ৳ {book.price}
      </p>

      {/* ================= BUTTON ================= */}
      <button
        onClick={handleAddToCart}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Add to Cart
      </button>

    </div>
  );
};

export default BookDetails;