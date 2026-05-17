// 📁 PaymentModal.jsx

import { useState } from "react";
import BkashPayment from "../pages/BkashPayment";
import NagadPayment from "../pages/NagadPayment";

const PaymentModal = ({ onClose }) => {

  // 🔥 which method selected
  const [method, setMethod] = useState("bkash");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">

      <div className="bg-white w-[350px] rounded-xl p-4">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2>Select Payment</h2>
          <button onClick={onClose}>❌</button>
        </div>

        {/* ================= PAYMENT OPTIONS ================= */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          <div
            onClick={() => setMethod("bkash")}
            className={`p-3 border cursor-pointer ${
              method === "bkash" ? "border-green-500" : ""
            }`}
          >
            bKash
          </div>

          <div
            onClick={() => setMethod("nagad")}
            className={`p-3 border cursor-pointer ${
              method === "nagad" ? "border-green-500" : ""
            }`}
          >
            Nagad
          </div>

        </div>

        {/* ================= SHOW UI ================= */}
        {method === "bkash" && <BkashPayment />}
        {method === "nagad" && <NagadPayment />}

      </div>
    </div>
  );
};

export default PaymentModal;