import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// ── Layout ────────────────────────────────────────────────────
import App from "./App";

// ── Pages ─────────────────────────────────────────────────────
import Home           from "./pages/home/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Cart           from "./pages/Cart";
import Shop           from "./pages/shop/Shop";
import MyLibrary      from "./pages/MyLibrary";
import About          from "./pages/About";
import BookDetails    from "./pages/BookDetails";
import Checkout       from "./pages/Checkout";
import Recommendation from "./pages/Recommendation";
import Reader         from "./pages/Reader";
import UserMessages   from "./pages/UserMessages";
import UserDashboard  from "./pages/UserDashboard";
import RefundPolicy   from "./pages/RefundPolicy";
import PaymentSuccess from "./pages/PaymentSuccess";
import Blog           from "./pages/blog/Blog";
import BlogDetails    from "./pages/blog/BlogDetails";
import Help           from "./pages/Help";
import Contact        from "./pages/Contact";

// ── Admin Pages ───────────────────────────────────────────────
import Orders          from "./pages/admin/Orders";
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminLayout     from "./pages/admin/AdminLayout";
import AdminBooks      from "./pages/admin/AdminBooks";
import AdminUsers      from "./pages/admin/AdminUsers";
import AdminMessages   from "./pages/admin/AdminMessages";
import AdminBlog       from "./pages/admin/AdminBlog";
import AdminFeatured   from "./pages/admin/AdminFeatured";

// ── Route Guards ──────────────────────────────────────────────
import ProtectedRoute from "./component/ProtectedRoute";
import AdminRoute     from "./routes/AdminRoute";

// ── Context ───────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// ── Payment result pages ──────────────────────────────────────
const PaymentFail   = () => <div style={{padding:40,textAlign:"center"}}><h1>❌ Payment Failed</h1><p>Please try again.</p></div>;
const PaymentCancel = () => <div style={{padding:40,textAlign:"center"}}><h1>🚫 Payment Cancelled</h1></div>;

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public pages
      { path: "/",                element: <Home /> },
      { path: "/shop",            element: <Shop /> },
      { path: "/login",           element: <Login /> },
      { path: "/register",        element: <Register /> },

      // ✅ দুটো route — পুরনো /book/:id এবং নতুন /book-details/:id
      // HomeSection ও Shop উভয়ই /book-details/:id তে navigate করে
      { path: "/book/:id",        element: <BookDetails /> },
      { path: "/book-details/:id", element: <BookDetails /> },

      { path: "/reader/:id",      element: <Reader /> },
      { path: "/checkout",        element: <Checkout /> },
      { path: "/blog",            element: <Blog /> },
      { path: "/blog/:id",        element: <BlogDetails /> },
      { path: "/help",            element: <Help /> },
      { path: "/contact",         element: <Contact /> },
      { path: "/recommendation",  element: <Recommendation /> },
      { path: "/refund-policy",   element: <RefundPolicy /> },
      { path: "/about",           element: <About /> },
      { path: "/my-messages",     element: <UserMessages /> },

      // Payment pages
      { path: "/payment-success", element: <PaymentSuccess /> },
      { path: "/payment-fail",    element: <PaymentFail /> },
      { path: "/payment-cancel",  element: <PaymentCancel /> },

      // Protected pages
      { path: "/cart",            element: <ProtectedRoute><Cart /></ProtectedRoute> },
      { path: "/library",         element: <ProtectedRoute><MyLibrary /></ProtectedRoute> },
      { path: "/my-library",      element: <ProtectedRoute><MyLibrary /></ProtectedRoute> },
      { path: "/dashboard",       element: <ProtectedRoute><UserDashboard /></ProtectedRoute> },
      { path: "/user-dashboard",  element: <ProtectedRoute><UserDashboard /></ProtectedRoute> },

      // Admin pages
      {
        path: "/admin",
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        children: [
          { index: true,      element: <AdminDashboard /> },
          { path: "books",    element: <AdminBooks /> },
          { path: "users",    element: <AdminUsers /> },
          { path: "orders",   element: <Orders /> },
          { path: "blog",     element: <AdminBlog /> },
          { path: "messages", element: <AdminMessages /> },
          { path: "featured", element: <AdminFeatured /> },
        ],
      },
    ],
  },
]);

// ── Render ────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);