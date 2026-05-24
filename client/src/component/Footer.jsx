// ============================================================
// 📄 Footer.jsx
// ✅ Fixes:
//   1. Subscription button কাজ করে (API call + feedback)
//   2. Fully responsive (mobile/tablet/desktop)
//   3. Professional design
// ============================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF, FaTwitter, FaInstagram, FaYoutube,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
} from "react-icons/fa";
import api from "../api/axios";

const Footer = () => {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  // ── Subscribe handler ─────────────────────────────────────
  const handleSubscribe = async () => {
    const trimmed = email.trim();

    // Basic validation
    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter your email");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await api.post("/api/subscribe", { email: trimmed });
      setStatus("success");
      setMessage("✅ Subscribed! Check your inbox.");
      setEmail("");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setStatus("error");
      setMessage("❌ " + msg);
    } finally {
      // Reset after 4 seconds
      setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubscribe();
  };

  return (
    <footer style={{ background:"#0e5a6f", color:"#fff", marginTop:40 }}>

      {/* ══════════════════════════════════════════════════════
          TOP SECTION
      ══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 20px 36px" }}>

        {/* Responsive grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 36,
        }}>

          {/* ── Brand ─────────────────────────────────────── */}
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, marginBottom:12 }}>
              Read<span style={{ color:"#facc15" }}>NOVA</span>
            </h1>
            <p style={{ fontSize:13, color:"#cce4ec", lineHeight:1.7,
                        marginBottom:20, maxWidth:220 }}>
              Your digital library for exploring thousands of books,
              stories, and knowledge from around the world.
            </p>

            {/* Social icons */}
            <div style={{ display:"flex", gap:10 }}>
              {[
                { Icon:FaFacebookF, bg:"#1877f2" },
                { Icon:FaTwitter,   bg:"#0ea5e9" },
                { Icon:FaInstagram, bg:"#e1306c" },
                { Icon:FaYoutube,   bg:"#ff0000" },
              ].map(({ Icon, bg }) => (
                <div
                  key={bg}
                  style={{ width:34, height:34, borderRadius:8,
                           background:bg, display:"flex",
                           alignItems:"center", justifyContent:"center",
                           cursor:"pointer", transition:"transform 0.2s, opacity 0.2s",
                           fontSize:14 }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <Icon />
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Links ───────────────────────────────── */}
          <div>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:14,
                         letterSpacing:"0.04em", textTransform:"uppercase",
                         color:"#facc15" }}>
              Quick Links
            </h2>
            <ul style={{ listStyle:"none", padding:0, display:"flex",
                         flexDirection:"column", gap:10 }}>
              {[
                { to:"/",            label:"Home"    },
                { to:"/shop",        label:"Shop"    },
                { to:"/blog",        label:"Blog"    },
                { to:"/about",       label:"About"   },
                { to:"/help",        label:"Help"    },
                { to:"/login",       label:"Login"   },
                { to:"/refund-policy", label:"Refund Policy" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={{
                    color:"#cce4ec", textDecoration:"none", fontSize:13,
                    transition:"color 0.15s",
                    display:"flex", alignItems:"center", gap:5,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#facc15"}
                  onMouseLeave={e => e.currentTarget.style.color = "#cce4ec"}
                  >
                    › {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        {/* ── Categories ────────────────────────────────── */}
<div>
  <h2 style={{
    fontSize:15,
    fontWeight:700,
    marginBottom:14,
    letterSpacing:"0.04em",
    textTransform:"uppercase",
    color:"#facc15"
  }}>
    Categories
  </h2>

  <ul style={{
    listStyle:"none",
    padding:0,
    display:"flex",
    flexDirection:"column",
    gap:10
  }}>

    {[
      { name: "Academic Learning", slug: "academic" },
      { name: "Job Skills",        slug: "job-skills" },
     
    ].map(cat => (
      <li key={cat.slug}>
        <Link
          to={`/shop?category=${cat.slug}`}
          style={{
            color:"#cce4ec",
            fontSize:13,
            textDecoration:"none",
            display:"flex",
            alignItems:"center",
            gap:5,
            transition:"color 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#facc15"}
          onMouseLeave={e => e.currentTarget.style.color = "#cce4ec"}
        >
          › {cat.name}
        </Link>
      </li>
    ))}

  </ul>
</div>

          {/* ── Subscribe ─────────────────────────────────── */}
          <div>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:14,
                         letterSpacing:"0.04em", textTransform:"uppercase",
                         color:"#facc15" }}>
              Newsletter
            </h2>
            <p style={{ fontSize:13, color:"#cce4ec", marginBottom:14, lineHeight:1.6 }}>
              Get latest books, offers and updates directly in your inbox.
            </p>

            {/* ✅ Email input + button */}
            <div style={{ display:"flex", borderRadius:8, overflow:"hidden",
                          border:"1px solid rgba(255,255,255,0.2)",
                          marginBottom:8 }}>
              <input
                type="email"
                placeholder="Your email address..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status === "loading"}
                style={{ flex:1, padding:"10px 12px", fontSize:13,
                         border:"none", outline:"none",
                         background:"rgba(255,255,255,0.1)",
                         color:"#fff",
                         fontFamily:"'Plus Jakarta Sans',sans-serif" }}
              />
              <button
                onClick={handleSubscribe}
                disabled={status === "loading"}
                style={{ padding:"10px 16px", border:"none",
                         background: status === "loading" ? "#d4a017" : "#facc15",
                         color:"#1a1a1a", fontWeight:800, fontSize:13,
                         cursor: status === "loading" ? "not-allowed" : "pointer",
                         transition:"background 0.2s",
                         fontFamily:"'Plus Jakarta Sans',sans-serif",
                         flexShrink:0 }}
                onMouseEnter={e => { if(status !== "loading") e.currentTarget.style.background="#fde047"; }}
                onMouseLeave={e => { if(status !== "loading") e.currentTarget.style.background="#facc15"; }}
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </div>

            {/* ✅ Feedback message */}
            {message && (
              <p style={{ fontSize:12, marginBottom:10,
                          color: status === "success" ? "#86efac" : "#fca5a5" }}>
                {message}
              </p>
            )}

            {/* Contact info */}
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
              {[
                { Icon:FaEnvelope,       text:"support@readnova.com" },
                { Icon:FaPhone,          text:"+880 1734-567890"     },
                { Icon:FaMapMarkerAlt,   text:"Dhaka, Bangladesh"    },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display:"flex", alignItems:"center",
                                         gap:8, fontSize:13, color:"#cce4ec" }}>
                  <Icon size={12} style={{ color:"#facc15", flexShrink:0 }}/>
                  {text}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════════════════ */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.15)",
                    padding:"14px 20px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto",
                      display:"flex", flexWrap:"wrap",
                      justifyContent:"space-between", alignItems:"center",
                      gap:8 }}>
          <p style={{ fontSize:12, color:"#94a3b8" }}>
            © {new Date().getFullYear()} ReadNOVA. All rights reserved.
          </p>
          <div style={{ display:"flex", gap:20 }}>
            {["Privacy","Terms","Cookies"].map(item => (
              <span key={item} style={{ fontSize:12, color:"#94a3b8",
                                        cursor:"pointer", transition:"color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#facc15"}
                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        input::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>
    </footer>
  );
};

export default Footer;