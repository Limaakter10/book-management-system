import { useState } from "react";
import axios from "axios";

// ✅ More professional icons (Heroicons)
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineSupport,
  HiOutlinePaperAirplane
} from "react-icons/hi";

const Contact = () => {

  // ================= FORM STATE =================
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false); // 🔄 loading state

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ================= SUBMIT FUNCTION =================
  const handleSubmit = async (e) => {
    e.preventDefault(); // ❌ stop page reload

    try {
      setLoading(true); // 🔄 start loading

      // ✅ API call to backend
      await axios.post("http://localhost:3000/api/messages", form);

      alert("Message sent ✅");

      // 🔄 reset form after submit
      setForm({
        name: "",
        email: "",
        message: ""
      });

    } catch (err) {
      console.log(err);
      alert("Error sending message ❌");
    } finally {
      setLoading(false); // 🔚 stop loading
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* ================= TITLE ================= */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#0f172a] flex items-center justify-center gap-2">
          <HiOutlineSupport /> Contact Support
        </h1>

        <p className="text-gray-500 mt-2">
          We are here to help you
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* ================= CONTACT INFO ================= */}
        <div className="bg-white p-6 rounded-xl shadow space-y-6">

          {/* PHONE */}
          <div className="flex items-center gap-4">
            <HiOutlinePhone className="text-blue-600 text-xl" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-gray-500">+880 1234 567 890</p>
            </div>
          </div>

          {/* EMAIL */}
          <div className="flex items-center gap-4">
            <HiOutlineMail className="text-green-600 text-xl" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-gray-500">support@readnova.com</p>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="flex items-center gap-4">
            <HiOutlineLocationMarker className="text-red-600 text-xl" />
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-gray-500">Dhaka, Bangladesh</p>
            </div>
          </div>

        </div>

        {/* ================= CONTACT FORM ================= */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Send us a message
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* NAME */}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* MESSAGE */}
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message"
              className="w-full border p-3 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 flex items-center gap-2 transition duration-300"
            >
              <HiOutlinePaperAirplane />

              {/* ✅ dynamic text */}
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Contact;