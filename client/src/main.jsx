// ================= IMPORT =================
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

// 🔥 MAIN LAYOUT
import App from "./App";

// 🔥 PAGES
import Home from "./pages/home/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Shop from "./pages/shop/Shop";
import MyLibrary from "./pages/MyLibrary";
import About from "./pages/About";
import BookDetails from "./pages/BookDetails";
import Checkout from "./pages/Checkout";
import Recommendation from "./pages/Recommendation";
import Reader from "./pages/Reader";
import UserMessages from "./pages/UserMessages";
// refund

import RefundPolicy from "./pages/RefundPolicy";

// ✅ PAYMENT (ONLY IMPORT — NO DUPLICATE)
import PaymentSuccess from "./pages/PaymentSuccess";

// 🔥 BLOG
import Blog from "./pages/blog/Blog";
import BlogDetails from "./pages/blog/BlogDetails";

// 🔥 HELP & CONTACT
import Help from "./pages/Help";
import Contact from "./pages/Contact";

// 🔥 ADMIN
import Orders from "./pages/admin/Orders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminBlog from "./pages/admin/AdminBlog";

// 🔥 ROUTE PROTECTION
import ProtectedRoute from "./component/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// 🔥 CONTEXT
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// ================= PAYMENT EXTRA =================
const PaymentFail = () => (
  <div className="p-10 text-center">
    <h1>❌ Payment Failed</h1>
  </div>
);

const PaymentCancel = () => (
  <div className="p-10 text-center">
    <h1>🚫 Payment Cancelled</h1>
  </div>
);

// ================= ROUTER =================
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 🏠 HOME
      { path: "/", element: <Home /> },

      // 🛒 SHOP
      { path: "/shop", element: <Shop /> },

      // 🔐 AUTH
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      // 📚 BOOK
      { path: "/book/:id", element: <BookDetails /> },
      { path: "/reader/:id", element: <Reader /> },

      // 📦 CHECKOUT
      { path: "/checkout", element: <Checkout /> },

      // 📝 BLOG
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:id", element: <BlogDetails /> },

      // 🆘 HELP
      { path: "/help", element: <Help /> },

      // 📞 CONTACT
      { path: "/contact", element: <Contact /> },

      // 🎯 RECOMMENDATION
      { path: "/recommendation", element: <Recommendation /> },

      // refund
      { path: "/refund-policy", element: <RefundPolicy /> },

      // 💳 PAYMENT ✅
      { path: "/payment-success", element: <PaymentSuccess /> },
      { path: "/payment-fail", element: <PaymentFail /> },
      { path: "/payment-cancel", element: <PaymentCancel /> },

      // 🔒 CART
      {
        path: "/cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },

      // message
        { path: "/my-messages", element: <UserMessages /> },

      // 🔒 LIBRARY
      {
        path: "/library",
        element: (
          <ProtectedRoute>
            <MyLibrary />
          </ProtectedRoute>
        ),
      },

      // ℹ️ ABOUT
      { path: "/about", element: <About /> },

      // 👑 ADMIN
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "books", element: <AdminBooks /> },
          { path: "users", element: <AdminUsers /> },
          { path: "orders", element: <Orders /> },
          { path: "blog", element: <AdminBlog /> },
          { path: "messages", element: <AdminMessages /> },
        ],
      },
    ],
  },
]);

// ================= RENDER =================
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);