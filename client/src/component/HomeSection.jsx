import React, { useEffect, useState } from "react";
import api from "../api/axios"; // ✅ axios instance (already baseURL সেট করা আছে)
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

// ✅ backend live URL (image load করার জন্য)
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const HomeSection = () => {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  // ✅ state (data store করার জন্য)
  const [books, setBooks] = useState([]);
  const [menu, setMenu] = useState("All Books");
  const [subcategory, setSubcategory] = useState("");

  // slider control
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("featured");
  const [startIndex, setStartIndex] = useState(0);

  // ✅ check user logged in কিনা
  const isLoggedIn = () => {
    return localStorage.getItem("token");
  };

  // ================= FETCH BOOKS =================
  useEffect(() => {
    api
      .get("/api/books") // ✅ backend থেকে data নিচ্ছে
      .then((res) => {
        console.log("DATA:", res.data); // debug দেখার জন্য
        setBooks(res.data.books || []); // state এ data save
      })
      .catch((err) => {
        console.error(err);
        setBooks([]); // error হলে empty
      });
  }, []);

  // ================= CATEGORY GROUP =================
  // books → category + subcategory group করা
  const grouped = books.reduce((acc, book) => {
    const cat = book.category?.trim();
    const sub = book.subCategory?.trim();

    if (!cat || !sub) return acc;

    if (!acc[cat]) acc[cat] = new Set();
    acc[cat].add(sub);

    return acc;
  }, {});

  // category list তৈরি
  const categories = Object.keys(grouped).map((cat) => ({
    name: cat,
    sub: Array.from(grouped[cat]),
  }));

  // ================= FILTER =================
  // category অনুযায়ী বই filter
  const filteredBooks =
    menu === "All Books"
      ? books
      : books.filter(
          (b) =>
            b.subCategory?.toLowerCase() ===
            subcategory?.toLowerCase()
        );

  // ================= FEATURE SECTION =================
  const booksData = {
    featured: books, // সব বই
    arrived: [...books].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    ),
    bestsellers: [...books].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    ),
  };

  const activeBooks = booksData[activeTab] || [];
  const visibleBooks = activeBooks.slice(startIndex, startIndex + 5);

  // next/prev button (feature slider)
  const nextFeature = () => {
    if (startIndex + 5 < activeBooks.length)
      setStartIndex((p) => p + 1);
  };

  const prevFeature = () => {
    if (startIndex > 0) setStartIndex((p) => p - 1);
  };

  // ================= CART =================
  const isInCart = (id) => {
    return cart.some((item) => item._id === id);
  };

  // add to cart / buy
  const handleBuy = async (book) => {
    if (!isLoggedIn()) {
      localStorage.setItem("redirectAfterLogin", "/cart");
      navigate("/login");
      return;
    }

    await addToCart(book);
    navigate("/cart");
  };

  // ================= MENU SLIDER =================
  const menuBooks = filteredBooks.slice(slideIndex, slideIndex + 3);

  const nextSlide = () => {
    if (slideIndex + 3 < filteredBooks.length)
      setSlideIndex((p) => p + 1);
  };

  const prevSlide = () => {
    if (slideIndex > 0) setSlideIndex((p) => p - 1);
  };

  return (
    <div className="p-6 space-y-6">

      {/* ================= LEFT CATEGORY MENU ================= */}
      <div className="bg-[#eaf6f9] p-4 rounded shadow">
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT SIDE */}
          <div>

            {/* ALL BOOKS */}
            <h3
              className="font-semibold cursor-pointer text-blue-600"
              onClick={() => {
                setMenu("All Books");
                setSubcategory("");
              }}
            >
              All Books
            </h3>

            {/* CATEGORY LIST */}
            {categories.map((cat) => (
              <div key={cat.name}>
                <h3
                  className="font-semibold cursor-pointer"
                  onClick={() => setMenu(cat.name)}
                >
                  {cat.name}
                </h3>

                {/* SUB CATEGORY */}
                {menu === cat.name &&
                  cat.sub.map((sub) => (
                    <p
                      key={sub}
                      onClick={() => {
                        setSubcategory(sub);
                        setSlideIndex(0);
                      }}
                      className="ml-3 cursor-pointer hover:text-blue-600"
                    >
                      {sub}
                    </p>
                  ))}
              </div>
            ))}
          </div>

          {/* ================= RIGHT SIDE BOOK SLIDER ================= */}
          <div className="bg-white p-4 rounded shadow text-center relative">

            {menuBooks.length > 0 ? (
              <>
                {/* LEFT BUTTON */}
                <button onClick={prevSlide} className="absolute left-2 top-1/2">
                  <FaChevronLeft />
                </button>

                <div className="flex justify-center gap-4">

                  {menuBooks.map((book) => (
                    <div key={book._id} className="w-28">

                      {/* ✅ IMAGE FIX (IMPORTANT) */}
                      <img
                        src={
                          book.coverImage
                            ? `${BASE_URL}${book.coverImage}`
                            : "https://via.placeholder.com/150"
                        }
                        className="w-24 h-32 mx-auto object-cover"
                      />

                      <p className="text-xs mt-1">{book.title}</p>

                      <p className="text-blue-600 text-sm">৳ {book.price}</p>

                      <button
                        onClick={() => handleBuy(book)}
                        className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}

                </div>

                {/* RIGHT BUTTON */}
                <button onClick={nextSlide} className="absolute right-2 top-1/2">
                  <FaChevronRight />
                </button>
              </>
            ) : (
              <p>Select category</p>
            )}

          </div>
        </div>
      </div>

      {/* ================= FEATURE SECTION ================= */}
      <div className="bg-[#eaf6f9] p-6 rounded shadow">

        {/* TAB SWITCH */}
        <div className="flex gap-6 mb-4">
          {["featured", "arrived", "bestsellers"].map((tab) => (
            <span
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setStartIndex(0);
              }}
              className={`cursor-pointer ${
                activeTab === tab ? "font-bold underline" : ""
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* BOOK DISPLAY */}
        <div className="relative flex items-center justify-center">

          <button onClick={prevFeature} className="absolute left-0">
            <FaChevronLeft />
          </button>

          <div className="flex gap-6 px-10">

            {visibleBooks.map((book) => (
              <div key={book._id} className="bg-white p-4 rounded shadow text-center w-40">

                {/* IMAGE */}
                <img
                  src={
                    book.coverImage
                      ? `${BASE_URL}${book.coverImage}`
                      : "https://via.placeholder.com/150"
                  }
                  className="w-28 h-40 mx-auto object-cover"
                />

                <p className="text-sm font-semibold mt-2">{book.title}</p>

                <p className="text-blue-600 font-bold">৳ {book.price}</p>

                <button
                  onClick={() => handleBuy(book)}
                  className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-sm"
                >
                  Add to Cart
                </button>

              </div>
            ))}

          </div>

          <button onClick={nextFeature} className="absolute right-0">
            <FaChevronRight />
          </button>

        </div>
      </div>

    </div>
  );
};

export default HomeSection;