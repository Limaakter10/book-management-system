import { useState } from "react";
import BkashPayment from "./BkashPayment";
import NagadPayment from "./NagadPayment";

// ✅ Professional Icons
import {
  HiCreditCard,
  HiDeviceMobile,
  HiCheckCircle
} from "react-icons/hi";

const PaymentMethod = () => {

  // ================= STATE =================
  const [method, setMethod] = useState("bkash"); // default bkash

  return (
    <div className="p-6 bg-black min-h-screen text-white">

      {/* ================= TITLE ================= */}
      <h2 className="text-2xl mb-6 font-semibold text-center">
        পেমেন্ট মেথড বেছে নিন 💳
      </h2>

      {/* ================= METHOD GRID ================= */}
      <div className="grid grid-cols-2 gap-4">

        {/* ================= BKASH ================= */}
        <div
          onClick={() => setMethod("bkash")}
          className={`p-4 rounded-lg cursor-pointer flex items-center gap-2 transition ${
            method === "bkash"
              ? "border-2 border-green-500 bg-gray-900"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <HiDeviceMobile />
          bKash
          {method === "bkash" && <HiCheckCircle className="ml-auto text-green-400" />}
        </div>

        {/* ================= NAGAD ================= */}
        <div
          onClick={() => setMethod("nagad")}
          className={`p-4 rounded-lg cursor-pointer flex items-center gap-2 transition ${
            method === "nagad"
              ? "border-2 border-green-500 bg-gray-900"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <HiDeviceMobile />
          Nagad
          {method === "nagad" && <HiCheckCircle className="ml-auto text-green-400" />}
        </div>

        {/* ================= GOOGLE PAY ================= */}
        <div className="p-4 bg-gray-800 rounded-lg flex items-center gap-2 opacity-60 cursor-not-allowed">
          <HiCreditCard />
          Google Pay (Coming Soon)
        </div>

        {/* ================= CARD ================= */}
        <div className="p-4 bg-gray-800 rounded-lg flex items-center gap-2 opacity-60 cursor-not-allowed">
          <HiCreditCard />
          Card (Coming Soon)
        </div>

      </div>

      {/* ================= PAYMENT SECTION ================= */}
      <div className="mt-6">

        {/* 👉 show selected payment UI */}
        {method === "bkash" && <BkashPayment />}
        {method === "nagad" && <NagadPayment />}

      </div>

    </div>
  );
};

export default PaymentMethod;