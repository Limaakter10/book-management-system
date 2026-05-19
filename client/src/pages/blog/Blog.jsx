import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

import { FaCalendarAlt, FaUser, FaSearch, FaPenFancy } from "react-icons/fa";
import { AiOutlineRead } from "react-icons/ai";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/blogs")
      .then(res => setBlogs(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(search.toLowerCase()) ||
    blog.author?.toLowerCase().includes(search.toLowerCase()) ||
    blog.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white py-16 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <FaPenFancy /> Blog & Insights
        </h1>
        <p className="text-gray-300 mt-2">
          Discover knowledge, trends, and ideas
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="relative">
          <FaSearch className="absolute top-4 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, author, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border pl-10 p-3 rounded-lg shadow-sm"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-8">

        {filteredBlogs.length === 0 ? (
          <p className="col-span-3 text-center text-gray-500">
            No blogs found
          </p>
        ) : (
          filteredBlogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-xl shadow hover:shadow-2xl flex flex-col">

              {/* ✅ IMAGE FIX */}
              <img
                src={
                  blog.image
                    ? blog.image.startsWith("http")
                      ? blog.image.includes("unsplash")
                        ? `${blog.image}?auto=format&fit=crop&w=800&q=80`
                        : blog.image
                      : `${BASE_URL}/${blog.image.replace(/^\/+/, "")}`
                    : "https://via.placeholder.com/300"
                }
                alt={blog.title}
                className="h-48 w-full object-cover rounded-t-xl"
              />

              <div className="p-5 flex flex-col flex-grow">

                <h2 className="text-xl font-bold mb-2">{blog.title}</h2>

                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FaUser /> {blog.author || "Admin"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt />
                    {blog.createdAt
                      ? new Date(blog.createdAt).toDateString()
                      : "No Date"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3">
                  {blog.content}
                </p>

                <div className="mt-auto">
                  <Link
                    to={`/blog/${blog._id}`}
                    className="flex items-center gap-1 text-blue-600 mt-4 font-semibold"
                  >
                    <AiOutlineRead /> Read More
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Blog;