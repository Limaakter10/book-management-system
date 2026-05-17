import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineSearch, HiOutlineBookOpen } from "react-icons/hi";

// 🔥 Backend base URL
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const MyLibrary = () => {
  // ================= STATE =================
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ================= FETCH FUNCTION =================
  const fetchLibrary = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.log("❌ No user logged in");
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/api/users/library/${userId}`
      );

      setBooks(res.data || []);

    } catch (error) {
      console.error("❌ Library fetch error:", error);
    }
  };

  // ================= AUTO REFRESH (MAIN LOGIC) =================
  useEffect(() => {
    // 🔥 1. Initial load
    fetchLibrary();

    // 🔥 2. Check refresh flag (from payment success)
    const shouldRefresh = localStorage.getItem("refreshLibrary");

    if (shouldRefresh === "true") {
      fetchLibrary(); // force update
      localStorage.removeItem("refreshLibrary");
    }

    // 🔥 3. Fallback: check every 3 sec (important for async payment delay)
    const interval = setInterval(() => {
      fetchLibrary();
    }, 3000);

    return () => clearInterval(interval);

  }, [location]);

  // ================= SEARCH FILTER =================
  const filteredBooks = books.filter((book) =>
    book.title?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= READ BOOK =================
  const handleRead = (book) => {
    navigate(`/reader/${book._id}`);
  };

  return (
    <div className="p-6">

      {/* TITLE */}
      <h2 className="text-2xl mb-4 flex items-center gap-2">
        <HiOutlineBookOpen /> My Library
      </h2>

      {/* SEARCH */}
      <div className="flex items-center border rounded mb-4 px-2">
        <HiOutlineSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 w-full outline-none"
        />
      </div>

      {/* EMPTY STATE */}
      {filteredBooks.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No books found 📭
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="border p-3 rounded shadow hover:shadow-lg transition"
            >

              {/* COVER */}
              <img
                src={
                  book.coverImage
                    ? `${BASE_URL}${book.coverImage}`
                    : "https://via.placeholder.com/150"
                }
                alt={book.title}
                className="w-full h-40 object-cover rounded"
              />

              {/* TITLE */}
              <h4 className="font-semibold mt-2 text-sm line-clamp-2">
                {book.title}
              </h4>

              {/* AUTHOR */}
              <p className="text-sm text-gray-500">
                {book.author}
              </p>

              {/* BUTTON */}
              <button
                onClick={() => handleRead(book)}
                className="w-full bg-blue-600 text-white mt-2 px-2 py-1 rounded hover:bg-blue-700"
              >
                📖 Read
              </button>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default MyLibrary;