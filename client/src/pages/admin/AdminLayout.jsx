import { Outlet, Link } from "react-router-dom";
import {
  FaBlog,
  FaChartPie,
  FaBookOpen,
  FaUsers,
  FaBoxOpen,
  FaEnvelope
} from "react-icons/fa";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-[#0f172a] text-white p-4">

        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <ul className="space-y-4">

          <li>
            <Link to="/admin" className="flex items-center gap-2">
              <FaChartPie /> Dashboard
            </Link>
          </li>

          <li>
            <Link to="/admin/books" className="flex items-center gap-2">
              <FaBookOpen /> Books
            </Link>
          </li>

          <li>
            <Link to="/admin/users" className="flex items-center gap-2">
              <FaUsers /> Users
            </Link>
          </li>

          <li>
             <Link to="/admin/orders" className="flex items-center gap-2">
              <FaBoxOpen /> Orders
            </Link> 
          </li> 

          <li>
            <Link to="/admin/messages" className="flex items-center gap-2">
              <FaEnvelope /> Messages
            </Link>
          </li>

          {/* ✅ BLOG */}
          <li>
            <Link to="/admin/blog" className="flex items-center gap-2">
              <FaBlog /> Blog
            </Link>
          </li>

        </ul>
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </div>

    </div>
  );
};

export default AdminLayout;