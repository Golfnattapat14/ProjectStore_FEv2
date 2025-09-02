import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Shop from "../../assets/Shop.png";
import { registerUser } from "@/api/authApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "@/components/layouts/CartContext";

type RoleType = "Buyer" | "Seller";

const roles = [
  { label: "ผู้ขาย", value: "Seller" },
  { label: "ผู้ซื้อ", value: "Buyer" },
];

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // PhoneNumber สำหรับผู้ขาย
  const [role, setRole] = useState<RoleType>("Buyer");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const isValidThaiPhone = (value: string) => /^0\d{9}$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword || !role || (role === "Seller" && !phoneNumber)) {
      setShowError(true);
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setShowError(true);
      toast.error("Password and Confirm Password do not match");
      return;
    }

    if (role === "Seller" && !isValidThaiPhone(phoneNumber)) {
      setShowError(true);
      toast.error("กรุณากรอกเบอร์โทร 10 หลักขึ้นต้นด้วย 0 (เช่น 0812345678)");
      return;
    }

    setShowError(false);
    setLoading(true);

    try {
      const dataToSend = { username, password, role, PhoneNumber: role === "Seller" ? phoneNumber : "" };
      const result = await registerUser(dataToSend);

      // สมมติ API ส่ง token กลับมาเหมือน login
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role.toLowerCase());

      await refreshCart(); // โหลด cart ทันทีหลัง register

      toast.success("Register Success! Welcome " + result.username);
      navigate("/"); // หรือหน้า login/landing ตามต้องการ
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-white w-full h-screen justify-center items-center">
      <div className="w-[850px] h-max bg-[#F8F9FF] shadow-lg px-20 py-16 rounded-lg flex flex-col items-center">
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
          <div className="flex flex-col items-center gap-4">
            <img
              src={Shop}
              alt="Shop"
              className="w-40 h-40 rounded-full object-cover"
            />

            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">Username</span>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full ${showError && !username ? "border-2 border-red-400" : ""}`}
                disabled={loading}
              />
            </div>

            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">Password</span>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${showError && !password ? "border-2 border-red-400" : ""}`}
                disabled={loading}
              />
            </div>

            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">Confirm Password</span>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full ${showError && !confirmPassword ? "border-2 border-red-400" : ""}`}
                disabled={loading}
              />
            </div>

            {role === "Seller" && (
              <div className="w-full">
                <span className="font-semibold text-sm text-gray-400">Phone Number</span>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full ${
                    showError && (!phoneNumber || !isValidThaiPhone(phoneNumber)) ? "border-2 border-red-400" : ""
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">กรอกเลข 10 หลักขึ้นต้นด้วย 0 เท่านั้น</p>
              </div>
            )}

            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">Role</span>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as RoleType)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((item, index) => (
                      <SelectItem key={index} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Register"}
          </Button>

          <p className="text-xs text-center">
            Already have an account?{" "}
            <span
              className="text-xs text-[#6270EF] font-semibold hover:underline cursor-pointer"
              onClick={() => navigate("/")}
            >
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};
