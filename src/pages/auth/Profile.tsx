import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePassword, getCurrentUser, updateProfile } from "@/api/User";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

const Profile: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [changingPass, setChangingPass] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const storedRole = useMemo(() => (localStorage.getItem("role") || "").toLowerCase(), []);

  const canEditUsername = useMemo(() => {
    if (storedRole === "admin") return true;
    if (storedRole === "seller") return false; // ดูอย่างเดียว
    if (storedRole === "buyer") return false; // เงื่อนไขขอให้แก้ได้เฉพาะรหัสผ่าน
    return false;
  }, [storedRole]);

  const canEditPayment = useMemo(() => {
    return storedRole === "admin" || storedRole === "seller";
  }, [storedRole]);

  const canChangePassword = useMemo(() => {
    return storedRole === "admin" || storedRole === "seller" || storedRole === "buyer";
  }, [storedRole]);

  useEffect(() => {
    setLoading(true);
    getCurrentUser()
      .then((u) => {
        setUsername(u.username);
        setRole(u.role);
        setFullName((u as any).fullName ?? (u as any).FullName ?? "");
        setPhoneNumber((u as any).PhoneNumber ?? (u as any).phoneNumber ?? (u as any).phone ?? "");
      })
      .catch((e) => toast.error(e.message || "โหลดโปรไฟล์ล้มเหลว"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate ข้อมูลการชำระเงิน
    const isValidThaiPhone = (value: string) => /^0\d{9}$/.test(value);
    if (canEditPayment) {
      // บังคับผู้ขายต้องกรอกครบ และรูปแบบถูกต้อง
      if (storedRole === "seller") {
        if (!fullName || !phoneNumber) {
          toast.error("กรุณากรอกชื่อจริงและเบอร์โทรให้ครบก่อนบันทึก");
          return;
        }
      }
      if (phoneNumber && !isValidThaiPhone(phoneNumber)) {
        toast.error("กรุณากรอกเบอร์โทร 10 หลักขึ้นต้นด้วย 0 (เช่น 0812345678)");
        return;
      }
    }
    // ยืนยันก่อนบันทึก
    const preview: string[] = [];
    if (canEditUsername) preview.push(`- Username: ${username}`);
    if (canEditPayment) {
      preview.push(`- ชื่อจริงตามธนาคาร: ${fullName || "(ว่าง)"}`);
      preview.push(`- PhoneNumber: ${phoneNumber || "(ว่าง)"}`);
    }
    const confirmSave = window.confirm(
      `ยืนยันบันทึกการแก้ไขโปรไฟล์หรือไม่?\n\nรายการที่จะบันทึก:\n${preview.join("\n")}`
    );
    if (!confirmSave) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (canEditUsername) payload.username = username;
      if (canEditPayment) {
        (payload as any).fullName = fullName;
        (payload as any).PhoneNumber = phoneNumber;
      }
      const updated = await updateProfile(payload);
      setUsername(updated.username);
      setFullName((updated as any).fullName ?? (updated as any).FullName ?? "");
      setPhoneNumber((updated as any).PhoneNumber ?? (updated as any).phoneNumber ?? (updated as any).phone ?? "");
      if (canEditUsername) localStorage.setItem("username", updated.username);
      toast.success("บันทึกโปรไฟล์สำเร็จ");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "บันทึกโปรไฟล์ล้มเหลว");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !currentPassword) {
      toast.error("กรอกรหัสผ่านให้ครบ");
      return;
    }
    // ยืนยันก่อนเปลี่ยนรหัสผ่าน (ไม่แสดงรหัสผ่าน)
    const confirmChange = window.confirm("ยืนยันการเปลี่ยนรหัสผ่านใช่ไหม?");
    if (!confirmChange) return;
    setChangingPass(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านล้มเหลว");
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return <div className="w-full flex justify-center py-12 text-gray-500">กำลังโหลดโปรไฟล์...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขโปรไฟล์</h1>

      <form onSubmit={handleSaveProfile} className="space-y-4 bg-white p-4 rounded-md shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} disabled={!canEditUsername} />
          {!canEditUsername && <p className="text-xs text-gray-500 mt-1"></p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <Input value={role} disabled={true} />
          <p className="text-xs text-gray-500 mt-1"></p>
        </div>

        {canEditPayment && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อจริงตามธนาคาร</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="เช่น สมชาย ใจดี" />
              <p className="text-xs text-gray-500 mt-1">ชื่อต้องตรงกับบัญชีธนาคาร/พร้อมเพย์</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PhoneNumber</label>
              <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="เช่น 0812345678" />
              <p className="text-xs text-gray-500 mt-1">กรอกเลข 10 หลักขึ้นต้นด้วย 0 เท่านั้น</p>
            </div>
          </>
        )}

        {(canEditUsername || canEditPayment) && (
          <div className="pt-2">
            <Button type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}</Button>
          </div>
        )}
      </form>

      {canChangePassword && (
        <form onSubmit={handleChangePassword} className="space-y-4 bg-white p-4 rounded-md shadow mt-6">
          <h2 className="text-lg font-semibold">เปลี่ยนรหัสผ่าน</h2>
          <div>
            <label className="block text-sm font-medium mb-1">รหัสผ่านปัจจุบัน</label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showCurrentPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowCurrentPassword((v) => !v)}
              >
                {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">รหัสผ่านใหม่</label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showNewPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword((v) => !v)}
              >
                {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <Button type="submit" disabled={changingPass}>{changingPass ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;


