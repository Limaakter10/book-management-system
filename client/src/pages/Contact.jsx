import { useState } from "react";
import api from "../api/axios"; // ← localhost এর বদলে api instance use করো
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineSupport,
  HiOutlinePaperAirplane
} from "react-icons/hi";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // ✅ api instance use করা হচ্ছে — local এ localhost:3000, production এ render.com
      await api.post("/api/messages", form);

      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error(err);
      alert("Error sending message ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#0f172a] flex items-center justify-center gap-2">
          <HiOutlineSupport /> Contact Support
        </h1>
        <p className="text-gray-500 mt-2">We are here to help you</p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* Info */}
        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          <div className="flex items-center gap-4">
            <HiOutlinePhone className="text-blue-600 text-xl" />
            <div><h3 className="font-semibold">Phone</h3><p className="text-gray-500">+880 1734-567890</p></div>
          </div>
          <div className="flex items-center gap-4">
            <HiOutlineMail className="text-green-600 text-xl" />
            <div><h3 className="font-semibold">Email</h3><p className="text-gray-500">support@readnova.com</p></div>
          </div>
          <div className="flex items-center gap-4">
            <HiOutlineLocationMarker className="text-red-600 text-xl" />
            <div><h3 className="font-semibold">Address</h3><p className="text-gray-500">Dhaka, Bangladesh</p></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} placeholder="Your Name"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="Your Email"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              name="message" value={form.message}
              onChange={handleChange} placeholder="Your Message"
              className="w-full border p-3 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 flex items-center gap-2 transition duration-300 disabled:opacity-60"
            >
              <HiOutlinePaperAirplane />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;