import { useState, useEffect } from "react";
import api from "../../api/axios"; // ✅ FIX
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaGlobe,
  FaGraduationCap,
  FaBriefcase
} from "react-icons/fa";

// ✅ BASE URL for image
// const BASE_URL = "https://book-management-system-ks6w.onrender.com";
const BASE_URL = "http://localhost:3000";

// ================= CATEGORY STRUCTURE =================
const categories = {
  "Academic Learning": [
    "Machine Learning",
    "Artificial Intelligence",
    "Web Development",
    "Programming",
    "Data Science"
  ],
  "Job Skills": [
    "Interview Skills",
    "Communication",
    "CV Writing",
    "Freelancing",
    "Career Development"
  ]
};

const Shop = () => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [library, setLibrary] = useState([]);
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchBooks();
    fetchLibrary();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get("/api/books"); // ✅ FIX
      setBooks(res.data.books || []);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  const fetchLibrary = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await api.get(`/api/users/library/${userId}`); // ✅ FIX
      setLibrary(res.data);
    } catch (err) {
      console.log("Library error:", err);
    }
  };

  let filteredBooks = [...books];

  if (search.trim()) {
    filteredBooks = filteredBooks.filter(b =>
      b.title?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (mainCategory !== "All") {
    filteredBooks = filteredBooks.filter(
      b => b.category === mainCategory
    );
  }

  if (subCategory) {
    filteredBooks = filteredBooks.filter(
      b => b.subCategory === subCategory
    );
  }

  if (sort === "priceLow") {
    filteredBooks.sort((a, b) => a.price - b.price);
  } else if (sort === "priceHigh") {
    filteredBooks.sort((a, b) => b.price - a.price);
  }

  const isInCart = (id) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.some(item => item._id === id);
  };

  const isOwned = (id) => {
    return library.some(item => item._id === id);
  };

  const handleAdd = async (book) => {
    if (!isLoggedIn) {
      alert("Login first");
      return;
    }

    try {
      await addToCart(book);

      if (book.discount === "BOGO") {
        const freeBook = {
          ...book,
          _id: book._id + "-FREE",
          price: 0,
          title: book.title + " (FREE)"
        };
        await addToCart(freeBook);
      }

      navigate("/cart");

    } catch (err) {
      console.error(err);
      alert("Error adding to cart");
    }
  };

  return (
    <div className="shop">

      {/* SEARCH + SORT */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priceLow">Price Low → High</option>
          <option value="priceHigh">Price High → Low</option>
        </select>
      </div>

      <div className="layout">

        {/* SIDEBAR */}
        <div className="sidebar">
          <h3 className="flex items-center gap-2">
            <FaBookOpen /> Categories
          </h3>

          <button
            className={mainCategory === "All" ? "active" : ""}
            onClick={() => {
              setMainCategory("All");
              setSubCategory("");
            }}
          >
            <FaGlobe /> All
          </button>

          {Object.keys(categories).map(cat => (
            <div key={cat}>
              <button
                className={mainCategory === cat ? "active" : ""}
                onClick={() => {
                  setMainCategory(cat);
                  setSubCategory("");
                }}
              >
                {cat === "Academic Learning"
                  ? <FaGraduationCap />
                  : <FaBriefcase />}
                &nbsp; {cat}
              </button>

              {mainCategory === cat && (
                <div className="sub">
                  {categories[cat].map(sub => (
                    <button
                      key={sub}
                      className={subCategory === sub ? "active-sub" : ""}
                      onClick={() => setSubCategory(sub)}
                    >
                      <FaBookOpen /> {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* BOOK GRID */}
        <div className="grid">
          {filteredBooks.length === 0 ? (
            <p>No books found</p>
          ) : (
            filteredBooks.map(book => (
              <div key={book._id} className="card">

                <img
                  src={
                    book.coverImage
                      ? `${BASE_URL}${book.coverImage}` // ✅ FIX
                      : "https://images.unsplash.com/photo-1512820790803-83ca734da794"
                  }
                  alt={book.title}
                />

                {book.discount > 0 && book.price !== 0 && (
                  <span className="discount">
                    {book.discount}% OFF
                  </span>
                )}

                {book.price === 0 && (
                  <span className="discount">
                    FREE
                  </span>
                )}

                <h4>{book.title}</h4>
                <p className="author">{book.author}</p>

                <span className="tag">
                  {book.category} / {book.subCategory}
                </span>

                <div className="bottom">
                  <span>
                    {book.price === 0 ? "FREE" : `৳ ${book.price}`}
                  </span>

                  <button
                    onClick={() => handleAdd(book)}
                    disabled={isOwned(book._id) || isInCart(book._id)}
                    style={{
                      background: isOwned(book._id)
                        ? "green"
                        : isInCart(book._id)
                        ? "#aaa"
                        : "#0f3460"
                    }}
                  >
                    {isOwned(book._id)
                      ? "Owned"
                      : isInCart(book._id)
                      ? "In Cart"
                      : "Add to Cart"}
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .shop {
          padding: 30px;
          background: #f5f6f7;
        }

        .top-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .top-bar input {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 20px;
        }

        .sidebar {
          background: white;
          padding: 15px;
          border-radius: 10px;
        }

        .sidebar button {
          width: 100%;
          margin-bottom: 8px;
          padding: 10px;
          border: none;
          background: #f1f5f9;
          color: #1a1a1a;
          cursor: pointer;
          border-radius: 8px;
          font-weight: 600;
        }

        .active {
          // background: #898384;
          color: #595a61;
        }

        .sub {
          padding-left: 10px;
        }

        .active-sub {
          background: #bbb;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
          gap: 20px;
        }

        .card {
          background: white;
          padding: 10px;
          border-radius: 10px;
          transition: 0.2s;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .card img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          border-radius: 6px;
        }

        .discount {
          position: absolute;
          top: 5px;
          right: 10px;
          background: red;
          color: white;
          padding: 3px 3px;
          font-size: 10px;
          border-radius: 5px;
        }

        .author {
          font-size: 12px;
          color: gray;
        }

        .tag {
          display: inline-block;
          font-size: 11px;
          background: #e94560;
          color: white;
          padding: 3px 8px;
          border-radius: 20px;
          margin: 5px 0;
        }

        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        button {
          background: #0f3460;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        button:hover {
          background: #666f87;
        }

        @media(max-width: 768px){
          .layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </div>
  );
};

export default Shop;