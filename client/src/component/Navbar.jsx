import React, { useEffect } from "react";
import {
  FaShoppingCart,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
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

  // ================= SAFE USER PARSE =================
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ================= NOTIFICATION =================
  useEffect(() => {
    const checkNotification = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await api.get(`/api/orders/user/${userId}`);

        const newOrder = res.data.find(
          (order) =>
            order.status === "paid" &&
            order.approved === true &&
            order.notified === false
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

      {/* ================= TOP NAVBAR ================= */}
      <div className="bg-[#e6f2f6] text-sm px-6 py-2 flex justify-between items-center">

        <div className="hidden md:flex gap-4 text-[#0e5a6f]">
          <span className="flex items-center gap-1">
            <FaPhoneAlt /> +880 1734-567890
          </span>
          <span className="flex items-center gap-1">
            <FaEnvelope /> support@readnova.com
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#0e5a6f]">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/help">Help</NavLink>
          <NavLink to="/refund-policy">Refund Policy</NavLink>

          {/* ADMIN */}
          {user?.role === "admin" && (
            <NavLink to="/admin/orders" className="flex items-center gap-1">
              <FaCog /> Admin
            </NavLink>
          )}
        </div>
      </div>

      {/* ================= MAIN NAV ================= */}
      <div className="flex justify-between items-center px-6 py-4">

        {/* LOGO */}
        <NavLink to="/" className="flex items-center">
          <img src="/logo.svg" alt="ReadNOVA" className="h-12" />
        </NavLink>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-5 text-[#0e5a6f]">

          {/* AUTH */}
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <>
              {/* DASHBOARD LINK — avatar + name */}
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
                {/* avatar circle */}
                <div className="w-6 h-6 rounded-full bg-[#0e5a6f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">
                  {user.name || user.email?.split("@")[0]}
                </span>
                <FaTachometerAlt className="text-xs opacity-70" />
              </NavLink>

              {/* MY LIBRARY */}
              <NavLink to="/library" className="flex items-center gap-1">
                <FaBook /> My Library
              </NavLink>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 hover:text-red-500 transition-colors duration-200"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}

          {/* CART */}
          <NavLink to="/cart" className="relative">
            <FaShoppingCart />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
              {cart?.length || 0}
            </span>
          </NavLink>

        </div>
      </div>

    </div>
  );
};

export default Navbar;