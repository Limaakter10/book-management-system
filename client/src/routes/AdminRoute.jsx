import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {

  // ================= GET ROLE =================
  const role = localStorage.getItem("role");

  // ================= AUTH CHECK =================
  // ❌ যদি admin না হয় → redirect home
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  //  admin হলে access allow
  return children;
};

export default AdminRoute;