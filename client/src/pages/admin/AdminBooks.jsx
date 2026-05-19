import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaBook, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    category: "",
    subCategory: "",
    discount: 0,
    isFree: false
  });

  const [coverImage, setCoverImage] = useState(null);
  const [pdf, setPdf] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await api.get("/api/books");
    setBooks(res.data.books);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === "coverImage") {
      setCoverImage(e.target.files[0]);
    } else {
      setPdf(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      let price = Number(form.price);

      if (form.isFree) price = 0;
      else if (form.discount > 0)
        price = price - (price * form.discount) / 100;

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      formData.set("price", price);

      if (coverImage) formData.append("coverImage", coverImage);
      if (pdf) formData.append("pdf", pdf);

      formData.append("rating", 4.5);
      formData.append("numReviews", 0);

      if (editingId) {
        await api.put(`/api/books/${editingId}`, formData);
        alert("Book updated ✅");
      } else {
        await api.post("/api/books/upload", formData);
        alert("Book added ✅");
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  const handleEdit = (book) => {
    setEditingId(book._id);

    setForm({
      title: book.title,
      author: book.author,
      price: book.price,
      category: book.category,
      subCategory: book.subCategory,
      discount: book.discount || 0,
      isFree: book.price === 0
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    await api.delete(`/api/books/${id}`);
    alert("Deleted ✅");
    fetchBooks();
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      author: "",
      price: "",
      category: "",
      subCategory: "",
      discount: 0,
      isFree: false
    });
    setCoverImage(null);
    setPdf(null);
  };

  return (
    <div style={{ padding: "25px", background: "#f5f6f7", minHeight: "100vh" }}>
      
      <h2 style={{ display: "flex", gap: "8px" }}>
        <FaBook /> Admin Book Manager
      </h2>

      {/* FORM */}
      <div className="form-box">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input name="author" placeholder="Author" value={form.author} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} disabled={form.isFree} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="subCategory" placeholder="SubCategory" value={form.subCategory} onChange={handleChange} />

        <input
          type="number"
          name="discount"
          placeholder="Discount %"
          value={form.discount}
          onChange={handleChange}
          disabled={form.isFree}
        />

        <label>
          <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} />
          Make FREE
        </label>

        <div>
          <label>Cover Image</label>
          <input type="file" name="coverImage" onChange={handleFileChange} />
        </div>

        <div>
          <label>PDF File</label>
          <input type="file" name="pdf" onChange={handleFileChange} />
        </div>
      </div>

      {/* BUTTON */}
      <button className="main-btn" onClick={handleSubmit}>
        <FaPlus />
        {editingId ? "Update Book" : "Add Book"}
      </button>

      {editingId && (
        <button onClick={resetForm} className="cancel-btn">
          Cancel
        </button>
      )}

      {/* LIST */}
      <div style={{ marginTop: "30px" }}>
        {books.map((b) => (
          <div key={b._id} className="card">

            <div style={{ display: "flex", gap: "12px" }}>
              <img
                src={`${BASE_URL}${b.coverImage}`}
                alt={b.title}
                className="book-img"
              />

              <div>
                <b>{b.title}</b>
                <p>{b.author}</p>
                <p>{b.price === 0 ? "FREE 🎁" : `৳ ${b.price}`}</p>
                <p>{b.discount > 0 ? `${b.discount}% OFF` : "No Discount"}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleEdit(b)} className="edit-btn">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(b._id)} className="delete-btn">
                <FaTrash />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* ================= STYLE ================= */}
      <style>{`
        .form-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background: #fff;
          padding: 15px;
          border-radius: 12px;
          margin-top: 10px;
        }

        input {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .main-btn {
          margin-top: 15px;
          padding: 10px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0f3460, #16213e);
          color: #fff;
          border: none;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .cancel-btn {
          margin-left: 10px;
          padding: 10px 15px;
          border-radius: 8px;
          border: none;
          background: #ccc;
          cursor: pointer;
        }

        .card {
          display: flex;
          justify-content: space-between;
          background: #fff;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 12px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.08);
        }

        .book-img {
          width: 55px;
          height: 75px;
          border-radius: 6px;
          object-fit: cover;
        }

        .edit-btn {
          background: #0f3460;
          color: #fff;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
        }

        .delete-btn {
          background: red;
          color: #fff;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
        }

      `}</style>

    </div>
  );
};

export default AdminBooks;