// ============================================================
// 📄 ReviewModal.jsx
// Book review modal — write, edit, delete, view all reviews
// Uses /api/reviews backend routes
// ============================================================

import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

// ── Star Rating Component ─────────────────────────────────────
// Click to rate, hover to preview, readOnly just shows
const StarRating = ({ rating, onRate, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display:"flex", gap:"8px", justifyContent:"center" }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          onClick={() => !readOnly && onRate(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            fontSize:"2rem",
            cursor: readOnly ? "default" : "pointer",
            color: star <= (hovered || rating) ? "#f59e0b" : "#d1d5db",
            transition:"color 0.15s ease",
            userSelect:"none",
          }}
        >★</span>
      ))}
    </div>
  );
};

// ============================================================
// 📝 ReviewModal Component
// Props:
//   book    — book object (._id, .title, .author, .coverImage)
//   onClose — function to close the modal
// ============================================================
const ReviewModal = ({ book, onClose }) => {

  // ── State ─────────────────────────────────────────────────
  const [rating,       setRating]       = useState(0);
  const [comment,      setComment]      = useState("");
  const [reviews,      setReviews]      = useState([]);
  const [avgRating,    setAvgRating]    = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [myReview,     setMyReview]     = useState(null);
  const [successMsg,   setSuccessMsg]   = useState("");
  const [errorMsg,     setErrorMsg]     = useState("");
  const [activeTab,    setActiveTab]    = useState("write");

  const { user } = useContext(AuthContext);

  // ── Fetch reviews when modal opens ───────────────────────
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setFetchLoading(true);

        // Get all reviews for this book
        const res = await axios.get(`/api/reviews/${book._id}`);
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.averageRating || 0);
        setTotalReviews(res.data.totalReviews || 0);

        // If logged in, get current user's review
        if (user) {
          const myRes = await axios.get(`/api/reviews/${book._id}/my-review`);
          if (myRes.data.review) {
            setMyReview(myRes.data.review);
            setRating(myRes.data.review.rating);
            setComment(myRes.data.review.comment);
          }
        }
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchReviews();
  }, [book._id, user]);

  // ── Submit review ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorMsg("Please give a rating (1-5 stars)");
      return;
    }
    if (comment.trim().length < 10) {
      setErrorMsg("Review must be at least 10 characters");
      return;
    }
    try {
      setLoading(true);
      setErrorMsg("");

      await axios.post(`/api/reviews/${book._id}`, { rating, comment });

      // Refresh reviews after submit
      const res = await axios.get(`/api/reviews/${book._id}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);

      setSuccessMsg(myReview ? "Review updated! ✓" : "Review submitted! ✓");
      setMyReview({ rating, comment });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMsg(err.response?.data?.message || "Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete review ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      // Find user's review in the list to get its _id
      const myFullReview = reviews.find(
        r => r.user?._id === user?._id || r.user === user?._id
      );
      if (myFullReview) {
        await axios.delete(`/api/reviews/${myFullReview._id}`);
      }
      // Reset form
      setMyReview(null);
      setRating(0);
      setComment("");
      setSuccessMsg("Review deleted");

      // Refresh list
      const res = await axios.get(`/api/reviews/${book._id}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (err) {
      setErrorMsg("Failed to delete review");
    }
  };

  // ── Helpers ───────────────────────────────────────────────
  const getRatingLabel = r => ({
    1:"Poor", 2:"Fair", 3:"Good", 4:"Very Good", 5:"Excellent"
  }[r] || "");

  const formatDate = d => new Date(d).toLocaleDateString("en-US", {
    year:"numeric", month:"short", day:"numeric"
  });

  // Cover image URL
  const coverSrc = book.coverImage
    ? (book.coverImage.startsWith("http") ? book.coverImage : BASE_URL + book.coverImage)
    : "/placeholder-book.png";

  // ── Render ────────────────────────────────────────────────
  return (
    // Backdrop
    <div onClick={onClose} style={{
      position:"fixed", top:0, left:0,
      width:"100%", height:"100%",
      backgroundColor:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:"16px",
    }}>

      {/* Modal box */}
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor:"#fff", borderRadius:"16px",
        width:"100%", maxWidth:"540px",
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 25px 50px rgba(0,0,0,0.25)",
      }}>

        {/* ── Header: book info + close ── */}
        <div style={{
          padding:"20px 24px 16px",
          borderBottom:"1px solid #e5e7eb",
          display:"flex", alignItems:"center", gap:"12px",
          position:"sticky", top:0, backgroundColor:"#fff", zIndex:10,
        }}>
          {/* Book cover thumbnail */}
          <img
            src={coverSrc}
            alt={book.title}
            style={{ width:"48px", height:"64px", objectFit:"cover", borderRadius:"6px", flexShrink:0 }}
            onError={e => { e.target.src = "/placeholder-book.png"; }}
          />

          <div style={{ flex:1 }}>
            <h2 style={{ margin:0, fontSize:"1.1rem", fontWeight:"700", color:"#111827" }}>
              {book.title}
            </h2>
            <p style={{ margin:"2px 0 0", fontSize:"0.85rem", color:"#6b7280" }}>
              {book.author}
            </p>
            {/* Average rating summary */}
            {!fetchLoading && (
              <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"4px" }}>
                <span style={{ color:"#f59e0b" }}>★</span>
                <span style={{ fontWeight:"600", fontSize:"0.9rem" }}>
                  {Number(avgRating).toFixed(1)}
                </span>
                <span style={{ color:"#9ca3af", fontSize:"0.8rem" }}>
                  ({totalReviews} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button onClick={onClose} style={{
            background:"none", border:"none",
            fontSize:"1.5rem", cursor:"pointer", color:"#6b7280",
          }}>✕</button>
        </div>

        {/* ── Tab navigation ── */}
        <div style={{ display:"flex", borderBottom:"1px solid #e5e7eb" }}>
          {[
            { id:"write", label: myReview ? "✏️ Edit Review" : "✍️ Write Review" },
            { id:"all",   label: `💬 All Reviews (${totalReviews})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex:1, padding:"12px", border:"none", background:"none",
              cursor:"pointer", fontSize:"0.9rem",
              fontWeight: activeTab === tab.id ? "700" : "400",
              color: activeTab === tab.id ? "#2563eb" : "#6b7280",
              borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "2px solid transparent",
              transition:"all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"20px 24px" }}>

          {/* ── TAB 1: Write/Edit Review ── */}
          {activeTab === "write" && (
            <div>
              {/* Not logged in */}
              {!user ? (
                <div style={{ textAlign:"center", padding:"32px 0", color:"#6b7280" }}>
                  <p style={{ fontSize:"2rem", margin:"0 0 8px" }}>🔒</p>
                  <p>Please login to write a review</p>
                </div>
              ) : (
                <>
                  {/* Success message */}
                  {successMsg && (
                    <div style={{
                      backgroundColor:"#d1fae5", color:"#065f46",
                      padding:"10px 14px", borderRadius:"8px",
                      marginBottom:"16px", fontWeight:"500",
                    }}>
                      {successMsg}
                    </div>
                  )}

                  {/* Error message */}
                  {errorMsg && (
                    <div style={{
                      backgroundColor:"#fee2e2", color:"#991b1b",
                      padding:"10px 14px", borderRadius:"8px", marginBottom:"16px",
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  {/* Star rating input */}
                  <div style={{ marginBottom:"20px", textAlign:"center" }}>
                    <p style={{ marginBottom:"12px", fontWeight:"600", color:"#374151" }}>
                      Your Rating:
                    </p>
                    <StarRating rating={rating} onRate={setRating} />
                    {rating > 0 && (
                      <p style={{ marginTop:"8px", color:"#f59e0b", fontWeight:"600" }}>
                        {getRatingLabel(rating)}
                      </p>
                    )}
                  </div>

                  {/* Comment textarea */}
                  <div style={{ marginBottom:"20px" }}>
                    <label style={{
                      display:"block", marginBottom:"8px",
                      fontWeight:"600", color:"#374151", fontSize:"0.9rem",
                    }}>
                      Your Review:
                    </label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your thoughts about this book..."
                      maxLength={500}
                      rows={5}
                      style={{
                        width:"100%", padding:"12px",
                        border:"1.5px solid #d1d5db", borderRadius:"10px",
                        fontSize:"0.95rem", resize:"vertical", outline:"none",
                        fontFamily:"inherit", boxSizing:"border-box", lineHeight:"1.6",
                      }}
                      onFocus={e => e.target.style.borderColor = "#2563eb"}
                      onBlur={e  => e.target.style.borderColor = "#d1d5db"}
                    />
                    <p style={{ textAlign:"right", fontSize:"0.8rem", color:"#9ca3af", margin:"4px 0 0" }}>
                      {comment.length}/500
                    </p>
                  </div>

                  {/* Submit + Delete buttons */}
                  <div style={{ display:"flex", gap:"10px" }}>
                    <button onClick={handleSubmit} disabled={loading} style={{
                      flex:1, padding:"12px",
                      backgroundColor: loading ? "#93c5fd" : "#2563eb",
                      color:"#fff", border:"none", borderRadius:"10px",
                      fontSize:"1rem", fontWeight:"600",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}>
                      {loading ? "Submitting..." : myReview ? "✏️ Update Review" : "📝 Submit Review"}
                    </button>

                    {/* Delete — only shown if user already has a review */}
                    {myReview && (
                      <button onClick={handleDelete} style={{
                        padding:"12px 16px",
                        backgroundColor:"#fee2e2", color:"#dc2626",
                        border:"none", borderRadius:"10px",
                        cursor:"pointer", fontWeight:"600",
                      }}>
                        🗑️
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB 2: All Reviews list ── */}
          {activeTab === "all" && (
            <div>
              {fetchLoading ? (
                <div style={{ textAlign:"center", padding:"32px", color:"#6b7280" }}>
                  Loading...
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px", color:"#6b7280" }}>
                  <p style={{ fontSize:"2rem", margin:"0 0 8px" }}>📭</p>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {reviews.map(review => (
                    <div key={review._id} style={{
                      padding:"14px", backgroundColor:"#f9fafb",
                      borderRadius:"10px", border:"1px solid #e5e7eb",
                    }}>
                      {/* Review header: user + stars */}
                      <div style={{
                        display:"flex", justifyContent:"space-between",
                        alignItems:"center", marginBottom:"8px",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          {/* Avatar: first letter of name */}
                          <div style={{
                            width:"32px", height:"32px", borderRadius:"50%",
                            backgroundColor:"#2563eb", color:"#fff",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontWeight:"700", fontSize:"0.85rem", flexShrink:0,
                          }}>
                            {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p style={{ margin:0, fontWeight:"600", fontSize:"0.9rem" }}>
                              {review.user?.name || "Anonymous"}
                            </p>
                            <p style={{ margin:0, fontSize:"0.75rem", color:"#9ca3af" }}>
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Star display (read-only) */}
                        <div style={{ display:"flex", gap:"2px" }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{
                              color: s <= review.rating ? "#f59e0b" : "#d1d5db",
                              fontSize:"1rem",
                            }}>★</span>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <p style={{ margin:0, color:"#374151", fontSize:"0.9rem", lineHeight:"1.6" }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;