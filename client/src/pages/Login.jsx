import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineLogin
} from "react-icons/hi";

const Login = () => {

  // ================= STATE =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ================= LOGIN FUNCTION =================
  const handleLogin = async () => {
    setError("");

    try {
      setLoading(true);

      const res = await fetch(
        "https://book-management-system-ks6w.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // SAVE USER DATA
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("role", data.user.role);

        // REDIRECT
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }

      } else {
        setError(data.message || "Login failed ❌");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">

        <h2 className="text-2xl font-bold text-[#0e5a6f] mb-6 text-center">
          Welcome Back 👋
        </h2>

        {/* EMAIL */}
        <div className="flex items-center border rounded mb-3 px-2">
          <HiOutlineMail className="text-gray-400" />
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-2 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="flex items-center border rounded mb-3 px-2">
          <HiOutlineLockClosed className="text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#0e5a6f] text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-[#094a5c] transition"
        >
          <HiOutlineLogin />
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* REGISTER */}
        <p className="text-center mt-4 text-sm">
          New user?{" "}
          <Link to="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;