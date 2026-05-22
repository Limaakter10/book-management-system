import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FaChevronLeft, FaChevronRight, FaShoppingCart,
  FaCheck, FaStar, FaClock, FaTrophy, FaTag, FaBookOpen,
} from "react-icons/fa";
import { HiOutlineSparkles, HiOutlineLightningBolt, HiViewGrid } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const getDiscountPct = (discount) => {
  if (!discount && discount !== 0) return 0;
  const n = parseFloat(String(discount).replace("%", "").trim());
  return isNaN(n) || n <= 0 ? 0 : n;
};

const getDiscountedPrice = (price, discount) => {
  const pct = getDiscountPct(discount);
  if (pct <= 0) return Math.round(price);
  return Math.round(price * (1 - pct / 100));
};

const hasRealDiscount = (book) => getDiscountPct(book.discount) > 0;

const getBestsellerScore = (book) => {
  const reviews = Number(book.numReviews || 0);
  const rating  = Number(book.rating     || 0);
  return reviews * rating;
};

// ============================================================
// BookCard
// ============================================================
const BookCard = ({ book, onAdd, inCart, size = "lg", realRating, realTotalReviews, onView }) => {
  const isLg        = size === "lg";
  const pct         = getDiscountPct(book.discount);
  const hasDiscount = pct > 0;
  const finalPrice  = getDiscountedPrice(book.price, book.discount);

  const displayRating = realRating       ?? book.rating     ?? 0;
  const displayCount  = realTotalReviews ?? book.numReviews ?? 0;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      backgroundColor: "#fff", borderRadius: 14,
      boxShadow: "0 2px 10px rgba(14,90,111,0.08)",
      overflow: "hidden",
      height: isLg ? 315 : 260,
      width: isLg ? "100%" : 160,
      minWidth: isLg ? 130 : 160,
      maxWidth: isLg ? 190 : 160,
      transition: "transform 0.2s, box-shadow 0.2s",
      position: "relative", border: "1px solid #e6f2f6",
      flexShrink: 0,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(14,90,111,0.18)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(14,90,111,0.08)";
      }}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 3,
          background: "linear-gradient(135deg,#ef4444,#dc2626)",
          color: "#fff", borderRadius: 6, padding: "3px 8px",
          fontSize: 10, fontWeight: 800,
          display: "flex", alignItems: "center", gap: 3,
          boxShadow: "0 2px 6px rgba(239,68,68,0.4)",
        }}>
          <FaTag size={8} /> -{pct}%
        </div>
      )}

      {/* Featured badge */}
      {book.isFeatured && !hasDiscount && (
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 3,
          background: "linear-gradient(135deg,#f59e0b,#d97706)",
          color: "#fff", borderRadius: 6, padding: "3px 8px",
          fontSize: 9, fontWeight: 800,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <HiOutlineSparkles size={9} /> HOT
        </div>
      )}

      {/* Cover image */}
      <div
        onClick={() => onView && onView(book)}
        style={{
          flexShrink: 0,
          height: isLg ? 175 : 140,
          overflow: "hidden",
          background: "linear-gradient(135deg,#e6f2f6,#cce4ec)",
          cursor: "pointer",
        }}
      >
        <img
          src={
            book.coverImage
              ? book.coverImage.startsWith("http")
                ? book.coverImage
                : `${BASE_URL}${book.coverImage}`
              : "https://via.placeholder.com/150x200?text=Book"
          }
          alt={book.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
          onError={e => { e.target.src = "https://via.placeholder.com/150x200?text=Book"; }}
        />
      </div>

      {/* Info */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: isLg ? "10px 12px" : "7px 9px 8px",
        justifyContent: "space-between",
        overflow: "hidden",
      }}>

        {/* Title */}
        <p
          onClick={() => onView && onView(book)}
          style={{
            fontSize: isLg ? 13 : 11, fontWeight: 700, color: "#0f172a",
            lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
            marginBottom: 3, cursor: "pointer",
          }}
        >
          {book.title}
        </p>

        {/* Author */}
        {isLg && book.author && (
          <p style={{
            fontSize: 11, color: "#94a3b8", marginBottom: 4,
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          }}>
            {book.author}
          </p>
        )}

        {/* Star rating */}
        {displayRating > 0 && (
          <div
            onClick={() => onView && onView(book)}
            style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 5, cursor: "pointer" }}
          >
            {[1, 2, 3, 4, 5].map(s => (
              <FaStar key={s} size={9} color={s <= Math.round(displayRating) ? "#f59e0b" : "#e2e8f0"} />
            ))}
            <span style={{ fontSize: 10, color: "#f59e0b", marginLeft: 3, fontWeight: 700 }}>
              {Number(displayRating).toFixed(1)}
            </span>
            {displayCount > 0 && (
              <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 2, textDecoration: "underline" }}>
                ({displayCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* ✅ Price — দশমিক নেই */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: isLg ? 15 : 13, fontWeight: 800, color: "#0e5a6f" }}>
            {book.price === 0 ? "FREE" : `৳${finalPrice}`}
          </span>
          {hasDiscount && (
            <>
              <span style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>
                ৳{Math.round(book.price)}
              </span>
              {isLg && (
                <span style={{
                  fontSize: 9, fontWeight: 700, color: "#16a34a",
                  background: "#f0fdf4", border: "1px solid #86efac",
                  borderRadius: 20, padding: "1px 6px",
                }}>
                  Save ৳{Math.round(book.price) - finalPrice}
                </span>
              )}
            </>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(book); }}
          style={{
            width: "100%", padding: isLg ? "8px 0" : "6px 0",
            borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: isLg ? 12 : 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: inCart
              ? "linear-gradient(135deg,#16a34a,#15803d)"
              : "linear-gradient(135deg,#0e5a6f,#0c4a5a)",
            color: "#fff", transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {inCart ? <><FaCheck size={10} /> In Cart</> : <><FaShoppingCart size={10} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// HomeSection
// ============================================================
const HomeSection = () => {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const [books,       setBooks]       = useState([]);
  const [menu,        setMenu]        = useState("All Books");
  const [subcategory, setSubcategory] = useState("");
  const [slideIndex,  setSlideIndex]  = useState(0);
  const [activeTab,   setActiveTab]   = useState("featured");
  const [startIndex,  setStartIndex]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [bookRatings, setBookRatings] = useState({});

  useEffect(() => {
    api.get("/api/books")
      .then(res => setBooks(res.data.books || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (books.length === 0) return;
    const fetchRatings = async () => {
      try {
        const bookIds = books.map(b => b._id);
        const res = await api.post("/api/reviews/bulk-ratings", { bookIds });
        setBookRatings(res.data.ratings || {});
      } catch {
        setBookRatings({});
      }
    };
    fetchRatings();
  }, [books]);

  const grouped = books.reduce((acc, book) => {
    const cat = book.category?.trim();
    const sub = book.subCategory?.trim();
    if (!cat) return acc;
    if (!acc[cat]) acc[cat] = { subs: new Set(), count: 0 };
    acc[cat].count++;
    if (sub) acc[cat].subs.add(sub);
    return acc;
  }, {});

  const categories = Object.keys(grouped).map(cat => ({
    name: cat, sub: Array.from(grouped[cat].subs), count: grouped[cat].count,
  }));

  const filteredBooks = menu === "All Books"
    ? books
    : subcategory
      ? books.filter(b => b.subCategory?.toLowerCase() === subcategory.toLowerCase())
      : books.filter(b => b.category?.toLowerCase() === menu.toLowerCase());

  const subCount = (sub) => books.filter(b => b.subCategory?.toLowerCase() === sub.toLowerCase()).length;

  const menuBooks = filteredBooks.slice(slideIndex, slideIndex + 5);

  const tabBooks = {
    featured:    books.filter(b => b.isFeatured === true),
    arrived:     [...books].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    bestsellers: [...books].sort((a, b) => {
      const rA = bookRatings[a._id]?.averageRating ?? 0;
      const rB = bookRatings[b._id]?.averageRating ?? 0;
      const cA = bookRatings[a._id]?.totalReviews  ?? 0;
      const cB = bookRatings[b._id]?.totalReviews  ?? 0;
      const sA = rA > 0 ? rA * cA : getBestsellerScore(a);
      const sB = rB > 0 ? rB * cB : getBestsellerScore(b);
      return sB - sA;
    }),
    discounted: [...books]
      .filter(b => hasRealDiscount(b))
      .sort((a, b) => getDiscountPct(b.discount) - getDiscountPct(a.discount)),
  };

  const activeBooks  = tabBooks[activeTab] || [];
  const visibleBooks = activeBooks.slice(startIndex, startIndex + 5);
  const isInCart     = id => cart.some(item => item._id === id);

  const handleAdd = async (book) => {
    if (!localStorage.getItem("token")) {
      localStorage.setItem("redirectAfterLogin", "/cart");
      navigate("/login");
      return;
    }
    await addToCart(book);
    navigate("/cart");
  };

  // ✅ FIXED: id সহ navigate
  const handleView = (book) => {
    navigate(`/book-details/${book._id}`, { state: book });
  };

  const discountedBooks = books.filter(hasRealDiscount);
  const maxDiscount = Math.max(...discountedBooks.map(b => getDiscountPct(b.discount)), 0);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, background: "#f0f7fa" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e6f2f6", borderTopColor: "#0e5a6f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: "24px 20px", backgroundColor: "#f0f7fa", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Discount Banner */}
      {discountedBooks.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg,#0e5a6f,#083a47)", borderRadius: 16,
          padding: "18px 24px", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          boxShadow: "0 8px 24px rgba(14,90,111,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Limited Time Offer</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Up to <span style={{ color: "#fbbf24" }}>{maxDiscount}% OFF</span> on selected books!</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{discountedBooks.length} books on sale</p>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab("discounted"); setStartIndex(0); document.getElementById("featured-sec")?.scrollIntoView({ behavior: "smooth" }); }}
            style={{ padding: "10px 22px", borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}
          >
            <HiOutlineLightningBolt size={15} /> Shop Deals
          </button>
        </div>
      )}

      {/* Section 1: Category Sidebar + Slider */}
      <div style={{ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(14,90,111,0.07)", padding: 20, marginBottom: 24, display: "flex", gap: 20, border: "1px solid #e6f2f6" }}>

        {/* Category Panel */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderRadius: 10, background: "linear-gradient(135deg,#0e5a6f,#0c4a5a)", marginBottom: 10, color: "#fff" }}>
            <HiViewGrid size={15} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>CATEGORIES</span>
          </div>

          <div onClick={() => { setMenu("All Books"); setSubcategory(""); setSlideIndex(0); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: menu === "All Books" ? "#e6f2f6" : "#f8fafc", border: menu === "All Books" ? "1px solid #b3dde6" : "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: menu === "All Books" ? "#0e5a6f" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaBookOpen size={12} color={menu === "All Books" ? "#fff" : "#94a3b8"} />
              </div>
              <span style={{ fontSize: 13, fontWeight: menu === "All Books" ? 700 : 500, color: menu === "All Books" ? "#0e5a6f" : "#374151" }}>All Books</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: menu === "All Books" ? "#0e5a6f" : "#94a3b8", background: menu === "All Books" ? "#fff" : "#f1f5f9", borderRadius: 20, padding: "1px 8px" }}>{books.length}</span>
          </div>

          {categories.map(cat => (
            <div key={cat.name} style={{ marginBottom: 4 }}>
              <div onClick={() => { setMenu(cat.name); setSubcategory(""); setSlideIndex(0); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, cursor: "pointer", background: menu === cat.name ? "#e6f2f6" : "#f8fafc", border: menu === cat.name ? "1px solid #b3dde6" : "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: menu === cat.name ? "#0e5a6f" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 12 }}>{menu === cat.name ? "📂" : "📁"}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: menu === cat.name ? 700 : 500, color: menu === cat.name ? "#0e5a6f" : "#374151" }}>{cat.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: menu === cat.name ? "#0e5a6f" : "#94a3b8", background: menu === cat.name ? "#fff" : "#f1f5f9", borderRadius: 20, padding: "1px 8px" }}>{cat.count}</span>
              </div>

              {menu === cat.name && cat.sub.length > 0 && (
                <div style={{ paddingLeft: 8, marginTop: 4 }}>
                  {cat.sub.map(sub => (
                    <div key={sub} onClick={() => { setSubcategory(sub); setSlideIndex(0); }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: subcategory === sub ? "#f0f9ff" : "transparent" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: subcategory === sub ? "#0e5a6f" : "#cbd5e1" }} />
                        <span style={{ fontSize: 11, fontWeight: subcategory === sub ? 600 : 400, color: subcategory === sub ? "#0e5a6f" : "#64748b" }}>{sub}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: subcategory === sub ? "#0e5a6f" : "#94a3b8", background: subcategory === sub ? "#e6f2f6" : "#f1f5f9", borderRadius: 20, padding: "1px 7px" }}>{subCount(sub)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Book Slider */}
        <div style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 12, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0e5a6f", display: "flex", alignItems: "center", gap: 7 }}>
                <FaBookOpen size={13} /> {subcategory || menu}
              </p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{filteredBooks.length} books available</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setSlideIndex(p => Math.max(0, p - 1))} disabled={slideIndex === 0}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e6f2f6", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: slideIndex === 0 ? 0.35 : 1, color: "#0e5a6f" }}>
                <FaChevronLeft size={11} />
              </button>
              <button onClick={() => setSlideIndex(p => p + 1)} disabled={slideIndex + 5 >= filteredBooks.length}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e6f2f6", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: slideIndex + 5 >= filteredBooks.length ? 0.35 : 1, color: "#0e5a6f" }}>
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>

          {menuBooks.length > 0 ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-start", alignItems: "flex-start" }}>
              {menuBooks.map(book => (
                <BookCard
                  key={book._id} book={book}
                  onAdd={handleAdd} inCart={isInCart(book._id)}
                  size="sm"
                  realRating={bookRatings[book._id]?.averageRating}
                  realTotalReviews={bookRatings[book._id]?.totalReviews}
                  onView={handleView}
                />
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", gap: 8 }}>
              <FaBookOpen size={28} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: 13 }}>No books in this category</span>
            </div>
          )}

          {filteredBooks.length > 5 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
              {Array.from({ length: Math.ceil(filteredBooks.length / 5) }, (_, i) => (
                <div key={i} onClick={() => setSlideIndex(i * 5)}
                  style={{ width: slideIndex === i * 5 ? 18 : 6, height: 6, borderRadius: 3, cursor: "pointer", background: slideIndex === i * 5 ? "#0e5a6f" : "#e2e8f0", transition: "all 0.2s" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Featured Tabs */}
      <div id="featured-sec" style={{ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(14,90,111,0.07)", padding: 20, border: "1px solid #e6f2f6" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { key: "featured",    label: "Featured",     icon: <HiOutlineSparkles size={12} /> },
            { key: "arrived",     label: "New Arrivals", icon: <FaClock size={11} /> },
            { key: "bestsellers", label: "Bestsellers",  icon: <FaTrophy size={11} /> },
            { key: "discounted",  label: "Best Deals",   icon: <FaTag size={10} /> },
          ].map(t => {
            const isActive = activeTab === t.key;
            const isDeal   = t.key === "discounted";
            return (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setStartIndex(0); }}
                style={{ padding: "7px 16px", borderRadius: 20, border: isActive ? "none" : "1px solid #e6f2f6", cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 500, background: isActive ? (isDeal ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#0e5a6f,#0c4a5a)") : "#f8fafc", color: isActive ? "#fff" : "#64748b", display: "flex", alignItems: "center", gap: 5, boxShadow: isActive ? "0 4px 12px rgba(14,90,111,0.25)" : "none", transition: "all 0.15s" }}>
                {t.icon} {t.label}
                {isDeal && discountedBooks.length > 0 && (
                  <span style={{ background: isActive ? "rgba(255,255,255,0.25)" : "#fef2f2", color: isActive ? "#fff" : "#ef4444", borderRadius: 20, padding: "0 6px", fontSize: 9, fontWeight: 800 }}>{discountedBooks.length}</span>
                )}
              </button>
            );
          })}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
            <FaBookOpen size={11} /> <strong style={{ color: "#0e5a6f" }}>{activeBooks.length}</strong> books
          </span>
        </div>

        {activeTab === "featured" && activeBooks.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>⭐</p>
            <p style={{ fontSize: 14 }}>No featured books yet</p>
          </div>
        )}
        {activeTab === "discounted" && discountedBooks.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <FaTag size={30} style={{ opacity: 0.25, marginBottom: 10 }} />
            <p style={{ fontSize: 14 }}>No discounted books right now</p>
          </div>
        )}

        {activeBooks.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setStartIndex(p => Math.max(0, p - 1))} disabled={startIndex === 0}
                style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #e6f2f6", backgroundColor: "#f8fafc", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: startIndex === 0 ? 0.3 : 1, color: "#0e5a6f" }}>
                <FaChevronLeft size={13} />
              </button>

              <div style={{ flex: 1, display: "flex", gap: 14, justifyContent: "flex-start", alignItems: "flex-start", overflow: "hidden" }}>
                {visibleBooks.map(book => (
                  <BookCard
                    key={book._id} book={book}
                    onAdd={handleAdd} inCart={isInCart(book._id)}
                    size="lg"
                    realRating={bookRatings[book._id]?.averageRating}
                    realTotalReviews={bookRatings[book._id]?.totalReviews}
                    onView={handleView}
                  />
                ))}
              </div>

              <button onClick={() => setStartIndex(p => p + 1)} disabled={startIndex + 5 >= activeBooks.length}
                style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #e6f2f6", backgroundColor: "#f8fafc", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: startIndex + 5 >= activeBooks.length ? 0.3 : 1, color: "#0e5a6f" }}>
                <FaChevronRight size={13} />
              </button>
            </div>

            {activeBooks.length > 5 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
                {Array.from({ length: Math.ceil(activeBooks.length / 5) }, (_, i) => (
                  <div key={i} onClick={() => setStartIndex(i * 5)}
                    style={{ width: startIndex === i * 5 ? 22 : 8, height: 8, borderRadius: 4, cursor: "pointer", background: startIndex === i * 5 ? "linear-gradient(90deg,#0e5a6f,#1a8a9f)" : "#e2e8f0", transition: "all 0.2s" }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HomeSection;