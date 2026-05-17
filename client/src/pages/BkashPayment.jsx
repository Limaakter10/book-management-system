// 📁 BkashPayment.jsx

import { useState } from "react";
import axios from "axios";

const BkashPayment = () => {

  // 🔥 step control (1 → phone, 2 → otp, 3 → pin, 4 → success, 5 → fail)
  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= STEP 1 =================
  const sendOtp = async () => {
    try {
      setLoading(true);

      await axios.post("http://localhost:3000/api/payment/send-otp", { phone });

      setStep(2);
    } catch (err) {
      alert("OTP send failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 2 =================
  const verifyOtp = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/api/payment/verify-otp",
        { otp }
      );

      if (res.data.success) {
        setStep(3);
      } else {
        alert("Wrong OTP ❌");
      }
    } catch (err) {
      alert("OTP verification error ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 3 =================
  const pay = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/api/payment/pay",
        { pin }
      );

      if (res.data.success) {
        setStep(4);
      } else {
        setStep(5);
      }
    } catch (err) {
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "50px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      textAlign: "center"
    }}>

      <h2>bKash Payment</h2>

      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <>
          <input
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <button onClick={sendOtp} disabled={loading}>
            {loading ? "Sending..." : "Continue"}
          </button>
        </>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <button onClick={verifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </>
      )}

      {/* ================= STEP 3 ================= */}
      {step === 3 && (
        <>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <button onClick={pay} disabled={loading}>
            {loading ? "Processing..." : "Pay"}
          </button>
        </>
      )}

      {/* ================= SUCCESS ================= */}
      {step === 4 && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ Payment Successful
        </p>
      )}

      {/* ================= FAILED ================= */}
      {step === 5 && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ❌ Payment Failed
        </p>
      )}

    </div>
  );
};

export default BkashPayment;