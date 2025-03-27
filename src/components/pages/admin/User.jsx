import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase_config";
import { Edit, Save, Plus, Trash2 } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "user"));
      const userData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async () => {
    try {
      const docRef = doc(db, "user", editingUser.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, editingUser);
        console.log("Document updated successfully");
      } else {
        console.log("No document found with the given ID");
      }
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const newUser = {
        email: "새사용자@example.com",
        role: "user",
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "user"), newUser);
      loadUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => deleteDoc(doc(db, "user", userId)))
      );
      console.log("Selected users deleted successfully");
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div>
          <button
            onClick={handleAddUser}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            <Plus size={18} className="inline mr-2" />
            Add User
          </button>
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            disabled={selectedUsers.length === 0}
          >
            <Trash2 size={18} className="inline mr-2" />
            Delete Selected
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser && editingUser.id === user.id ? (
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      className="border rounded p-1"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser && editingUser.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, role: e.target.value })
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
                  {user.createdAt?.toDate().toLocaleString() ??
                    "날짜 정보 없음"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser && editingUser.id === user.id ? (
                    <button
                      onClick={handleSaveEdit}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Save size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
