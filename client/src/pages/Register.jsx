// ============================================================
// FILE : src/pages/Register.jsx
// FIX  : Issue 02 — footer floating fixed with min-height calc
// ICONS: react-icons/fi (Feather — professional & consistent)
// ============================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  FiMail,         // email field
  FiLock,         // password fields
  FiEye,          // show password
  FiEyeOff,       // hide password
  FiUserPlus,     // register button
  FiCheckCircle,  // success message
  FiAlertCircle,  // error message
  FiBookOpen,     // brand icon
  FiCheck,        // checkbox tick
} from "react-icons/fi";

// ── Backend URL ───────────────────────────────────────────
const BASE_URL = "https://book-management-system-ks6w.onrender.com";


const Register = () => {

  // ── State ───────────────────────────────────────────────
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [agree,      setAgree]      = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [focusField, setFocusField] = useState("");

  const navigate = useNavigate();

  // ── Input field wrapper style ───────────────────────────
  const fieldWrap = (field) => ({
    display      : "flex",
    alignItems   : "center",
    gap          : 10,
    border       : `1.8px solid ${focusField === field ? "#0e5a6f" : "#e2e8f0"}`,
    borderRadius : 12,
    padding      : "11px 14px",
    marginBottom : 14,
    background   : focusField === field ? "#f0f7fa" : "#f8fafc",
    transition   : "border-color 0.2s, background 0.2s",
  });

  // ── Validation ──────────────────────────────────────────
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim())              return "Full name is required.";
    if (!email.trim())             return "Email address is required.";
    if (!emailRegex.test(email))   return "Please enter a valid email address.";
    if (password.length < 6)       return "Password must be at least 6 characters.";
    if (password !== confirm)       return "Passwords do not match.";
    if (!agree)                    return "You must agree to the Terms & Conditions.";
    return null;
  };

  // ── Register handler ────────────────────────────────────
  const handleRegister = async () => {
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/register`, {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ name: name.trim(), email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Account created successfully! Redirecting…");
        setTimeout(() => navigate("/login"), 1600);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ───────────────────────────────────
  const strength =
    password.length === 0 ? 0 :
    password.length < 6   ? 1 :
    password.length < 10 && /[A-Z]/.test(password) ? 2 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : 2;

  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#16a34a"];


  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div
      style={{
        // ✅ ISSUE 02 FIX — footer pinned, no dead whitespace
        minHeight      : "calc(100vh - 64px - 80px)",
        display        : "flex",
        alignItems     : "center",
        justifyContent : "center",
        background     : "linear-gradient(135deg, #e8f4f8 0%, #f0f7fa 100%)",
        padding        : "40px 16px",
        fontFamily     : "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          background   : "#ffffff",
          borderRadius : 20,
          boxShadow    : "0 8px 40px rgba(14,90,111,0.13)",
          padding      : "44px 40px",
          width        : "100%",
          maxWidth     : 460,
          position     : "relative",
          overflow     : "hidden",
        }}
      >
        {/* Top accent strip */}
        <div style={{
          position   : "absolute",
          top: 0, left: 0, right: 0,
          height     : 5,
          background : "linear-gradient(90deg, #0e5a6f, #16a34a)",
          borderRadius: "20px 20px 0 0",
        }}/>

        {/* ── Brand ──────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{
            width          : 64,
            height         : 64,
            borderRadius   : "50%",
            background     : "linear-gradient(135deg, #0e5a6f, #094a5c)",
            display        : "flex",
            alignItems     : "center",
            justifyContent : "center",
            margin         : "0 auto 14px",
            boxShadow      : "0 4px 16px rgba(14,90,111,0.25)",
          }}>
            <FiBookOpen size={28} color="#fff"/>
          </div>
          <h2 style={{
            fontSize    : 23,
            fontWeight  : 800,
            color       : "#0e5a6f",
            marginBottom: 5,
            letterSpacing: "-0.3px",
          }}>
            Create Account
          </h2>
          <p style={{ fontSize: 13.5, color: "#94a3b8" }}>
            Join ReadNOVA — start reading today
          </p>
        </div>

        {/* ── Full Name ──────────────────────────────────── */}
        <label style={{
          display: "block", fontSize: 12, fontWeight: 700,
          color: "#475569", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          Full Name
        </label>
        <div style={fieldWrap("name")}>
          <FiUserPlus
            size={17}
            color={focusField === "name" ? "#0e5a6f" : "#94a3b8"}
            style={{ flexShrink: 0, transition: "color 0.2s" }}
          />
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocusField("name")}
            onBlur={() => setFocusField("")}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 14,
              color: "#0f172a", fontFamily: "inherit",
            }}
          />
        </div>

        {/* ── Email ──────────────────────────────────────── */}
        <label style={{
          display: "block", fontSize: 12, fontWeight: 700,
          color: "#475569", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          Email Address
        </label>
        <div style={fieldWrap("email")}>
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
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 14,
              color: "#0f172a", fontFamily: "inherit",
            }}
          />
        </div>

        {/* ── Password ───────────────────────────────────── */}
        <label style={{
          display: "block", fontSize: 12, fontWeight: 700,
          color: "#475569", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          Password
        </label>
        <div style={fieldWrap("password")}>
          <FiLock
            size={17}
            color={focusField === "password" ? "#0e5a6f" : "#94a3b8"}
            style={{ flexShrink: 0, transition: "color 0.2s" }}
          />
          <input
            type={showPass ? "text" : "password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField("password")}
            onBlur={() => setFocusField("")}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 14,
              color: "#0f172a", fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            style={{
              background: "none", border: "none",
              cursor: "pointer", padding: 0,
              color: "#94a3b8", display: "flex", alignItems: "center",
            }}
          >
            {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
          </button>
        </div>

        {/* Password strength bar */}
        {password.length > 0 && (
          <div style={{ marginTop: -10, marginBottom: 14 }}>
            <div style={{
              display: "flex", gap: 4, marginBottom: 4,
            }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: strength >= s
                    ? strengthColor[strength] : "#e2e8f0",
                  transition: "background 0.3s",
                }}/>
              ))}
            </div>
            <p style={{
              fontSize: 11.5,
              color   : strengthColor[strength],
              fontWeight: 600,
            }}>
              {strengthLabel[strength]} password
            </p>
          </div>
        )}

        {/* ── Confirm Password ───────────────────────────── */}
        <label style={{
          display: "block", fontSize: 12, fontWeight: 700,
          color: "#475569", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          Confirm Password
        </label>
        <div style={{
          ...fieldWrap("confirm"),
          borderColor: confirm && confirm !== password
            ? "#ef4444"
            : confirm && confirm === password
            ? "#16a34a"
            : focusField === "confirm"
            ? "#0e5a6f" : "#e2e8f0",
        }}>
          <FiLock
            size={17}
            color={
              confirm && confirm !== password ? "#ef4444" :
              confirm && confirm === password ? "#16a34a" :
              focusField === "confirm" ? "#0e5a6f" : "#94a3b8"
            }
            style={{ flexShrink: 0, transition: "color 0.2s" }}
          />
          <input
            type={showConf ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onFocus={() => setFocusField("confirm")}
            onBlur={() => setFocusField("")}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 14,
              color: "#0f172a", fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConf((s) => !s)}
            style={{
              background: "none", border: "none",
              cursor: "pointer", padding: 0,
              color: "#94a3b8", display: "flex", alignItems: "center",
            }}
          >
            {showConf ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
          </button>
          {/* Inline match indicator */}
          {confirm && confirm === password && (
            <FiCheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }}/>
          )}
        </div>

        {/* ── Terms Checkbox ─────────────────────────────── */}
        <div
          style={{
            display    : "flex",
            alignItems : "flex-start",
            gap        : 10,
            marginBottom: 18,
            cursor     : "pointer",
          }}
          onClick={() => setAgree((a) => !a)}
        >
          {/* Custom checkbox */}
          <div style={{
            width        : 20,
            height       : 20,
            borderRadius : 5,
            border       : `2px solid ${agree ? "#0e5a6f" : "#cbd5e1"}`,
            background   : agree ? "#0e5a6f" : "white",
            display      : "flex",
            alignItems   : "center",
            justifyContent: "center",
            flexShrink   : 0,
            marginTop    : 1,
            transition   : "all 0.2s",
          }}>
            {agree && <FiCheck size={12} color="white" strokeWidth={3}/>}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
            I agree to the{" "}
            <span style={{ color: "#0e5a6f", fontWeight: 600, cursor: "pointer" }}>
              Terms &amp; Conditions
            </span>{" "}
            and{" "}
            <span style={{ color: "#0e5a6f", fontWeight: 600, cursor: "pointer" }}>
              Privacy Policy
            </span>
          </p>
        </div>

        {/* ── Error ──────────────────────────────────────── */}
        {error && (
          <div style={{
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
          }}>
            <FiAlertCircle size={15} style={{ flexShrink: 0 }}/>
            {error}
          </div>
        )}

        {/* ── Success ────────────────────────────────────── */}
        {success && (
          <div style={{
            display      : "flex",
            alignItems   : "center",
            gap          : 8,
            background   : "#f0fdf4",
            border       : "1px solid #86efac",
            borderRadius : 10,
            padding      : "9px 14px",
            fontSize     : 13,
            color        : "#16a34a",
            marginBottom : 16,
          }}>
            <FiCheckCircle size={15} style={{ flexShrink: 0 }}/>
            {success}
          </div>
        )}

        {/* ── Register Button ────────────────────────────── */}
        <button
          onClick={handleRegister}
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
            boxShadow      : loading ? "none"
              : "0 4px 14px rgba(14,90,111,0.30)",
            transition     : "all 0.2s",
            letterSpacing  : "0.01em",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "#094a5c";
              e.currentTarget.style.transform  = "translateY(-1px)";
              e.currentTarget.style.boxShadow  = "0 6px 20px rgba(14,90,111,0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "linear-gradient(135deg, #0e5a6f, #094a5c)";
              e.currentTarget.style.transform  = "none";
              e.currentTarget.style.boxShadow  = "0 4px 14px rgba(14,90,111,0.30)";
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 17, height: 17,
                border: "2.5px solid rgba(255,255,255,0.35)",
                borderTop: "2.5px solid #fff",
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
                flexShrink: 0,
              }}/>
              Creating account…
            </>
          ) : (
            <>
              <FiUserPlus size={18}/>
              Create Account
            </>
          )}
        </button>

        {/* ── Divider ────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: 12, margin: "20px 0",
        }}>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}/>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
            Already have an account?
          </span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}/>
        </div>

        {/* ── Login Link ─────────────────────────────────── */}
        <Link
          to="/login"
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
            transition     : "all 0.2s",
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
          Sign in to your account →
        </Link>

        {/* Spinner keyframe */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default Register;