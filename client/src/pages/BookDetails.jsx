import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { FaStar } from "react-icons/fa";

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://book-management-system-ks6w.onrender.com";

const BookDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [book,          setBook]          = useState(location.state || null);
  const [bookLoading,   setBookLoading]   = useState(!location.state);
  const [reviews,       setReviews]       = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews,  setTotalReviews]  = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showAll,       setShowAll]       = useState(false);

  // ── location.state না থাকলে API থেকে fetch করো ──
  useEffect(() => {
    if (location.state) return;
    if (!id) return;

    const fetchBook = async () => {
      try {
        setBookLoading(true);
        const res = await api.get(`/api/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error("Book fetch error:", err);
      } finally {
        setBookLoading(false);
      }
    };

    fetchBook();
  }, [id, location.state]);

  // ── Reviews fetch ──
  useEffect(() => {
    if (!book?._id) return;

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        const res = await api.get(`/api/reviews/${book._id}`);
        setReviews(res.data.reviews || []);
        setAverageRating(res.data.averageRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [book?._id]);

  // ── Loading state ──
  if (bookLoading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 16px", color: "#94a3b8" }}>
        Loading book details...
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ textAlign: "center", padding: "60px 16px" }}>
        <p style={{ fontSize: "1.2rem", color: "#ef4444" }}>❌ Book not found</p>
        <button
          onClick={() => navigate("/shop")}
          style={{ marginTop: 16, padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Go to Shop
        </button>
      </div>
    );
  }

  // ── Add to cart ──
  const handleAddToCart = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login first ❌");
      navigate("/login");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const already = cart.find((b) => b._id === book._id);
    if (already) {
      alert("Already in cart ⚠️");
      return;
    }
    cart.push(book);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart ✅");
    navigate("/cart");
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  // ── Discounted price ──
  const originalPrice   = Number(book.price || 0);
  const discountPercent = Number(book.discount || 0);
  const discountedPrice = discountPercent > 0
    ? Math.round(originalPrice - (originalPrice * discountPercent) / 100)
    : originalPrice;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "inherit" }}>

      {/* ── Book Cover ── */}
      <img
        src={book.coverImage ? `${BASE_URL}${book.coverImage}` : "https://via.placeholder.com/200"}
        alt={book.title}
        style={{ height: 240, borderRadius: 12, marginBottom: 16, objectFit: "cover", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
      />

      {/* ── Title ── */}
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
        {book.title}
      </h1>

      {/* ── Author ── */}
      {book.author && (
        <p style={{ color: "#64748b", marginBottom: 8, fontSize: "0.95rem" }}>
          by {book.author}
        </p>
      )}

      {/* ── Quick Rating Summary ── */}
      {totalReviews > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {[1,2,3,4,5].map(s => (
            <FaStar key={s} size={14} color={s <= Math.round(averageRating) ? "#f59e0b" : "#e2e8f0"} />
          ))}
          <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: "0.95rem" }}>
            {averageRating}
          </span>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      {/* ── Description ── */}
      <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
        {book.description || "No description available"}
      </p>

      {/* ── Price ── */}
      <div style={{ marginBottom: 16 }}>
        {discountPercent > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.3rem" }}>
              ৳ {discountedPrice}
            </span>
            <span style={{ color: "#94a3b8", textDecoration: "line-through", fontSize: "1rem" }}>
              ৳ {originalPrice}
            </span>
            <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: "0.8rem", fontWeight: 600 }}>
              -{discountPercent}%
            </span>
          </div>
        ) : (
          <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.3rem" }}>
            ৳ {originalPrice}
          </span>
        )}
      </div>

      {/* ── Add to Cart Button ── */}
      <button
        onClick={handleAddToCart}
        style={{
          padding: "12px 28px",
          backgroundColor: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 36,
        }}
      >
        🛒 Add to Cart
      </button>

      {/* ── REVIEW SECTION ── */}
      <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: 28 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            ⭐ Customer Reviews
          </h2>

          {totalReviews > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 10, padding: "8px 16px",
            }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#d97706" }}>
                {averageRating}
              </span>
              <div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(s => (
                    <FaStar key={s} size={12} color={s <= Math.round(averageRating) ? "#f59e0b" : "#e2e8f0"} />
                  ))}
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#92400e" }}>
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          )}
        </div>

        {reviewLoading && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
            Loading reviews...
          </div>
        )}

        {!reviewLoading && reviews.length === 0 && (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            backgroundColor: "#f8fafc", borderRadius: 12,
            border: "1px dashed #e2e8f0",
          }}>
            <p style={{ fontSize: "2rem", marginBottom: 8 }}>📭</p>
            <p style={{ color: "#64748b", fontWeight: 600 }}>No reviews yet</p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 4 }}>
              Buy this book and be the first to review!
            </p>
          </div>
        )}

        {!reviewLoading && reviews.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {visibleReviews.map((review) => (
              <div
                key={review._id}
                style={{
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                      color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "1rem", flexShrink: 0,
                    }}>
                      {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>
                        {review.user?.name || "Anonymous"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                    {[1,2,3,4,5].map(s => (
                      <FaStar key={s} size={13} color={s <= review.rating ? "#f59e0b" : "#e2e8f0"} />
                    ))}
                    <span style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 700, marginLeft: 4 }}>
                      {review.rating}.0
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, color: "#374151", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  {review.comment}
                </p>
              </div>
            ))}

            {reviews.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  padding: "10px",
                  backgroundColor: "#fff",
                  color: "#2563eb",
                  border: "1.5px solid #bfdbfe",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  marginTop: 4,
                }}
              >
                {showAll ? "▲ Show Less" : `▼ Show All ${reviews.length} Reviews`}
              </button>
            )}
          </div>
        )}

        {/* ── ✅ FIXED: /library → /my-library ── */}
        <div style={{
          marginTop: 24, padding: "14px 18px",
          backgroundColor: "#eff6ff",
          borderRadius: 10, border: "1px solid #bfdbfe",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: "1.2rem" }}>💡</span>
          <p style={{ margin: 0, color: "#1e40af", fontSize: "0.88rem" }}>
            <strong>Want to review this book?</strong> Purchase it first, then rate it from{" "}
            <span
              onClick={() => navigate("/my-library")}
              style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
            >
              My Library
            </span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;