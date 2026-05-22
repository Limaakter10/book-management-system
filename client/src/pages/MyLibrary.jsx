import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineSearch, HiOutlineBookOpen } from "react-icons/hi";

// ✅ NEW IMPORT
import ReviewModal from "../component/ReviewModal";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const MyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ NEW STATE
  const [selectedBook, setSelectedBook] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    fetchLibrary();

    const shouldRefresh = localStorage.getItem("refreshLibrary");

    if (shouldRefresh === "true") {
      fetchLibrary();
      localStorage.removeItem("refreshLibrary");
    }

    const interval = setInterval(() => {
      fetchLibrary();
    }, 3000);

    return () => clearInterval(interval);
  }, [location]);

  const filteredBooks = books.filter((book) =>
    book.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRead = (book) => {
    navigate(`/reader/${book._id}`);
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl mb-4 flex items-center gap-2">
        <HiOutlineBookOpen /> My Library
      </h2>

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

              <img
                src={
                  book.coverImage
                    ? `${BASE_URL}${book.coverImage}`
                    : "https://via.placeholder.com/150"
                }
                alt={book.title}
                className="w-full h-40 object-cover rounded"
              />

              <h4 className="font-semibold mt-2 text-sm line-clamp-2">
                {book.title}
              </h4>

              <p className="text-sm text-gray-500">
                {book.author}
              </p>

              {/* ✅ READ BUTTON */}
              <button
                onClick={() => handleRead(book)}
                className="w-full bg-blue-600 text-white mt-2 px-2 py-1 rounded hover:bg-blue-700"
              >
                📖 Read
              </button>

              {/* ✅ NEW REVIEW BUTTON */}
              <button
                onClick={() => setSelectedBook(book)}
                className="w-full bg-orange-100 text-orange-600 mt-2 px-2 py-1 rounded hover:bg-orange-500 hover:text-white transition"
              >
                ⭐ Review & Rate
              </button>

            </div>
          ))}

        </div>
      )}

      {/* ✅ REVIEW MODAL */}
      {selectedBook && (
        <ReviewModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

    </div>
  );
};

export default MyLibrary;