// ============================================================
// 📄 Shop.jsx — Book Shop Page
// Features:
//   - Search by title or author
//   - Filter by category & subcategory (sidebar)
//   - Sort by price, rating, popularity
//   - Add to cart / Read (if owned)
//   - Discount & FREE badge from database
// ============================================================

import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen, FaGlobe, FaGraduationCap,
  FaBriefcase, FaSearch, FaStar, FaShoppingCart, FaCheck
} from "react-icons/fa";

// ── Backend URL (dev vs production) ──────────────────────────
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://book-management-system-ks6w.onrender.com";

// ── Category structure (sidebar menu) ────────────────────────
const CATEGORIES = {
  "Academic Learning": [
    "Machine Learning", "Artificial Intelligence",
    "Web Development", "Programming", "Data Science"
  ],
  "Job Skills": [
    "Interview Skills", "Communication",
    "CV Writing", "Freelancing", "Career Development"
  ],
};

// ── Helper: cut text to N words, add "…" if longer ───────────
const truncate = (str = "", words = 6) => {
  const arr = str.trim().split(/\s+/);
  return arr.length <= words ? str : arr.slice(0, words).join(" ") + "…";
};

// ── Helper: get discount label from book.discount field ───────
// book.discount can be a number (e.g. 20 → "20% OFF")
// or a special string (e.g. "BOGO")
const getDiscount = (book) => {
  const d = Number(book.discount);
  if (!isNaN(d) && d > 0) return `${d}% OFF`;
  if (typeof book.discount === "string" && book.discount.trim()) return book.discount;
  return null;
};

// ============================================================
// 🏪 Main Shop Component
// ============================================================
export default function Shop() {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────
  const [books,    setBooks]    = useState([]);       // all books from API
  const [library,  setLibrary]  = useState([]);       // books user already owns
  const [search,   setSearch]   = useState("");       // search input text
  const [mainCat,  setMainCat]  = useState("All");    // selected main category
  const [subCat,   setSubCat]   = useState("");       // selected subcategory
  const [sort,     setSort]     = useState("newest"); // sort option
  const [addingId, setAddingId] = useState(null);     // book currently being added

  // ── Fetch data on mount ───────────────────────────────────
  useEffect(() => {
    fetchBooks();
    fetchLibrary();
  }, []);

  // Fetch all active books from backend
  const fetchBooks = async () => {
    try {
      const r = await api.get("/api/books");
      setBooks(r.data.books || []);
    } catch (e) { console.error("Books fetch error:", e); }
  };

  // Fetch user's library (books they've purchased)
  const fetchLibrary = async () => {
    try {
      const uid = localStorage.getItem("userId");
      if (!uid) return;
      const r = await api.get(`/api/users/library/${uid}`);
      setLibrary(r.data || []);
    } catch (e) { console.error("Library fetch error:", e); }
  };

  // ── Filter & Sort logic ───────────────────────────────────
  let filtered = books.filter(b => b.isActive !== false); // hide inactive books

  // Search filter: matches title or author
  if (search.trim()) {
    filtered = filtered.filter(b =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Category filter
  if (mainCat !== "All") filtered = filtered.filter(b => b.category === mainCat);
  if (subCat)            filtered = filtered.filter(b => b.subCategory === subCat);

  // Sort
  if (sort === "priceLow")  filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === "priceHigh") filtered = [...filtered].sort((a,b) => b.price - a.price);
  if (sort === "rating")    filtered = [...filtered].sort((a,b) => (b.rating||0) - (a.rating||0));
  if (sort === "popular")   filtered = [...filtered].sort((a,b) => (b.salesCount||0) - (a.salesCount||0));

  // ── Ownership & cart checks ───────────────────────────────
  const isOwned  = id => library.some(i => i._id === id);
  const isInCart = id => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    return c.some(i => i._id === id);
  };

  // ── Add to cart handler ───────────────────────────────────
  const handleAdd = async (book) => {
    if (!isLoggedIn) { navigate("/login"); return; }
    setAddingId(book._id);
    try {
      await addToCart(book);
      // BOGO: add a free copy automatically
      if (book.discount === "BOGO") {
        await addToCart({ ...book, _id: book._id+"-FREE", price: 0, title: book.title+" (FREE)" });
      }
      navigate("/cart");
    } catch(e) {
      console.error(e);
      alert("Error adding to cart");
    } finally {
      setAddingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* ── TOP HEADER: title + search + sort ── */}
      <div style={s.header}>
        <div style={s.headerInner}>

          {/* Page title */}
          <h1 style={s.heading}>
            <span style={s.headingAccent}>Discover</span> Your Next Book
          </h1>

          {/* Search input */}
          <div style={s.searchWrap}>
            <FaSearch style={s.searchIcon}/>
            <input
              style={s.searchInput}
              placeholder="Search title or author…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Sort dropdown */}
          <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="priceLow">Price: Low → High</option>
            <option value="priceHigh">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* ── MAIN LAYOUT: sidebar + book grid ── */}
      <div style={s.layout}>

        {/* ── LEFT SIDEBAR: category filter ── */}
        <aside style={s.sidebar}>
          <p style={s.sideLabel}>Categories</p>

          {/* "All" button */}
          <SideBtn
            icon={<FaGlobe size={12}/>}
            label="All Books"
            active={mainCat === "All"}
            onClick={() => { setMainCat("All"); setSubCat(""); }}
          />

          {/* Main categories + their subcategories */}
          {Object.entries(CATEGORIES).map(([cat, subs]) => (
            <div key={cat}>
              <SideBtn
                icon={cat === "Academic Learning" ? <FaGraduationCap size={12}/> : <FaBriefcase size={12}/>}
                label={cat}
                active={mainCat === cat}
                onClick={() => { setMainCat(cat); setSubCat(""); }}
              />

              {/* Subcategory list — shown only when parent is selected */}
              {mainCat === cat && (
                <div style={s.subList}>
                  {subs.map(sub => (
                    <button key={sub} onClick={() => setSubCat(sub)} style={{
                      ...s.subBtn,
                      background:  subCat === sub ? "rgba(239,68,68,0.1)" : "none",
                      color:       subCat === sub ? "#ef4444" : "#94a3b8",
                      borderLeft: `2px solid ${subCat === sub ? "#ef4444" : "transparent"}`,
                    }}>
                      <FaBookOpen size={9} style={{flexShrink:0}}/>
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* ── RIGHT: book grid ── */}
        <main style={s.main}>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <FaBookOpen size={40} style={{color:"#94a3b8", marginBottom:12}}/>
              <p style={{color:"#64748b", fontSize:14}}>No books found. Try a different search.</p>
            </div>
          ) : (
            <div style={s.grid}>
              {filtered.map(book => (
                <BookCard
                  key={book._id}
                  book={book}
                  owned={isOwned(book._id)}
                  inCart={isInCart(book._id)}
                  adding={addingId === book._id}
                  onAdd={() => handleAdd(book)}
                  onRead={() => navigate(`/reader/${book._id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Global font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        body { font-family: 'DM Sans', sans-serif; }
        select { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#e8edf5; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
      `}</style>
    </div>
  );
}

// ============================================================
// 📚 BookCard — single book card component
// Props: book, owned, inCart, adding, onAdd, onRead
// ============================================================
function BookCard({ book, owned, inCart, adding, onAdd, onRead }) {
  const discount = getDiscount(book);
  const isFree   = book.price === 0;

  // Cover image: use backend path or fallback placeholder
  const imgSrc = book.coverImage
    ? (book.coverImage.startsWith("http") ? book.coverImage : BASE_URL + book.coverImage)
    : "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80";

  return (
    <div style={s.card}>

      {/* ── Cover image area ── */}
      <div style={s.imgWrap}>
        <img
          src={imgSrc}
          alt={book.title}
          style={s.img}
          loading="lazy"
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80"; }}
        />

        {/* Discount / FREE badge (top-right corner) */}
        {(discount || isFree) && (
          <span style={{...s.badge, background: isFree ? "#059669" : "#ef4444"}}>
            {isFree ? "FREE" : discount}
          </span>
        )}

        {/* Featured badge (bottom-right corner) */}
        {book.isFeatured && (
          <span style={{...s.badge, background:"#7c3aed", top:"auto", bottom:8}}>
            ⭐ Featured
          </span>
        )}
      </div>

      {/* ── Card body ── */}
      <div style={s.cardBody}>

        {/* Subcategory tag */}
        <span style={s.tag}>{book.subCategory || book.category || "Book"}</span>

        {/* Title: max 6 words, reserves 2-line height always */}
        <h3 style={s.cardTitle} title={book.title}>
          {truncate(book.title, 6)}
        </h3>

        {/* Author: max 4 words, single line */}
        <p style={s.cardAuthor} title={book.author}>
          {truncate(book.author, 4)}
        </p>

        {/* Star rating (only shown if rating > 0) */}
        {book.rating > 0 && (
          <div style={s.ratingRow}>
            {[1,2,3,4,5].map(i => (
              <FaStar key={i} size={10}
                style={{color: i <= Math.round(book.rating) ? "#f59e0b" : "#cbd5e1"}}
              />
            ))}
            <span style={s.ratingText}>{book.rating.toFixed(1)}</span>
            {book.numReviews > 0 && <span style={s.reviewCount}>({book.numReviews})</span>}
          </div>
        )}

        {/* Price row: current price + crossed-out original if discounted */}
        <div style={s.priceRow}>
          <span style={s.price}>
            {isFree
              ? <span style={{color:"#059669", fontWeight:700}}>FREE</span>
              : `৳ ${book.price}`
            }
          </span>
          {/* Original price (only for numeric % discounts) */}
          {!isFree && discount && typeof book.discount === "number" && (
            <span style={s.origPrice}>
              ৳ {Math.round(book.price / (1 - book.discount / 100))}
            </span>
          )}
        </div>

        {/* Action button: Read (owned) or Add to Cart */}
        <div style={s.actions}>
          {owned ? (
            <button style={{...s.btn, ...s.btnOwned}} onClick={onRead}>
              <FaBookOpen size={11}/> Read
            </button>
          ) : (
            <button
              style={{
                ...s.btn, ...s.btnAdd,
                opacity: inCart || adding ? 0.65 : 1,
                cursor:  inCart || adding ? "default" : "pointer",
              }}
              onClick={onAdd}
              disabled={inCart || adding}
            >
              {adding    ? "…"
              : inCart   ? <><FaCheck size={10}/> In Cart</>
              :             <><FaShoppingCart size={10}/> Add to Cart</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🔘 SideBtn — sidebar category button
// ============================================================
function SideBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", display:"flex", alignItems:"center", gap:8,
      padding:"9px 12px", marginBottom:4,
      border:"none", borderRadius:8, cursor:"pointer",
      fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
      background:  active ? "rgba(239,68,68,0.1)" : "none",
      color:       active ? "#ef4444" : "#64748b",
      borderLeft: `2px solid ${active ? "#ef4444" : "transparent"}`,
      transition:"all 0.15s", textAlign:"left",
    }}>
      <span style={{flexShrink:0, color: active ? "#ef4444" : "#94a3b8"}}>{icon}</span>
      <span style={{flex:1}}>{label}</span>
    </button>
  );
}

// ============================================================
// 🎨 Styles — light background theme
// Colors:
//   Page bg:    #f0f4f8  (light blue-grey)
//   Header bg:  #ffffff
//   Sidebar bg: #ffffff
//   Card bg:    #ffffff
//   Accent:     #ef4444 (red)
// ============================================================
const s = {

  // ── Page wrapper ──────────────────────────────────────────
  page: {
    minHeight:"100vh",
    background:"#f0f4f8",   // light blue-grey — easy on eyes
    fontFamily:"'DM Sans',sans-serif",
  },

  // ── Top header bar ────────────────────────────────────────
  header: {
    background:"#ffffff",
    borderBottom:"1px solid #e2e8f0",
    padding:"20px 32px",
    boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
  },
  headerInner: {
    maxWidth:1400, margin:"0 auto",
    display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
  },
  heading: {
    fontFamily:"'Playfair Display',serif",
    fontSize:24, color:"#0f172a", whiteSpace:"nowrap", marginRight:8,
  },
  headingAccent: { color:"#ef4444" },

  // ── Search ────────────────────────────────────────────────
  searchWrap: { flex:1, position:"relative", minWidth:200 },
  searchIcon: {
    position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
    color:"#94a3b8", pointerEvents:"none",
  },
  searchInput: {
    width:"100%", padding:"9px 12px 9px 36px",
    background:"#f8fafc", border:"1px solid #e2e8f0",
    borderRadius:8, color:"#0f172a", fontSize:13, outline:"none",
    fontFamily:"'DM Sans',sans-serif",
  },

  // ── Sort dropdown ─────────────────────────────────────────
  sortSelect: {
    padding:"9px 12px", background:"#f8fafc",
    border:"1px solid #e2e8f0", borderRadius:8,
    color:"#475569", fontSize:13, cursor:"pointer", outline:"none",
  },

  // ── Two-column layout ─────────────────────────────────────
  layout: {
    maxWidth:1400, margin:"0 auto",
    display:"grid", gridTemplateColumns:"210px 1fr",
    gap:20, padding:"24px 32px", alignItems:"start",
  },

  // ── Sidebar ───────────────────────────────────────────────
  sidebar: {
    background:"#ffffff", border:"1px solid #e2e8f0",
    borderRadius:12, padding:16, position:"sticky", top:80,
    boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
  },
  sideLabel: {
    fontSize:10, color:"#94a3b8", letterSpacing:"0.1em",
    textTransform:"uppercase", marginBottom:10, paddingLeft:4,
  },
  subList: { paddingLeft:8, marginBottom:4 },
  subBtn: {
    width:"100%", display:"flex", alignItems:"center", gap:7,
    padding:"7px 10px", marginBottom:2,
    border:"none", borderRadius:6, cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif", fontSize:12,
    transition:"all 0.15s", textAlign:"left",
  },

  // ── Main content area ─────────────────────────────────────
  main: { minWidth:0 },
  empty: {
    display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", padding:"80px 0",
  },

  // ── Book grid — auto-fill columns ─────────────────────────
  grid: {
    display:"grid",
    gridTemplateColumns:"repeat(auto-fill, minmax(185px, 1fr))",
    gap:18,
  },

  // ── Book Card ─────────────────────────────────────────────
  card: {
    background:"#ffffff", border:"1px solid #e2e8f0",
    borderRadius:12, overflow:"hidden",
    display:"flex", flexDirection:"column",
    boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
    transition:"transform 0.2s, box-shadow 0.2s",
  },

  // Cover image: fixed 220px so all cards same height
  imgWrap: { position:"relative", width:"100%", height:220, flexShrink:0, overflow:"hidden" },
  img: { width:"100%", height:"100%", objectFit:"cover", display:"block" },

  // Badge: top-right on cover (FREE / % OFF / Featured)
  badge: {
    position:"absolute", top:8, right:8,
    color:"#fff", fontSize:10, fontWeight:700,
    padding:"3px 8px", borderRadius:20, letterSpacing:"0.04em",
  },

  // Card body: flex column so price/button always at bottom
  cardBody: {
    padding:"12px 14px 14px",
    display:"flex", flexDirection:"column", gap:5, flex:1,
  },

  // Category tag (red text)
  tag: {
    fontSize:10, fontWeight:600, letterSpacing:"0.06em",
    color:"#ef4444", textTransform:"uppercase",
  },

  // Title: 2 lines max, reserved height so all cards align
  cardTitle: {
    fontSize:14, fontWeight:700, color:"#0f172a", lineHeight:1.4,
    fontFamily:"'Playfair Display',serif",
    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
    overflow:"hidden", minHeight:"2.8em",
  },

  // Author: 1 line, overflow ellipsis
  cardAuthor: {
    fontSize:12, color:"#94a3b8",
    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis",
  },

  // Star rating row
  ratingRow:   { display:"flex", alignItems:"center", gap:2 },
  ratingText:  { fontSize:11, color:"#f59e0b", marginLeft:4, fontWeight:600 },
  reviewCount: { fontSize:10, color:"#94a3b8", marginLeft:2 },

  // Price row (pushes to bottom via marginTop:auto)
  priceRow:  { display:"flex", alignItems:"center", gap:8, marginTop:"auto" },
  price:     { fontSize:15, fontWeight:700, color:"#0f172a" },
  origPrice: { fontSize:11, color:"#94a3b8", textDecoration:"line-through" },

  // Buttons
  actions: { display:"flex", gap:8, marginTop:4 },
  btn: {
    flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
    padding:"7px 10px", borderRadius:8, border:"none",
    fontSize:12, fontWeight:600, cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
  },
  btnAdd:   { background:"#ef4444", color:"#fff" },                                          // red → Add to Cart
  btnOwned: { background:"#ecfdf5", color:"#059669", border:"1px solid #a7f3d0" },          // green → Read
};