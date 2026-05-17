// 📁 NagadPayment.jsx

import { useState } from "react";
import axios from "axios";

// ✅ Professional Icons
import {
  HiPhone,
  HiShieldCheck,
  HiLockClosed,
  HiCheckCircle,
  HiXCircle
} from "react-icons/hi";

// 🔥 IMPORTANT: use live backend (NOT localhost in production)
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const NagadPayment = () => {

  // ================= STEP CONTROL =================
  // 1 = phone, 2 = OTP, 3 = PIN, 4 = success, 5 = fail
  const [step, setStep] = useState(1);

  // ================= INPUT STATE =================
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");

  // ================= STEP 1: SEND OTP =================
  const sendOtp = async () => {
    try {
      await axios.post(`${BASE_URL}/api/payment/send-otp`, { phone });

      setStep(2); // 👉 move to OTP screen

    } catch (err) {
      console.error("OTP ERROR:", err);
    }
  };

  // ================= STEP 2: VERIFY OTP =================
  const verifyOtp = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/payment/verify-otp`,
        { otp }
      );

      if (res.data.success) {
        setStep(3); // 👉 go to PIN step
      } else {
        alert("❌ Wrong OTP");
      }

    } catch (err) {
      console.error(err);
    }
  };

  // ================= STEP 3: PAY =================
  const pay = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/payment/pay`,
        { pin }
      );

      if (res.data.success) {
        setStep(4); // ✅ success
      } else {
        setStep(5); // ❌ fail
      }

    } catch (err) {
      setStep(5);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-black max-w-sm mx-auto">

      {/* ================= TITLE ================= */}
      <h3 className="text-red-500 mb-4 font-bold text-lg text-center">
        Nagad Payment
      </h3>

      {/* ================= STEP 1: PHONE ================= */}
      {step === 1 && (
        <>
          <div className="flex items-center border rounded mb-3 px-2">
            <HiPhone className="text-gray-400" />
            <input
              placeholder="01XXXXXXXXX"
              className="p-2 w-full outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            onClick={sendOtp}
            className="bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded transition"
          >
            Continue
          </button>
        </>
      )}

      {/* ================= STEP 2: OTP ================= */}
      {step === 2 && (
        <>
          <p className="mb-2 text-sm text-gray-600">
            Enter OTP sent to {phone}
          </p>

          <div className="flex items-center border rounded mb-3 px-2">
            <HiShieldCheck className="text-gray-400" />
            <input
              placeholder="OTP"
              className="p-2 w-full outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            onClick={verifyOtp}
            className="bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded transition"
          >
            Verify
          </button>
        </>
      )}

      {/* ================= STEP 3: PIN ================= */}
      {step === 3 && (
        <>
          <p className="mb-2 text-sm text-gray-600">
            Enter your PIN
          </p>

          <div className="flex items-center border rounded mb-3 px-2">
            <HiLockClosed className="text-gray-400" />
            <input
              type="password"
              placeholder="PIN"
              className="p-2 w-full outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button
            onClick={pay}
            className="bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded transition"
          >
            Pay
          </button>
        </>
      )}

      {/* ================= SUCCESS ================= */}
      {step === 4 && (
        <div className="text-green-600 text-center flex flex-col items-center gap-2">
          <HiCheckCircle className="text-4xl" />
          <p>Payment Successful 🎉</p>
        </div>
      )}

      {/* ================= FAILED ================= */}
      {step === 5 && (
        <div className="text-red-600 text-center flex flex-col items-center gap-2">
          <HiXCircle className="text-4xl" />
          <p>Payment Failed ❌</p>
        </div>
      )}

    </div>
  );
};

export default NagadPayment;