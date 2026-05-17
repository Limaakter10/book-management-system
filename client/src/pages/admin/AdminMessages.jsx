import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaEnvelope, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);

  // FETCH
  useEffect(() => {
    api.get("/api/messages")
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, []);

  // ✅ FIXED (API CALL ADDED)
  const handleResolve = async (id) => {
    try {
      await api.put(`/api/messages/${id}/resolve`);

      setMessages(prev =>
        prev.map(msg =>
          msg._id === id ? { ...msg, isResolved: true } : msg
        )
      );

    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaEnvelope /> User Messages
      </h1>

      {messages.map(msg => (
        <div key={msg._id} className="bg-white p-4 shadow rounded mb-4">

          <h3 className="font-semibold">{msg.name}</h3>
          <p className="text-sm text-gray-500">{msg.email}</p>

          <p className="mt-2">{msg.message}</p>

          <p className="text-xs text-gray-400 mt-2">
            {new Date(msg.createdAt).toDateString()}
          </p>

          {/* STATUS */}
          <div className="mt-3 flex justify-between items-center">

            <span className={`flex items-center gap-1 font-semibold ${
              msg.isResolved ? "text-green-600" : "text-red-500"
            }`}>
              {msg.isResolved ? (
                <>
                  <FaCheckCircle /> Solved
                </>
              ) : (
                <>
                  <FaTimesCircle /> Pending
                </>
              )}
            </span>

            {/* CLICK */}
            {!msg.isResolved && (
              <FaCheckCircle
                onClick={() => handleResolve(msg._id)}
                className="cursor-pointer text-green-600 text-xl"
              />
            )}

          </div>

        </div>
      ))}

    </div>
  );
};

export default AdminMessages;