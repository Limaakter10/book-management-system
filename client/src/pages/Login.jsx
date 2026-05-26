// ============================================================
// FILE : src/pages/Login.jsx
// ICONS: react-icons/fi  (Feather — clean & professional)
// ============================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

import {
  FiMail,        // email field icon
  FiLock,        // password field icon
  FiLogIn,       // login button icon
  FiEye,         // show password
  FiEyeOff,      // hide password
  FiAlertCircle, // error icon
  FiBookOpen,    // brand icon
} from "react-icons/fi";


const Login = () => {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [focusField,  setFocusField]  = useState(""); // "email" | "password"

  const navigate = useNavigate();

  // ── Submit handler ──────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res  = await api.post("/api/auth/login", { email, password });
      const data = res.data;

      localStorage.setItem("token",  data.token);
      localStorage.setItem("user",   JSON.stringify(data.user));
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("role",   data.user.role);

      if (data.user.role === "admin") navigate("/admin");
      else navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Input field style helper ────────────────────────────
  const inputWrap = (field) => ({
    display       : "flex",
    alignItems    : "center",
    gap           : 10,
    border        : `1.8px solid ${focusField === field ? "#0e5a6f" : "#e2e8f0"}`,
    borderRadius  : 12,
    padding       : "11px 14px",
    marginBottom  : 14,
    background    : focusField === field ? "#f0f7fa" : "#f8fafc",
    transition    : "border-color 0.2s, background 0.2s",
  });

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight   : "calc(100vh - 64px - 80px)",
        display     : "flex",
        alignItems  : "center",
        justifyContent: "center",
        background  : "linear-gradient(135deg, #e8f4f8 0%, #f0f7fa 100%)",
        padding     : "40px 16px",
        fontFamily  : "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          background   : "#fff",
          borderRadius : 20,
          boxShadow    : "0 8px 40px rgba(14,90,111,0.13)",
          padding      : "44px 40px",
          width        : "100%",
          maxWidth     : 430,
          position     : "relative",
          overflow     : "hidden",
        }}
      >
        {/* Top accent strip */}
        <div
          style={{
            position   : "absolute",
            top        : 0, left: 0, right: 0,
            height     : 5,
            background : "linear-gradient(90deg, #0e5a6f, #16a34a)",
            borderRadius: "20px 20px 0 0",
          }}
        />

        {/* ── Brand / Logo ──────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width          : 64,
              height         : 64,
              borderRadius   : "50%",
              background     : "linear-gradient(135deg, #0e5a6f, #094a5c)",
              display        : "flex",
              alignItems     : "center",
              justifyContent : "center",
              margin         : "0 auto 14px",
              boxShadow      : "0 4px 16px rgba(14,90,111,0.25)",
            }}
          >
            <FiBookOpen size={28} color="#fff"/>
          </div>
          <h2
            style={{
              fontSize   : 23,
              fontWeight : 800,
              color      : "#0e5a6f",
              marginBottom: 6,
              letterSpacing: "-0.3px",
            }}
          >
            Welcome Back
          </h2>
          <p style={{ fontSize: 13.5, color: "#94a3b8" }}>
            Sign in to your ReadNOVA account
          </p>
        </div>

        {/* ── Email Field ───────────────────────────────── */}
        <label
          style={{
            display    : "block",
            fontSize   : 12.5,
            fontWeight : 600,
            color      : "#475569",
            marginBottom: 6,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Email Address
        </label>
        <div style={inputWrap("email")}>
          <FiMail
            size={17}
            color={focusField === "email" ? "#0e5a6f" : "#94a3b8"}
            style={{ flexShrink: 0, transition: "color 0.2s" }}
          />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusField("email")}
            onBlur={() => setFocusField("")}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              flex       : 1,
              border     : "none",
              outline    : "none",
              background : "transparent",
              fontSize   : 14,
              color      : "#0f172a",
              fontFamily : "inherit",
            }}
          />
        </div>

        {/* ── Password Field ────────────────────────────── */}
        <label
          style={{
            display    : "block",
            fontSize   : 12.5,
            fontWeight : 600,
            color      : "#475569",
            marginBottom: 6,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Password
        </label>
        <div style={inputWrap("password")}>
          <FiLock
            size={17}
            color={focusField === "password" ? "#0e5a6f" : "#94a3b8"}
            style={{ flexShrink: 0, transition: "color 0.2s" }}
          />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField("password")}
            onBlur={() => setFocusField("")}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              flex       : 1,
              border     : "none",
              outline    : "none",
              background : "transparent",
              fontSize   : 14,
              color      : "#0f172a",
              fontFamily : "inherit",
            }}
          />
          {/* Show / hide password toggle */}
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            style={{
              background : "none",
              border     : "none",
              cursor     : "pointer",
              padding    : 0,
              color      : "#94a3b8",
              display    : "flex",
              alignItems : "center",
            }}
            title={showPass ? "Hide password" : "Show password"}
          >
            {showPass
              ? <FiEyeOff size={16}/>
              : <FiEye    size={16}/>}
          </button>
        </div>

        {/* ── Error Message ─────────────────────────────── */}
        {error && (
          <div
            style={{
              display      : "flex",
              alignItems   : "center",
              gap          : 8,
              background   : "#fef2f2",
              border       : "1px solid #fecaca",
              borderRadius : 10,
              padding      : "9px 14px",
              fontSize     : 13,
              color        : "#dc2626",
              marginBottom : 16,
            }}
          >
            <FiAlertCircle size={15} style={{ flexShrink: 0 }}/>
            {error}
          </div>
        )}

        {/* ── Login Button ──────────────────────────────── */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width          : "100%",
            display        : "flex",
            alignItems     : "center",
            justifyContent : "center",
            gap            : 9,
            background     : loading
              ? "#7fb3c0"
              : "linear-gradient(135deg, #0e5a6f, #094a5c)",
            color          : "#fff",
            border         : "none",
            borderRadius   : 12,
            padding        : "13px",
            fontSize       : 15,
            fontWeight     : 700,
            cursor         : loading ? "not-allowed" : "pointer",
            fontFamily     : "inherit",
            boxShadow      : loading
              ? "none"
              : "0 4px 14px rgba(14,90,111,0.30)",
            transition     : "background 0.2s, box-shadow 0.2s, transform 0.15s",
            letterSpacing  : "0.01em",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background  = "#094a5c";
              e.currentTarget.style.transform   = "translateY(-1px)";
              e.currentTarget.style.boxShadow   = "0 6px 20px rgba(14,90,111,0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background  = "linear-gradient(135deg, #0e5a6f, #094a5c)";
              e.currentTarget.style.transform   = "none";
              e.currentTarget.style.boxShadow   = "0 4px 14px rgba(14,90,111,0.30)";
            }
          }}
        >
          {loading ? (
            <>
              {/* Spinner */}
              <div
                style={{
                  width        : 17,
                  height       : 17,
                  border       : "2.5px solid rgba(255,255,255,0.35)",
                  borderTop    : "2.5px solid #fff",
                  borderRadius : "50%",
                  animation    : "spin 0.75s linear infinite",
                  flexShrink   : 0,
                }}
              />
              Signing in…
            </>
          ) : (
            <>
              <FiLogIn size={18}/>
              Sign In
            </>
          )}
        </button>

        {/* ── Divider ───────────────────────────────────── */}
        <div
          style={{
            display    : "flex",
            alignItems : "center",
            gap        : 12,
            margin     : "22px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}/>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
            Don't have an account?
          </span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}/>
        </div>

        {/* ── Register Link ─────────────────────────────── */}
        <Link
          to="/register"
          style={{
            display        : "flex",
            alignItems     : "center",
            justifyContent : "center",
            gap            : 8,
            width          : "100%",
            padding        : "12px",
            borderRadius   : 12,
            border         : "1.8px solid #0e5a6f",
            color          : "#0e5a6f",
            fontWeight     : 700,
            fontSize       : 14,
            textDecoration : "none",
            transition     : "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0e5a6f";
            e.currentTarget.style.color      = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color      = "#0e5a6f";
          }}
        >
          Create a free account →
        </Link>

        {/* Spinner keyframe */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        `}</style>
      </div>
    </div>
  );
};

export default Login;