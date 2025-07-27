import React, { useState, useEffect } from "react";
import { getUsers, updateUser, deleteUser } from "@/api/Admin";
import { User, UpdateUserRequest } from "@/types/adminDashborad";
import { useNavigate } from "react-router-dom";

const AdminManage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingUsers(true);
    getUsers()
      .then((data) => {
        setUsers(data);
        setErrorUsers("");
      })
      .catch((err) => setErrorUsers(err.message || "โหลดผู้ใช้ล้มเหลว"))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleToggleActive = async (user: User) => {
    const updated: UpdateUserRequest = {
      username: user.username,
      role: user.role,
      isDeleted: !user.isDeleted,
    };
    try {
      await updateUser(user.id, updated);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isDeleted: !u.isDeleted } : u
        )
      );
    } catch (error) {
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleDeleteUsers = async (id: string) => {
    const confirmDelete = window.confirm("คุณแน่ใจว่าจะลบผู้ใช้นี้ออกจากระบบ?");
    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  if (loadingUsers)
    return (
      <p className="text-center text-gray-500">กำลังโหลดข้อมูลผู้ใช้...</p>
    );
  if (errorUsers)
    return <p className="text-red-500 text-center">{errorUsers}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
        ข้อมูลของ USER
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-4 text-left">ลำดับ</th>
              <th className="py-3 px-4 text-left">ชื่อผู้ใช้</th>
              <th className="py-3 px-4 text-left">บทบาท</th>
              <th className="py-3 px-4 text-left">สถานะ</th>
              <th className="py-3 px-4 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-medium">
            {users.map((u, i) => (
              <tr
                key={u.id}
                className={`border-b border-gray-200 ${
                  !u.isDeleted ? "bg-gray-100 opacity-60" : "bg-white"
                }`}
              >
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4 capitalize">{u.role}</td>
                <td className="py-2 px-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!u.isDeleted}
                      onChange={() => handleToggleActive(u)}
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 relative transition">
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5" />
                    </div>
                    <span
                      className={`ml-3 font-semibold ${
                        !u.isDeleted ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {!u.isDeleted ? "Disabled" : "Enabled"}
                    </span>
                  </label>
                </td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => navigate(`/adminManageUser/${u.id}`)}
                  >
                    แก้ไข
                  </button>

                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDeleteUsers(u.id)}
                  >
                    ลบผู้ใช้นี้
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManage;
