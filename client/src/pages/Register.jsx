import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// ✅ Professional Icons
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from "react-icons/hi";

// 🔥 IMPORTANT: production API
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const Register = () => {

  // ================= STATE =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ================= REGISTER FUNCTION =================
  const handleRegister = async () => {

    // 🔁 reset messages
    setError("");
    setSuccess("");

    // ================= VALIDATION =================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password || !confirm) {
      setError("All fields are required");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!agree) {
      setError("You must agree to terms");
      return;
    }

    // ================= API CALL =================
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: email.split("@")[0], // 👤 auto name
          email,
          password,
        }),
      });

      const data = await res.json();

      // ================= RESPONSE =================
      if (res.ok) {
        setSuccess("Registration successful ✅");

        setTimeout(() => {
          navigate("/login"); // 👉 redirect
        }, 1500);

      } else {
        setError(data.message || "Registration failed");
      }

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError("Server error ❌");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <div className="bg-[#e9f0f4] p-8 rounded-xl shadow-md w-[400px]">

        {/* ================= TITLE ================= */}
        <h2 className="text-2xl font-bold text-[#0e5a6f] mb-6">
          Create account
        </h2>

        {/* ================= EMAIL ================= */}
        <div className="flex items-center border rounded mb-3 px-2">
          <HiOutlineMail className="text-gray-400" />
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-2 outline-none bg-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ================= PASSWORD ================= */}
        <div className="flex items-center border rounded mb-3 px-2">
          <HiOutlineLockClosed className="text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 outline-none bg-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ================= CONFIRM ================= */}
        <div className="flex items-center border rounded mb-3 px-2">
          <HiOutlineLockClosed className="text-gray-400" />
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full p-2 outline-none bg-transparent"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* ================= TERMS ================= */}
        <div className="flex gap-2 mb-3 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
          />
          <p>Agree to terms</p>
        </div>

        {/* ================= ERROR ================= */}
        {error && (
          <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
            <HiOutlineExclamationCircle /> {error}
          </p>
        )}

        {/* ================= SUCCESS ================= */}
        {success && (
          <p className="text-green-600 text-sm mb-2 flex items-center gap-1">
            <HiOutlineCheckCircle /> {success}
          </p>
        )}

        {/* ================= BUTTON ================= */}
        <button
          onClick={handleRegister}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
        >
          Register
        </button>

        {/* ================= LOGIN LINK ================= */}
        <p className="text-center mt-4 text-sm">
          Already have account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;