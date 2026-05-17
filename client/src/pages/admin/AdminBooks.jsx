import { useEffect, useState } from "react";
import api from "../../api/axios"; // ✅ axios instance use করো
import { FaBook, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

// ❌ OLD
// const BASE_URL = "http://localhost:3000";

// ✅ NEW (LIVE URL)
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
    const res = await api.get("/api/books"); // ✅ FIX
    setBooks(res.data.books);
  };

  // INPUT
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

  // ADD / UPDATE
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      let price = Number(form.price);

      if (form.isFree) {
        price = 0;
      } else if (form.discount > 0) {
        price = price - (price * form.discount) / 100;
      }

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      formData.set("price", price);

      if (coverImage) formData.append("coverImage", coverImage);
      if (pdf) formData.append("pdf", pdf);

      formData.append("rating", 4.5);
      formData.append("numReviews", 0);

      if (editingId) {
        await api.put(`/api/books/${editingId}`, formData); // ✅ FIX
        alert("Book updated ✅");
      } else {
        await api.post("/api/books/upload", formData); // ✅ FIX
        alert("Book added ✅");
      }

      resetForm();
      fetchBooks();

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  // EDIT
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

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    await api.delete(`/api/books/${id}`); // ✅ FIX
    alert("Deleted ✅");
    fetchBooks();
  };

  // RESET
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
    <div style={{ padding: "20px" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <FaBook /> Admin Book Manager
      </h2>

      {/* FORM */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px"
      }}>

        <input name="title" placeholder="Title"
          value={form.title} onChange={handleChange} />

        <input name="author" placeholder="Author"
          value={form.author} onChange={handleChange} />

        <input name="price" placeholder="Price"
          value={form.price}
          onChange={handleChange}
          disabled={form.isFree}
        />

        <input name="category" placeholder="Category"
          value={form.category} onChange={handleChange} />

        <input name="subCategory" placeholder="SubCategory"
          value={form.subCategory} onChange={handleChange} />

        <input
          type="number"
          name="discount"
          placeholder="Discount %"
          value={form.discount}
          onChange={handleChange}
          disabled={form.isFree}
        />

        <label>
          <input
            type="checkbox"
            name="isFree"
            checked={form.isFree}
            onChange={handleChange}
          />
          Make FREE
        </label>

        {/* COVER */}
        <div>
          <label>Cover Image</label>
          <input type="file" name="coverImage" onChange={handleFileChange} />
          {coverImage && <p>{coverImage.name}</p>}
        </div>

        {/* PDF */}
        <div>
          <label>PDF File</label>
          <input type="file" name="pdf" onChange={handleFileChange} />
          {pdf && <p>{pdf.name}</p>}
        </div>

      </div>

      <button
        onClick={handleSubmit}
        style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}
      >
        <FaPlus />
        {editingId ? "Update Book" : "Add Book"}
      </button>

      {editingId && (
        <button onClick={resetForm} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      )}

      {/* LIST */}
      <div style={{ marginTop: "30px" }}>
        {books.map((b) => (
          <div key={b._id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between"
            }}
          >

            <div style={{ display: "flex", gap: "10px" }}>
              <img
                src={`${BASE_URL}${b.coverImage}`} // ✅ FIXED
                alt={b.title}
                style={{ width: "50px", height: "70px" }}
              />

              <div>
                <b>{b.title}</b>
                <p>{b.author}</p>

                <p>
                  {b.price === 0 ? "FREE 🎁" : `৳ ${b.price}`}
                </p>

                <p>
                  {b.discount > 0
                    ? `${b.discount}% OFF`
                    : "No Discount"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleEdit(b)}>
                <FaEdit />
              </button>

              <button onClick={() => handleDelete(b._id)}>
                <FaTrash />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBooks;