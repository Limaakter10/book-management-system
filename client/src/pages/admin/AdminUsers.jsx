import { useEffect, useState } from "react";
import api from "../../api/axios"; // FIX
import { FaUsers, FaBookOpen } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/all"); //  FIX
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH USER LIBRARY =================
  const viewLibrary = async (userId) => {
    try {
      const res = await api.get(`/api/users/library/${userId}`); //  FIX
      setSelectedLibrary(res.data);
      setActiveUser(userId);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>

      <h2 className="text-xl mb-4 flex items-center gap-2">
        <FaUsers /> Users
      </h2>

      {users.map((u) => (
        <div key={u._id} className="bg-white p-3 mb-2 shadow">

          {/* EMAIL */}
          <p><b>Email:</b> {u.email}</p>

          {/* VIEW LIBRARY */}
          <button
            onClick={() => viewLibrary(u._id)}
            className="bg-blue-500 text-white px-2 mt-2 flex items-center gap-1"
          >
            <FaBookOpen /> View Library
          </button>

          {/* SHOW LIBRARY */}
          {activeUser === u._id && (
            <div className="mt-2 p-2 border">

              {selectedLibrary.length === 0 ? (
                <p>No books</p>
              ) : (
                selectedLibrary.map((book) => (
                  <p key={book._id} className="flex items-center gap-1">
                    <FaBookOpen /> {book.title}
                  </p>
                ))
              )}

            </div>
          )}

        </div>
      ))}

    </div>
  );
};

export default AdminUsers;