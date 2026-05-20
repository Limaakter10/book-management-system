import React, { useEffect } from "react";
import {
  FaShoppingCart,
  FaPhoneAlt,
  FaEnvelope,
  FaSignOutAlt,
  FaBook,
  FaCog,
  FaTachometerAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import api from "../api/axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  // ── Safe user parse from localStorage ────────────────────
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  // ── Logout: clear storage and redirect ───────────────────
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ── Poll every 10s for approved payment notifications ────
  useEffect(() => {
    const checkNotification = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const res = await api.get(`/api/orders/user/${userId}`);
        const newOrder = res.data.find(
          o => o.status === "paid" && o.approved === true && o.notified === false
        );
        if (newOrder) {
          toast.success("Payment Approved! Check your library");
          await api.post(`/api/orders/notify/${newOrder._id}`);
        }
      } catch (err) {
        console.error("Notification error:", err.message);
      }
    };
    checkNotification();
    const interval = setInterval(checkNotification, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full shadow-sm">

      {/* ── TOP BAR: contact info + nav links ── */}
      <div className="bg-[#e6f2f6] text-sm px-6 py-2 flex justify-between items-center">

        {/* Contact info (hidden on mobile) */}
        <div className="hidden md:flex gap-4 text-[#0e5a6f]">
          <span className="flex items-center gap-1">
            <FaPhoneAlt /> +880 1734-567890
          </span>
          <span className="flex items-center gap-1">
            <FaEnvelope /> support@readnova.com
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-4 text-[#0e5a6f]">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/help">Help</NavLink>
          <NavLink to="/refund-policy">Refund Policy</NavLink>

          {/* Admin link — only for admin role */}
          {user?.role === "admin" && (
            <NavLink to="/admin/orders" className="flex items-center gap-1">
              <FaCog /> Admin
            </NavLink>
          )}
        </div>
      </div>

      {/* ── MAIN NAV: logo + user controls + cart ── */}
      <div className="flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <img src="/logo.svg" alt="ReadNOVA" className="h-12" />
        </NavLink>

        {/* Right side: auth + cart */}
        <div className="flex items-center gap-5 text-[#0e5a6f]">

          {/* ── Guest: show Login / Register ── */}
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <>
              {/* User dashboard pill: avatar + name */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 font-semibold
                  ${isActive
                    ? "bg-[#0e5a6f] text-white"
                    : "bg-[#e6f2f6] text-[#0e5a6f] hover:bg-[#cce4ec]"
                  }`
                }
              >
                {/* Avatar circle: first letter of name */}
                <div className="w-6 h-6 rounded-full bg-[#0e5a6f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">
                  {user.name || user.email?.split("@")[0]}
                </span>
                <FaTachometerAlt className="text-xs opacity-70" />
              </NavLink>

              {/* My Library */}
              <NavLink to="/library" className="flex items-center gap-1">
                <FaBook /> My Library
              </NavLink>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 hover:text-red-500 transition-colors duration-200"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}

          {/* ── Cart icon with item count badge ── */}
          <NavLink to="/cart" className="relative flex items-center">

            {/* Cart icon — size 22px, teal color */}
            <FaShoppingCart
              size={22}
              className="text-[#0e5a6f] hover:text-[#0a4a5c] transition-colors duration-200"
            />

            {/* Count badge — red circle, top-right of icon */}
            {(cart?.length || 0) > 0 && (
              <span
                className="absolute flex items-center justify-center
                  bg-red-500 text-white font-bold rounded-full
                  min-w-[18px] h-[18px] text-[10px] px-1
                  -top-2 -right-2 shadow-sm"
              >
                {cart.length > 99 ? "99+" : cart.length}
              </span>
            )}
          </NavLink>

        </div>
      </div>

    </div>
  );
};

export default Navbar;