import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { auth } from "../../../firebase/firebase_config";
import {
  Edit,
  Save,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// 날짜 포맷팅 함수
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = date.toDate(); // Firestore Timestamp를 Date 객체로 변환
  }
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const db = getFirestore();

  // 데이터 로드
  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        editable: false,
        ...doc.data(),
      }));
      setUsers(userData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 정렬 핸들러
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // 정렬된 데이터
  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // 필드 업데이트
  const handleUpdate = async (userId, field, value) => {
    try {
      await updateDoc(doc(db, "users", userId), { [field]: value });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, [field]: value } : user
        )
      );
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // 패스워드 변경
  const handlePasswordChange = async (userId, newPassword) => {
    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      await updateDoc(doc(db, "users", userId), { password: newPassword });
    } catch (error) {
      console.error("Password update failed:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={loadUsers}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Email",
                "Role",
                "Password",
                "Created",
                "Updated",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    {header}
                    {["Created", "Updated"].includes(header) && (
                      <button
                        onClick={() => handleSort(header.toLowerCase() + "At")}
                        className="ml-2"
                      >
                        {sortConfig.key === header.toLowerCase() + "At" ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )
                        ) : (
                          <ChevronUp size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.editable ? (
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) =>
                        setUsers(
                          users.map((u) =>
                            u.id === user.id
                              ? { ...u, email: e.target.value }
                              : u
                          )
                        )
                      }
                      className="border rounded p-1"
                    />
                  ) : (
                    user.email
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {user.editable ? (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        setUsers(
                          users.map((u) =>
                            u.id === user.id
                              ? { ...u, role: e.target.value }
                              : u
                          )
                        )
                      }
                      className="border rounded p-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {user.editable ? (
                    <input
                      type="password"
                      value={user.password}
                      onChange={(e) =>
                        setUsers(
                          users.map((u) =>
                            u.id === user.id
                              ? { ...u, password: e.target.value }
                              : u
                          )
                        )
                      }
                      className="border rounded p-1"
                    />
                  ) : (
                    "••••••••"
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(user.createdAt)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(user.updatedAt)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (user.editable) {
                          handleUpdate(user.id, "email", user.email);
                          handleUpdate(user.id, "role", user.role);
                          handlePasswordChange(user.id, user.password);
                        }
                        setUsers(
                          users.map((u) =>
                            u.id === user.id
                              ? { ...u, editable: !u.editable }
                              : u
                          )
                        );
                      }}
                      className="p-1 hover:text-blue-600"
                    >
                      {user.editable ? <Save size={18} /> : <Edit size={18} />}
                    </button>
                    <button className="p-1 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
