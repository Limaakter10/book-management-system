import { useEffect, useState } from "react";
import api from "../../api/axios"; // ✅ FIX
import {
  FaBoxOpen,
  FaUser,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  // ================= FETCH =================
  useEffect(() => {
    api.get("/api/orders/all") // ✅ FIX
      .then(res => {
        setOrders(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>

      <h2 className="text-2xl mb-4 flex items-center gap-2">
        <FaBoxOpen /> Orders
      </h2>

      {orders.map(order => (
        <div key={order._id} className="bg-white p-4 mb-3 shadow rounded">

          <p className="flex items-center gap-2">
            <FaUser /> <b>User:</b> {order.userId}
          </p>

          <p className="flex items-center gap-2">
            <FaMoneyBillWave /> <b>Amount:</b> ৳ {order.amount}
          </p>

          <p className="flex items-center gap-2">
            <FaCreditCard /> <b>Method:</b> {order.method}
          </p>

          <p className="flex items-center gap-2">
            <b>Status:</b>
            <span className={`flex items-center gap-1 ${
              order.status === "approved"
                ? "text-green-600"
                : "text-yellow-600"
            }`}>
              {order.status === "approved" ? (
                <>
                  <FaCheckCircle /> Approved
                </>
              ) : (
                <>
                  <FaClock /> Pending
                </>
              )}
            </span>
          </p>

        </div>
      ))}

    </div>
  );
};

export default Orders;