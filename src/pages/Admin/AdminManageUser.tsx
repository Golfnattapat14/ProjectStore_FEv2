import React, { useState, useEffect, type ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UpdateUserRequest, UserResponse } from "@/types/adminDashborad";
import { updateUser, getUserById } from "@/api/Admin";
import { toast } from "react-toastify";

const AdminManageUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<Partial<UpdateUserRequest>>({
    username: "",
    role: "",
    isDeleted: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error("ไม่พบรหัสผู้ใช้");
      return;
    }

    setLoading(true);
    getUserById(id)
      .then((data: UserResponse) => {
        setUser({
          username: data.username,
          role: data.role,
          isDeleted: data.isDeleted ?? false,
        });
      })
      .catch((err) => toast.error(err.message || "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name } = target;

    if (target instanceof HTMLInputElement) {
      const { type, checked, value } = target;
      setUser((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else if (target instanceof HTMLSelectElement) {
      setUser((prev) => ({
        ...prev,
        [name]: target.value,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    if (!user.username || !user.role) {
      toast.error("กรุณากรอกชื่อผู้ใช้และบทบาทให้ครบ");
      return;
    }

    try {
      setSaving(true);
      toast.loading("กำลังบันทึก...");
      await updateUser(id, {
        username: user.username ?? "",
        role: user.role ?? "",
        isDeleted: user.isDeleted ?? false,
      });
      toast.dismiss(); // ปิด toast loading
      toast.success("บันทึกเรียบร้อยแล้ว");
      setTimeout(() => navigate("/adminManage"), 1500);
    } catch {
      toast.dismiss();
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        กำลังโหลดข้อมูลผู้ใช้...
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
        แก้ไขข้อมูลผู้ใช้
      </h2>

      <form
        onSubmit={handleSave}
        className="space-y-5"
        noValidate
        autoComplete="off"
      >
        <div>
          <label
            htmlFor="username"
            className="block text-gray-700 font-medium mb-1"
          >
            ชื่อผู้ใช้
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username ?? ""}
            onChange={handleChange}
            disabled={saving}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            บทบาท (Role)
          </label>
          <select
            id="role"
            name="role"
            value={user.role ?? ""}
            onChange={handleChange}
            disabled={saving}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- เลือกบทบาท --</option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium">
            {!user.isDeleted ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}
          </span>

          <button
            type="button"
            onClick={() =>
              setUser((prev) => ({
                ...prev,
                isDeleted: !prev.isDeleted,
              }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              !user.isDeleted ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                !user.isDeleted ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/adminManage")}
            disabled={saving}
            className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminManageUser;
