import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios"; // ✅ FIX

import { FaCalendarAlt, FaUser } from "react-icons/fa";

// ✅ for image load
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    api
      .get(`/api/blogs/${id}`) // ✅ FIX (no localhost)
      .then(res => setBlog(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!blog) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-3xl mx-auto p-6 bg-white mt-8 rounded-xl shadow">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          {blog.title}
        </h1>

        {/* AUTHOR + DATE */}
        <div className="flex items-center justify-between text-gray-500 mb-6 text-sm">

          <div className="flex items-center gap-2">
            <FaUser />
            <span className="font-medium">
              {blog.author || "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarAlt />
            <span>
              {blog.createdAt
                ? new Date(blog.createdAt).toDateString()
                : "No Date"}
            </span>
          </div>

        </div>

        {/* ✅ IMAGE FIX */}
        <img
          src={
            blog.image
              ? `${BASE_URL}${blog.image}` // full URL
              : "https://via.placeholder.com/600"
          }
          alt={blog.title}
          className="w-full h-72 object-cover rounded-lg mb-6"
        />

        {/* CONTENT */}
        <div className="text-gray-700 leading-8 text-lg whitespace-pre-line">
          {blog.content}
        </div>

      </div>

    </div>
  );
};

export default BlogDetails;