import { useEffect, useState } from "react";
import api from "../api/axios"; // ✅ axios instance (baseURL already set)
import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";

// ✅ backend base URL (ONLY for local image fallback)
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const BlogSection = () => {
  // ================= STATE =================
  const [blogs, setBlogs] = useState([]);

  // ================= FETCH BLOG =================
  useEffect(() => {
    api
      .get("/api/blogs") // ✅ no localhost (production safe)
      .then((res) => {
        console.log("BLOGS:", res.data);

        // 👉 show latest 3 blogs
        setBlogs(res.data.slice(0, 3));
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="py-12 px-6">

      {/* ================= TITLE ================= */}
      <h2 className="text-2xl font-bold text-center text-[#0e5a6f] mb-8 flex items-center justify-center gap-2">
        <FaBookOpen /> Latest Blog
      </h2>

      {/* ================= BLOG GRID ================= */}
      <div className="grid md:grid-cols-3 gap-6">

        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="bg-[#f2f9fb] overflow-hidden flex flex-col rounded-lg shadow hover:shadow-xl transition"
          >

            {/* ================= IMAGE ================= */}
            <img
              src={
                blog.image
                  ? blog.image.startsWith("http")
                    ? blog.image // ✅ external image (unsplash)
                    : `${BASE_URL}${blog.image}` // ✅ local backend image
                  : "https://via.placeholder.com/300"
              }
              alt={blog.title}
              className="w-full h-40 object-cover"
            />

            {/* ================= CONTENT ================= */}
            <div className="p-4 flex flex-col flex-grow">

              {/* TITLE */}
              <h3 className="font-semibold text-sm line-clamp-1">
                {blog.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {blog.content}
              </p>

              {/* ================= BUTTON ================= */}
              <div className="mt-auto">
                <Link
                  to={`/blog/${blog._id}`}
                  className="text-[#0e5a6f] mt-3 font-semibold inline-block hover:underline"
                >
                  Read More →
                </Link>
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default BlogSection;