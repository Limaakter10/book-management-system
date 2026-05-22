import { createBrowserRouter } from "react-router-dom";

// ── Pages ─────────────────────────────────────────────────────
import Home             from "./pages/home/Home";
import Shop             from "./pages/shop/Shop";
import BookDetails      from "./pages/BookDetails";
import Cart             from "./pages/Cart";
import Checkout         from "./pages/Checkout";
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import MyLibrary        from "./pages/MyLibrary";
import UserDashboard    from "./pages/UserDashboard";
import UserMessages     from "./pages/UserMessages";
import Reader           from "./pages/Reader";
import Recommendation   from "./pages/Recommendation";
import About            from "./pages/About";
import Contact          from "./pages/Contact";
import Help             from "./pages/Help";
import RefundPolicy     from "./pages/RefundPolicy";
import Blog             from "./pages/blog/Blog";
import BlogDetails      from "./pages/blog/BlogDetails";
import BkashPayment     from "./pages/BkashPayment";
import NagadPayment     from "./pages/NagadPayment";
import PaymentMethod    from "./pages/PaymentMethod";
import PaymentSuccess   from "./pages/PaymentSuccess";

// ── Admin Pages ───────────────────────────────────────────────
import AdminLayout      from "./pages/admin/AdminLayout";
import AdminDashboard   from "./pages/admin/AdminDashboard";
import AdminBooks       from "./pages/admin/AdminBooks";
import AdminUsers       from "./pages/admin/AdminUsers";
import Orders           from "./pages/admin/Orders";
import AdminMessages    from "./pages/admin/AdminMessages";
import AdminBlog        from "./pages/admin/AdminBlog";
import AdminFeatured    from "./pages/admin/AdminFeatured";

// ── Route Guard ───────────────────────────────────────────────
import AdminRoute       from "./routes/AdminRoute";

// ── Simple payment result pages ───────────────────────────────
const PaymentFail = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>
    <h1>❌ Payment Failed</h1>
    <p>Please try again.</p>
  </div>
);

const PaymentCancel = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>
    <h1>🚫 Payment Cancelled</h1>
  </div>
);

// ── Router config ──────────────────────────────────────────────
const Router = createBrowserRouter([
  // ── Public routes ──
  { path: "/",                  element: <Home /> },
  { path: "/shop",              element: <Shop /> },
  { path: "/book-details/:id",  element: <BookDetails /> },
  { path: "/cart",              element: <Cart /> },
  { path: "/checkout",          element: <Checkout /> },
  { path: "/login",             element: <Login /> },
  { path: "/register",          element: <Register /> },
  { path: "/about",             element: <About /> },
  { path: "/contact",           element: <Contact /> },
  { path: "/help",              element: <Help /> },
  { path: "/refund-policy",     element: <RefundPolicy /> },
  { path: "/blog",              element: <Blog /> },
  { path: "/blog/:id",          element: <BlogDetails /> },
  { path: "/recommendation",    element: <Recommendation /> },

  // ── Auth required routes ──
  { path: "/my-library",        element: <MyLibrary /> },
  { path: "/user-dashboard",    element: <UserDashboard /> },
  { path: "/user-messages",     element: <UserMessages /> },
  { path: "/reader/:id",        element: <Reader /> },

  // ── Payment routes ──
  { path: "/payment-method",    element: <PaymentMethod /> },
  { path: "/bkash-payment",     element: <BkashPayment /> },
  { path: "/nagad-payment",     element: <NagadPayment /> },
  { path: "/payment-success",   element: <PaymentSuccess /> },
  { path: "/payment-fail",      element: <PaymentFail /> },
  { path: "/payment-cancel",    element: <PaymentCancel /> },

  // ── Admin routes ──
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true,              element: <AdminDashboard /> },
      { path: "books",            element: <AdminBooks /> },
      { path: "users",            element: <AdminUsers /> },
      { path: "orders",           element: <Orders /> },
      { path: "messages",         element: <AdminMessages /> },
      { path: "blog",             element: <AdminBlog /> },
      { path: "featured",         element: <AdminFeatured /> },
    ],
  },
]);

export default Router;