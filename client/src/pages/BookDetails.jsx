import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://book-management-system-ks6w.onrender.com";

const BookDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id }   = useParams();
  const { addToCart } = useCart();

  const [book,          setBook]          = useState(location.state || null);
  const [bookLoading,   setBookLoading]   = useState(!location.state);
  const [reviews,       setReviews]       = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews,  setTotalReviews]  = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showAll,       setShowAll]       = useState(false);
  const [adding,        setAdding]        = useState(false);

  // Fetch book if not passed via state
  useEffect(() => {
    if (location.state || !id) return;
    (async () => {
      try {
        setBookLoading(true);
        const res = await api.get(`/api/books/${id}`);
        setBook(res.data);
      } catch (err) { console.error(err); }
      finally { setBookLoading(false); }
    })();
  }, [id, location.state]);

  // Fetch reviews
  useEffect(() => {
    if (!book?._id) return;
    (async () => {
      try {
        setReviewLoading(true);
        const res = await api.get(`/api/reviews/${book._id}`);
        setReviews(res.data.reviews || []);
        setAverageRating(res.data.averageRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      } catch (err) { console.error(err); }
      finally { setReviewLoading(false); }
    })();
  }, [book?._id]);

  if (bookLoading) return (
    <div style={{ textAlign:"center", padding:"80px 16px", color:"#94a3b8" }}>
      Loading book details...
    </div>
  );

  if (!book) return (
    <div style={{ textAlign:"center", padding:"80px 16px" }}>
      <p style={{ color:"#ef4444", fontSize:"1.1rem" }}>❌ Book not found</p>
      <button onClick={() => navigate("/shop")} style={s.ghostBtn}>Go to Shop</button>
    </div>
  );

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(book);
      navigate("/cart");
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const formatDate = d => new Date(d).toLocaleDateString("en-US", {
    year:"numeric", month:"short", day:"numeric"
  });

  const visibleReviews  = showAll ? reviews : reviews.slice(0, 3);
  const originalPrice   = Number(book.price    || 0);
  const discountPercent = Number(book.discount  || 0);
  const discountedPrice = discountPercent > 0
    ? Math.round(originalPrice * (1 - discountPercent / 100))
    : originalPrice;

  const coverSrc = book.coverImage
    ? (book.coverImage.startsWith("http") ? book.coverImage : `${BASE_URL}${book.coverImage}`)
    : "https://via.placeholder.com/300x420?text=Book";

  return (
    // ── Issue 01: max-width container ──────────────────────
    <div style={s.page}>

      {/* ── Issue 05: 2-column layout ── */}
      <div style={s.topGrid}>

        {/* LEFT: Cover image */}
        <div style={s.coverCol}>
          <img
            src={coverSrc}
            alt={book.title}
            style={s.coverImg}
            onError={e => { e.target.src="https://via.placeholder.com/300x420?text=Book"; }}
          />
        </div>

        {/* RIGHT: Book details */}
        <div style={s.detailCol}>

          {/* Category tag */}
          {book.subCategory && (
            <span style={s.tag}>{book.subCategory}</span>
          )}

          {/* Title */}
          <h1 style={s.title}>{book.title}</h1>

          {/* Author */}
          {book.author && (
            <p style={s.author}>by {book.author}</p>
          )}

          {/* Rating */}
          {totalReviews > 0 && (
            <div style={s.ratingRow}>
              {[1,2,3,4,5].map(s => (
                <FaStar key={s} size={15}
                  color={s <= Math.round(averageRating) ? "#f59e0b" : "#e2e8f0"}/>
              ))}
              <span style={s.ratingNum}>{Number(averageRating).toFixed(1)}</span>
              <span style={s.ratingCount}>({totalReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div style={s.priceRow}>
            {discountPercent > 0 ? (
              <>
                <span style={s.price}>৳ {discountedPrice}</span>
                <span style={s.origPrice}>৳ {originalPrice}</span>
                <span style={s.discBadge}>-{discountPercent}%</span>
              </>
            ) : (
              <span style={s.price}>
                {originalPrice === 0 ? "FREE" : `৳ ${originalPrice}`}
              </span>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <p style={s.desc}>{book.description}</p>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              ...s.cartBtn,
              background: adding ? "#86efac" : "#16a34a",
              cursor: adding ? "not-allowed" : "pointer",
            }}
          >
            <FaShoppingCart size={16}/>
            {adding ? "Adding…" : "Add to Cart"}
          </button>

          {/* Review notice */}
          <div style={s.notice}>
            <span>💡</span>
            <p style={s.noticeText}>
              Want to review?{" "}
              <span onClick={() => navigate("/library")} style={s.noticeLink}>
                Go to My Library
              </span>{" "}
              after purchase.
            </p>
          </div>

        </div>
      </div>

      {/* ── Reviews — full width below ── */}
      <div style={s.reviewSection}>

        <div style={s.reviewHeader}>
          <h2 style={s.reviewTitle}>⭐ Customer Reviews</h2>
          {totalReviews > 0 && (
            <div style={s.avgBox}>
              <span style={s.avgNum}>{Number(averageRating).toFixed(1)}</span>
              <div>
                <div style={{ display:"flex", gap:2 }}>
                  {[1,2,3,4,5].map(s => (
                    <FaStar key={s} size={12}
                      color={s <= Math.round(averageRating) ? "#f59e0b" : "#e2e8f0"}/>
                  ))}
                </div>
                <p style={s.avgCount}>{totalReviews} reviews</p>
              </div>
            </div>
          )}
        </div>

        {reviewLoading && (
          <p style={{ textAlign:"center", color:"#94a3b8", padding:"32px 0" }}>
            Loading reviews…
          </p>
        )}

        {!reviewLoading && reviews.length === 0 && (
          <div style={s.emptyReview}>
            <p style={{ fontSize:"2rem", marginBottom:8 }}>📭</p>
            <p style={{ fontWeight:600, color:"#64748b" }}>No reviews yet</p>
            <p style={{ color:"#94a3b8", fontSize:"0.85rem", marginTop:4 }}>
              Buy this book and be the first to review!
            </p>
          </div>
        )}

        {!reviewLoading && reviews.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {visibleReviews.map(review => (
              <div key={review._id} style={s.reviewCard}>
                <div style={s.reviewTop}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={s.avatar}>
                      {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p style={s.reviewName}>{review.user?.name || "Anonymous"}</p>
                      <p style={s.reviewDate}>{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:2, alignItems:"center" }}>
                    {[1,2,3,4,5].map(s => (
                      <FaStar key={s} size={12}
                        color={s <= review.rating ? "#f59e0b" : "#e2e8f0"}/>
                    ))}
                    <span style={{ fontSize:"0.8rem", color:"#f59e0b", fontWeight:700, marginLeft:4 }}>
                      {review.rating}.0
                    </span>
                  </div>
                </div>
                <p style={s.reviewComment}>{review.comment}</p>
              </div>
            ))}

            {reviews.length > 3 && (
              <button onClick={() => setShowAll(!showAll)} style={s.showMoreBtn}>
                {showAll ? "▲ Show Less" : `▼ Show All ${reviews.length} Reviews`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s = {
  // Issue 01: global container
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "36px 24px 60px",
    fontFamily: "inherit",
  },

  // Issue 05: 2-column top layout
  topGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 40,
    alignItems: "start",
    marginBottom: 48,
  },

  // LEFT column
  coverCol: {
    position: "sticky",
    top: 24,
  },
  coverImg: {
    width: "100%",
    aspectRatio: "2/3",       // Issue 03: fixed aspect ratio
    objectFit: "cover",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },

  // RIGHT column
  detailCol: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  tag: {
    display: "inline-block",
    fontSize: 11, fontWeight: 700,
    color: "#0e5a6f",
    background: "#e6f2f6",
    borderRadius: 20, padding: "3px 10px",
    letterSpacing: "0.06em", textTransform: "uppercase",
    width: "fit-content",
  },

  title: {
    fontSize: "1.8rem", fontWeight: 800,
    color: "#0f172a", lineHeight: 1.25,
    margin: 0,
  },

  author: {
    color: "#64748b", fontSize: "0.95rem", margin: 0,
  },

  ratingRow: {
    display: "flex", alignItems: "center", gap: 5,
  },
  ratingNum: {
    fontWeight: 700, color: "#f59e0b",
    fontSize: "0.95rem", marginLeft: 4,
  },
  ratingCount: {
    color: "#94a3b8", fontSize: "0.85rem",
  },

  priceRow: {
    display: "flex", alignItems: "center", gap: 10,
    margin: "4px 0",
  },
  price: {
    fontWeight: 800, color: "#0e5a6f",
    fontSize: "1.6rem",
  },
  origPrice: {
    color: "#94a3b8", textDecoration: "line-through",
    fontSize: "1rem",
  },
  discBadge: {
    background: "#dcfce7", color: "#16a34a",
    borderRadius: 6, padding: "2px 8px",
    fontSize: "0.8rem", fontWeight: 700,
  },

  desc: {
    color: "#475569", lineHeight: 1.75,
    fontSize: "0.95rem", margin: 0,
  },

  cartBtn: {
    padding: "14px 28px",
    color: "#fff", border: "none",
    borderRadius: 10, fontSize: "1rem", fontWeight: 700,
    display: "flex", alignItems: "center",
    gap: 10, width: "fit-content",
    boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
    transition: "opacity 0.2s",
  },

  notice: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "12px 16px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    marginTop: 8,
  },
  noticeText: {
    margin: 0, color: "#1e40af", fontSize: "0.88rem",
  },
  noticeLink: {
    fontWeight: 700, textDecoration: "underline", cursor: "pointer",
  },

  ghostBtn: {
    marginTop: 16, padding: "10px 24px",
    background: "#2563eb", color: "#fff",
    border: "none", borderRadius: 8, cursor: "pointer",
    fontSize: "0.95rem",
  },

  // Reviews section
  reviewSection: {
    borderTop: "2px solid #f1f5f9",
    paddingTop: 32,
  },
  reviewHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24, flexWrap: "wrap", gap: 12,
  },
  reviewTitle: {
    fontSize: "1.2rem", fontWeight: 700,
    color: "#0f172a", margin: 0,
  },
  avgBox: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 10, padding: "8px 16px",
  },
  avgNum: {
    fontSize: "1.8rem", fontWeight: 800, color: "#d97706",
  },
  avgCount: {
    margin: "2px 0 0", fontSize: "0.75rem", color: "#92400e",
  },

  emptyReview: {
    textAlign: "center", padding: "40px 20px",
    background: "#f8fafc", borderRadius: 12,
    border: "1px dashed #e2e8f0",
  },

  reviewCard: {
    padding: 16, background: "#f8fafc",
    borderRadius: 12, border: "1px solid #e2e8f0",
  },
  reviewTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 10,
  },
  avatar: {
    width: 38, height: 38, borderRadius: "50%",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 700,
    fontSize: "1rem", flexShrink: 0,
  },
  reviewName: {
    margin: 0, fontWeight: 600,
    fontSize: "0.95rem", color: "#1e293b",
  },
  reviewDate: {
    margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8",
  },
  reviewComment: {
    margin: 0, color: "#374151",
    fontSize: "0.9rem", lineHeight: 1.65,
  },

  showMoreBtn: {
    padding: 10, background: "#fff",
    color: "#2563eb",
    border: "1.5px solid #bfdbfe",
    borderRadius: 10, cursor: "pointer",
    fontWeight: 600, fontSize: "0.9rem",
    marginTop: 4,
  },
};

export default BookDetails;