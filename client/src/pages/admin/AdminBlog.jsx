import { useEffect, useState } from "react";
import api from "../../api/axios"; //  axios instance use করো
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const AdminBlog = () => {

  const [blogs, setBlogs] = useState([]);

  //  form state
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    author: ""
  });

  const [editId, setEditId] = useState(null);

  // ================= LOAD BLOGS =================
  const fetchBlogs = () => {
    api.get("/api/blogs") //  localhost remove
      .then(res => setBlogs(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= CREATE / UPDATE =================
  const submit = async () => {
    try {
      if (editId) {
        //  UPDATE
        await api.put(`/api/blogs/${editId}`, form);
        alert("Updated ✅");
      } else {
        //  CREATE
        await api.post("/api/blogs", form);
        alert("Created ✅");
      }

      // reset form
      setForm({ title: "", content: "", image: "", author: "" });
      setEditId(null);

      fetchBlogs(); // refresh list

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  // ================= DELETE =================
  const deleteBlog = async (id) => {
    try {
      await api.delete(`/api/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= EDIT =================
  const editBlog = (blog) => {
    setForm(blog);
    setEditId(blog._id);
  };

  return (
    <div className="p-6">

      {/* ================= FORM ================= */}
      <div className="bg-white p-6 shadow rounded mb-6 max-w-xl">

        <div className="flex flex-col gap-4">

          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="author"
            placeholder="Author"
            value={form.author}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="image"
            placeholder="Image URL (/uploads/...)"
            value={form.image}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <textarea
            name="content"
            placeholder="Content"
            value={form.content}
            onChange={handleChange}
            className="border p-2 rounded h-32"
          />

          <button
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
          >
            <FaPlus />
            {editId ? "Update Blog" : "Add Blog"}
          </button>

        </div>

      </div>

      {/* ================= BLOG LIST ================= */}
      {blogs.map(blog => (
        <div key={blog._id} className="bg-white p-4 shadow mb-3 flex justify-between">

          <div>
            <h3 className="font-bold">{blog.title}</h3>
            <p className="text-sm text-gray-500">{blog.author}</p>
          </div>

          <div className="flex gap-3">

            <button onClick={() => editBlog(blog)} className="text-blue-600">
              <FaEdit />
            </button>

            <button onClick={() => deleteBlog(blog._id)} className="text-red-600">
              <FaTrash />
            </button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default AdminBlog;