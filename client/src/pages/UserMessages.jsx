import { useEffect, useState } from "react";
import api from "../api/axios";

const UserMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api.get("/api/messages")
      .then(res => setMessages(res.data));
  }, []);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>

          <p>{msg.message}</p>

          <p>
            {msg.isResolved ? "Solved" : "Pending"}
          </p>

          {/* 🔥 reply show */}
          {msg.reply && (
            <p style={{ color: "green" }}>
              Admin Reply: {msg.reply}
            </p>
          )}

        </div>
      ))}
    </div>
  );
};

export default UserMessages;