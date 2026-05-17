import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ================= STEP 1: CLEAR CART =================
    // 🔥 payment complete → cart empty
    localStorage.removeItem("cart");

    // ================= STEP 2: TRIGGER LIBRARY REFRESH =================
    // 🔥 MyLibrary page detect করবে
    localStorage.setItem("refreshLibrary", "true");

    // ================= STEP 3: SMALL DELAY (UX) =================
    const timer = setTimeout(() => {

      // ================= STEP 4: FULL RELOAD =================
      // 🔥 MOST IMPORTANT → ensures fresh data from backend
      window.location.href = "/library";

      // ❌ old way (not reliable)
      // navigate("/library");

    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      
      {/* SUCCESS MESSAGE */}
      <h1 className="text-3xl font-bold text-green-600">
        ✅ Payment Successful
      </h1>

      <p className="mt-2 text-gray-600">
        Your books are now added to your library 📚
      </p>

      <p className="text-sm text-gray-400 mt-2">
        Updating your library...
      </p>

    </div>
  );
};

export default PaymentSuccess;