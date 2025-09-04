import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Shop from "../../assets/Shop.png";
import { loginUser } from "@/api/authApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "@/components/layouts/CartContext";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshCart } = useCart(); // <-- get refreshCart

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setLoading(true);

    try {
      const formData = { username: username, password: password };
      const result: any = await loginUser(formData);

      // เก็บ token และข้อมูล user
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", (result.role ?? "").toString().toLowerCase());

      // เก็บค่า checkPayment จาก response (ถ้ามี) เพื่อให้ Navbar อ่านได้ทันที
      if (typeof (result.checkPayment) === "boolean") {
        localStorage.setItem("CheckPayment", String(result.checkPayment));
      } else if (typeof (result.CheckPayment) === "boolean") {
        localStorage.setItem("CheckPayment", String(result.CheckPayment));
      }

      // dispatch event ให้ Navbar รีเฟรชสถานะทันที
      window.dispatchEvent(new Event("paymentUpdated"));

      // โหลด cart ทันทีหลัง login แต่ไม่บล็อกการเข้าใช้งาน
      try {
        await refreshCart();
      } catch (refreshErr) {
        console.error("refreshCart failed:", refreshErr);
      }

      // ตรวจสอบ checkPayment / phone / account เพื่อแจ้งเตือน (แต่ไม่บล็อกการ login)
      const role = (result.role ?? "").toString().toLowerCase();

      const hasBoolean = (obj: any, key: string) =>
        obj && typeof obj[key] === "boolean";

      const checkPayment =
        hasBoolean(result, "checkPayment")
          ? result.checkPayment
          : hasBoolean(result, "CheckPayment")
          ? result.CheckPayment
          : undefined;

      const phone =
        (result as any)?.PhoneNumber ?? (result as any)?.phoneNumber ?? "";
      const account =
        (result as any)?.AccountName ?? (result as any)?.accountName ?? "";

      const isPaymentOk =
        checkPayment === undefined ? !!(phone && account) : !!checkPayment;

      if (role === "seller" && isPaymentOk === false) {
        toast.warn(
          "กรุณากรอกข้อมูลเบอร์โทรศัพท์และชื่อบัญชีให้ครบก่อน สินค้าจะยังไม่แสดงให้ผู้ซื้อเห็นจนกว่าจะกรอกข้อมูลครบ",
          {
            position: "top-center",
            autoClose: false, // <-- ไม่ปิดอัตโนมัติ
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            hideProgressBar: false,
            theme: "colored",
          }
        );
      }

      toast.success("Login success!");

      // redirect ตาม role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "buyer":
          navigate("/buyer");
          break;
        case "seller":
          navigate("/seller");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Login error occurred.");
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
              <span className="font-semibold text-sm text-gray-400">
                Username
              </span>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full, ${
                  showError && !username ? "border-2 border-red-400" : ""
                }`}
                disabled={loading}
              />
              {showError && !username && (
                <p className="text-xs text-red-400 my-1">This field is required</p>
              )}
            </div>
            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">Password</span>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full, ${
                  showError && !password ? "border-2 border-red-400" : ""
                }`}
                disabled={loading}
              />
              {showError && !password && (
                <p className="text-xs text-red-400 my-1">This field is required</p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </Button>
          <p className="text-xs text-center">
            Don’t have an account?{" "}
            <span
              className="text-xs text-[#6270EF] font-semibold hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign up Here!
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};
