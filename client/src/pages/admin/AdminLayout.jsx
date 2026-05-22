import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FaBlog, FaChartPie, FaBookOpen,
  FaUsers, FaBoxOpen, FaEnvelope, FaStar
} from "react-icons/fa";

const AdminLayout = () => {
  const { pathname } = useLocation();

  // active link highlight
  const active = (path) =>
    pathname === path
      ? { color: "#f5a623", fontWeight: 700 }
      : { color: "#cbd5e1" };

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#0f172a] text-white p-4 flex flex-col gap-1">

        <h2 className="text-xl font-bold mb-6 text-white">Admin Panel</h2>

        <ul className="space-y-2">

          <li>
            <Link to="/admin" className="flex items-center gap-2 py-2 px-3 rounded hover:bg-white/10 transition"
              style={active("/admin")}>
              <FaChartPie /> Dashboard
            </Link>
          </li>

          <li>
            <Link to="/admin/books" className="flex items-center gap-2 py-2 px-3 rounded hover:bg-white/10 transition"
              style={active("/admin/books")}>
              <FaBookOpen /> Books
            </Link>
          </li>

          {/* ── Featured Books ── */}
          <li>
            <Link to="/admin/featured" className="flex items-center gap-2 py-2 px-3 rounded hover:bg-white/10 transition"
              style={active("/admin/featured")}>
              <FaStar /> Featured Books
            </Link>
          </li>

          <li>
            <Link to="/admin/users" className="flex items-center gap-2 py-2 px-3 rounded hover:bg-white/10 transition"
              style={active("/admin/users")}>
              <FaUsers /> Users
            </Link>
          </li>

          <li>
            <Link to="/admin/orders" className="flex items-center gap-2 py-2 px-3 rounded hover:bg-white/10 transition"
              style={active("/admin/orders")}>
              <FaBoxOpen /> Orders
            </Link>
          </li>

          <li>
            <Link to="/admin/messages" className="flex items-center gap-2 py-2 px-3 rounded hover:bg-white/10 transition"
              style={active("/admin/messages")}>
              <FaEnvelope /> Messages
            </Link>
          </li>

          <li>
            <Link to="/admin/blog" className="flex items-center gap-2 py-2 px-3 rounded hover:bg-white/10 transition"
              style={active("/admin/blog")}>
              <FaBlog /> Blog
            </Link>
          </li>

        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Outlet />
      </div>

    </div>
  );
};

export default AdminLayout;