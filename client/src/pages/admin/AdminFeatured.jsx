// ============================================================
// 📄 AdminFeatured.jsx
// Admin panel — Featured Books Manager
// ✅ Books list kore
// ✅ Toggle button e featured/unfeatured kora jay
// ✅ Featured books HomeSection e dekhay
// ============================================================

import { useEffect, useState } from "react";
import api from "../../api/axios";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

export default function AdminFeatured() {

  // ── State ─────────────────────────────────────────────────
  const [books,   setBooks]   = useState([]);    // sob books
  const [loading, setLoading] = useState(true);  // load hocche?
  const [saving,  setSaving]  = useState(null);  // kon book save hocche
  const [search,  setSearch]  = useState("");    // search text
  const [filter,  setFilter]  = useState("all"); // all | featured | unfeatured
  const [toast,   setToast]   = useState(null);  // notification message

  // ── Page open hole books load koro ───────────────────────
  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/books");
      setBooks(res.data.books || []);
    } catch (err) {
      console.error(err);
      showToast("❌ Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Featured toggle koro ──────────────────────────────────
  const toggleFeatured = async (bookId, current) => {
    setSaving(bookId);
    try {
      await api.patch(`/api/books/${bookId}/featured`, {
        isFeatured: !current,
      });
      // UI update — reload chara
      setBooks(prev =>
        prev.map(b => b._id === bookId ? { ...b, isFeatured: !current } : b)
      );
      showToast(current ? "Book remove from featured" : "⭐ Add Featured!", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ failed ", "error");
    } finally {
      setSaving(null);
    }
  };

  // ── Toast 2.5 second dekhao ──────────────────────────────
  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Filter logic ──────────────────────────────────────────
  const visible = books.filter(b => {
    const matchSearch =
      !search.trim() ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"        ? true :
      filter === "featured"   ? b.isFeatured === true :
      filter === "unfeatured" ? !b.isFeatured : true;
    return matchSearch && matchFilter;
  });

  const featuredCount = books.filter(b => b.isFeatured).length;

  return (
    <div style={s.page}>

      {/* ── Toast notification ── */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "success" ? "#0e5a6f" : "#ef4444" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>⭐ Featured Books</h1>
          {/* <p style={s.subtitle}>Ei page theke featured korle Home page e dekhabe</p> */}
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{featuredCount}</span>
          <span style={s.statLabel}>Featured</span>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div style={s.toolbar}>
        <input
          style={s.searchInput}
          placeholder="🔍 search Title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={s.tabs}>
          {[
            { key: "all",        label: `All (${books.length})` },
            { key: "featured",   label: `⭐ Featured (${featuredCount})` },
            { key: "unfeatured", label: `Unfeatured (${books.length - featuredCount})` },
          ].map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)} style={{
              ...s.tabBtn,
              background: filter === t.key ? "#0e5a6f" : "#f1f5f9",
              color:      filter === t.key ? "#fff"    : "#64748b",
              fontWeight: filter === t.key ? 700       : 500,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={s.center}>
          <div style={s.spinner}/>
          <p style={{ color:"#94a3b8", marginTop:12 }}>Loading...</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && visible.length === 0 && (
        <div style={s.center}>
          <p style={{ fontSize:40 }}>📚</p>
          <p style={{ color:"#94a3b8" }}>No books found</p>
        </div>
      )}

      {/* ── Books grid ── */}
      {!loading && visible.length > 0 && (
        <div style={s.grid}>
          {visible.map(book => (
            <div key={book._id} style={{
              ...s.card,
              border:     book.isFeatured ? "1.5px solid #0e5a6f" : "1.5px solid #e2e8f0",
              background: book.isFeatured ? "#f0f9ff" : "#fff",
            }}>
              {/* Cover image */}
              <div style={s.imgWrap}>
                {book.coverImage ? (
                  <img
                    src={book.coverImage.startsWith("http") ? book.coverImage : BASE_URL + book.coverImage}
                    alt={book.title}
                    style={s.img}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={s.imgPlaceholder}>📖</div>
                )}
              </div>

              {/* Book info */}
              <div style={s.info}>
                {book.isFeatured && <span style={s.badge}>⭐ Featured</span>}
                <p style={s.bookTitle}>{book.title || "No title"}</p>
                <p style={s.bookAuthor}>{book.author || "Unknown"}</p>
                <p style={s.bookCat}>{book.category}{book.subCategory ? ` / ${book.subCategory}` : ""}</p>
                <p style={s.bookPrice}>{book.price === 0 ? "FREE" : `৳ ${book.price}`}</p>
              </div>

              {/* Toggle button */}
              <button
                onClick={() => toggleFeatured(book._id, book.isFeatured)}
                disabled={saving === book._id}
                style={{
                  ...s.toggleBtn,
                  background: book.isFeatured
                    ? "linear-gradient(135deg,#0e5a6f,#0c4a5a)"
                    : "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
                  color:  book.isFeatured ? "#fff" : "#64748b",
                  cursor: saving === book._id ? "wait" : "pointer",
                  opacity: saving === book._id ? 0.7 : 1,
                }}
              >
                {saving === book._id
                  ? <span style={s.btnSpinner}/>
                  : book.isFeatured ? "⭐ Remove" : "☆ Featured"
                }
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page:        { padding:"28px 32px", background:"#f8fafc", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", position:"relative" },
  toast:       { position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", color:"#fff", padding:"10px 24px", borderRadius:10, fontSize:14, fontWeight:600, zIndex:9999, boxShadow:"0 4px 16px rgba(0,0,0,0.2)", whiteSpace:"nowrap" },
  header:      { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 },
  title:       { fontSize:24, fontWeight:800, color:"#0f172a", marginBottom:4 },
  subtitle:    { fontSize:13, color:"#64748b" },
  statBox:     { background:"linear-gradient(135deg,#0e5a6f,#0c4a5a)", borderRadius:12, padding:"12px 20px", display:"flex", flexDirection:"column", alignItems:"center", minWidth:80, boxShadow:"0 4px 14px rgba(14,90,111,0.3)" },
  statNum:     { fontSize:28, fontWeight:800, color:"#fff", lineHeight:1 },
  statLabel:   { fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:2 },
  toolbar:     { display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" },
  searchInput: { flex:1, minWidth:200, padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none", color:"#0f172a", background:"#fff", fontFamily:"'DM Sans',sans-serif" },
  tabs:        { display:"flex", gap:6 },
  tabBtn:      { padding:"8px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" },
  center:      { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:8 },
  spinner:     { width:32, height:32, border:"3px solid #e2e8f0", borderTop:"3px solid #0e5a6f", borderRadius:"50%", animation:"spin 0.8s linear infinite" },
  grid:        { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px,1fr))", gap:14 },
  card:        { borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, transition:"all 0.15s", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" },
  imgWrap:     { width:56, height:72, flexShrink:0, borderRadius:6, overflow:"hidden", background:"#e6f2f6" },
  img:         { width:"100%", height:"100%", objectFit:"cover" },
  imgPlaceholder: { width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 },
  info:        { flex:1, minWidth:0 },
  badge:       { display:"inline-block", fontSize:10, fontWeight:700, color:"#0e5a6f", background:"#e6f2f6", borderRadius:20, padding:"2px 8px", marginBottom:4 },
  bookTitle:   { fontSize:13, fontWeight:700, color:"#0f172a", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", marginBottom:2 },
  bookAuthor:  { fontSize:11, color:"#94a3b8", marginBottom:2 },
  bookCat:     { fontSize:10, color:"#cbd5e1" },
  bookPrice:   { fontSize:12, fontWeight:700, color:"#0e5a6f", marginTop:3 },
  toggleBtn:   { flexShrink:0, padding:"8px 14px", borderRadius:8, border:"none", fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", minWidth:120, display:"flex", alignItems:"center", justifyContent:"center" },
  btnSpinner:  { display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" },
};