import { createBrowserRouter } from "react-router-dom";

// ✅ IMPORT YOUR PAGES
import Home from "./pages/Home";

// ===============================
// ✅ PAYMENT SUCCESS PAGE
// ===============================
const PaymentSuccess = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>✅ Payment Successful</h1>
      <p>Your order has been completed 🎉</p>
    </div>
  );
};

// ===============================
// ❌ PAYMENT FAIL PAGE (OPTIONAL)
// ===============================
const PaymentFail = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>❌ Payment Failed</h1>
      <p>Please try again.</p>
    </div>
  );
};

// ===============================
// 🚫 PAYMENT CANCEL PAGE (OPTIONAL)
// ===============================
const PaymentCancel = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🚫 Payment Cancelled</h1>
    </div>
  );
};

// ===============================
// 🔥 ROUTER CONFIG
// ===============================
const Router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },

  // ✅ SUCCESS ROUTE
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
  },

  // ❌ FAIL ROUTE
  {
    path: "/payment-fail",
    element: <PaymentFail />,
  },

  // 🚫 CANCEL ROUTE
  {
    path: "/payment-cancel",
    element: <PaymentCancel />,
  },
]);

export default Router;