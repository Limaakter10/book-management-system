import React from "react";
import { Link } from "react-router-dom";

// 🔥 React Icons (PROFESSIONAL)
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#0e5a6f] text-white mt-10">

      {/* ================= TOP SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">

        {/* 🔥 RESPONSIVE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

          {/* ================= LOGO ================= */}
          <div>
            <h1 className="text-2xl font-bold mb-4">
              Read<span className="text-yellow-400">NOVA</span>
            </h1>

            <p className="text-sm text-gray-200 leading-relaxed">
              Your digital library for exploring thousands of books,
              stories, and knowledge from around the world.
            </p>

            {/* 🔥 SOCIAL ICONS (FIXED) */}
            <div className="flex gap-3 mt-5">

              <div className="bg-blue-600 p-2 rounded hover:scale-110 transition cursor-pointer">
                <FaFacebookF />
              </div>

              <div className="bg-sky-500 p-2 rounded hover:scale-110 transition cursor-pointer">
                <FaTwitter />
              </div>

              <div className="bg-pink-500 p-2 rounded hover:scale-110 transition cursor-pointer">
                <FaInstagram />
              </div>

              <div className="bg-red-500 p-2 rounded hover:scale-110 transition cursor-pointer">
                <FaYoutube />
              </div>

            </div>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>

            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
              <li><Link to="/shop" className="hover:text-yellow-400">Shop</Link></li>
              <li><Link to="/blog" className="hover:text-yellow-400">Blog</Link></li>
              <li><Link to="/login" className="hover:text-yellow-400">Login</Link></li>
                <li><Link to="/about" className="hover:text-yellow-400">About</Link></li>
            </ul>
          </div>

          {/* ================= CATEGORIES ================= */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Categories</h2>

            <ul className="flex flex-col gap-2 text-sm">
              <li className="hover:text-yellow-400 cursor-pointer">Academic Learning</li>
              <li className="hover:text-yellow-400 cursor-pointer">Job Skills</li>
            </ul>
          </div>

          {/* ================= SUBSCRIBE ================= */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Subscribe</h2>

            <p className="text-sm text-gray-200 mb-4">
              Get latest updates and offers
            </p>

            {/* 🔥 FIXED INPUT + BUTTON ALIGNMENT */}
            <div className="flex w-full overflow-hidden rounded bg-blue-100">

              {/* INPUT */}
              <input
                type="email"
                placeholder="Your email..."
                className="w-full px-3 py-2 text-black text-sm outline-none"
              />

              {/* BUTTON */}
              <button className="bg-yellow-400 text-black px-4 text-sm font-semibold hover:bg-yellow-300 transition">
                Subscribe
              </button>

            </div>

            {/* CONTACT */}
            <div className="mt-4 text-sm text-gray-200 space-y-1">
              <p>support@readnova.com</p>
              <p>+880 1234 567890</p>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-gray-400 py-4 text-xs sm:text-sm">

        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">

          <p>© 2026 ReadNOVA. All rights reserved.</p>

          <div className="flex gap-4">
            <span className="hover:text-yellow-400 cursor-pointer">Privacy</span>
            <span className="hover:text-yellow-400 cursor-pointer">Terms</span>
            <span className="hover:text-yellow-400 cursor-pointer">Cookies</span>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;