import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaBook, FaUsers,
  FaBox, FaEnvelope, FaSignOutAlt, FaStar
} from "react-icons/fa";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-5">

      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <ul className="space-y-4">

        <li>
          <Link to="/admin" className="flex items-center gap-2">
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>

        <li>
          <Link to="/admin/books" className="flex items-center gap-2">
            <FaBook /> Books
          </Link>
        </li>

        {/* ✅ Featured Books — notun */}
        <li>
          <Link to="/admin/featured" className="flex items-center gap-2 text-yellow-400">
            <FaStar /> Featured Books
          </Link>
        </li>

        <li>
          <Link to="/admin/users" className="flex items-center gap-2">
            <FaUsers /> Users
          </Link>
        </li>

        <li>
          <Link to="/admin/orders" className="flex items-center gap-2">
            <FaBox /> Orders
          </Link>
        </li>

        <li>
          <Link to="/admin/messages" className="flex items-center gap-2">
            <FaEnvelope /> Messages
          </Link>
        </li>

        <li>
          <button onClick={logout} className="flex items-center gap-2 text-red-400">
            <FaSignOutAlt /> Logout
          </button>
        </li>

      </ul>
    </div>
  );
};

export default AdminSidebar;