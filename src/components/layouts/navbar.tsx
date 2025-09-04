import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { LogoutModal } from "../modals/logout";
import { ArrowRightEndOnRectangleIcon, UserCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";


interface NavigationItem {
  name: string;
  path: string;
}

export const NavbarComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [paymentOk, setPaymentOk] = useState<boolean | null>(null);

  // ตรวจสอบ token หมดอายุทุก 60 วินาที
  useEffect(() => {
    const interval = setInterval(checkTokenExpiry, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // โหลดข้อมูลจาก localStorage และตรวจสอบความถูกต้อง
  useEffect(() => {
    const readFromStorage = () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");
      const storedRole = localStorage.getItem("role");

      console.debug("[Navbar] readFromStorage:", { tokenExists: !!token, storedUsername, storedRole });

      // ถ้าไม่มี token ให้ logout
      if (!token) {
        console.debug("[Navbar] token missing -> logout");
        handleLogout();
        return;
      }

      // ตั้งค่า username/role ถ้ามี (ถ้าไม่มีอย่า logout — อาจเพิ่งเซ็ตยังไม่ครบ)
      setUsername(storedUsername ?? null);
      setRole(storedRole ?? null);

      // อ่านค่า CheckPayment แบบเข้มงวด (true/false)
      const rawCheck = localStorage.getItem("CheckPayment");
      if (rawCheck !== null) {
        const v = rawCheck.trim().toLowerCase();
        setPaymentOk(v === "true" || v === "1");
        return;
      }

      // fallback: phone + account (ต้องมีทั้งคู่)
      const phone = (localStorage.getItem("PhoneNumber") ?? localStorage.getItem("phoneNumber") ?? "").trim();
      const account = (localStorage.getItem("AccountName") ?? localStorage.getItem("accountName") ?? "").trim();
      setPaymentOk(phone.length > 0 && account.length > 0);
    };

    // อ่านตอน mount
    readFromStorage();

    const handleStorage = (e: StorageEvent) => {
      const keysOfInterest = [
        "token",
        "username",
        "role",
        "CheckPayment",
        "checkPayment",
        "PhoneNumber",
        "phoneNumber",
        "AccountName",
        "accountName",
      ];
      if (!e.key || keysOfInterest.includes(e.key)) {
        console.debug("[Navbar] storage event key:", e.key);
        readFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);
    const handlePaymentUpdated = () => readFromStorage();
    window.addEventListener("paymentUpdated", handlePaymentUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("paymentUpdated", handlePaymentUpdated);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setModalOpen(false);
    navigate("/");
  };

  const checkTokenExpiry = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: { exp?: number } = jwtDecode(token);
        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
          handleLogout();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    }
  };

  const buyerLinks: NavigationItem[] = [
    { name: "เลือกซื้อสินค้า", path: "/buyer" },
    { name: "ตะกร้าของคุณ", path: "/buyerCart" },
    { name: "สถานะการสั่งซื้อ", path: "/buyerOrder" }, 
  ];

  const adminLinks: NavigationItem[] = [
    { name: "จัดการสินค้า", path: "/admin" },
    { name: "จัดการผู้ใช้", path: "/adminManage" },
    { name: "เพิ่มสินค้า", path: "/adminAdd" },
  ];

  const sellerLinks: NavigationItem[] = [
    { name: "จัดการสินค้า", path: "/seller" },
    { name: "เพิ่มสินค้า", path: "/sellerAdd" },
    { name: "สถานะการสั่งซื้อ", path: "/sellerOrder" },
  ];
  
  const roleLinks = role === "buyer" ? buyerLinks : role === "admin" ? adminLinks : [];
  if (role === "seller") {
    roleLinks.push(...sellerLinks);
  }


  return (
    <header className="bg-white border-b-2 border-gray-200 shadow sticky top-0 z-50">
      <nav className="flex items-center justify-between p-2 lg:px-4">
        {/* โลโก้ */}
        <div className="flex lg:flex-1 text-xl font-bold text-gray-500">
          <div className="bg-gradient-to-r from-red-500 via-violet-500 to-sky-500 bg-clip-text text-transparent font-bold text-xl hover:scale-110">
            อำนวย Shop
          </div>
        </div>

        {/* ลิงก์ตาม role */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-center gap-6">
          {roleLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-blue-600 font-semibold hover:underline"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* โปรไฟล์ผู้ใช้/โปรไฟล์ลิงก์ และ Logout */}
        {username && (
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-3">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="size-7 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">{username}</span>

              {/* สถานะการยืนยัน/แจ้งเตือนสำหรับผู้ขาย */}
              {role === "seller" && (
                <div className="relative inline-block group">
                  {paymentOk === false ? (
                    <ExclamationTriangleIcon
                      className="w-5 h-5 text-yellow-500"
                      aria-hidden
                    />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" aria-hidden />
                  )}

                  {/* tooltip */}
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 transform rounded bg-gray-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal w-56 text-center"
                  >
                    {paymentOk === false
                      ? "กรุณากรอกข้อมูลเบอร์โทรศัพท์และชื่อบัญชีให้ครบก่อน สินค้าจะยังไม่แสดงให้ผู้ซื้อเห็นจนกว่าจะกรอกข้อมูลครบ"
                      : "ยืนยันข้อมูลเรียบร้อย"}
                  </div>
                </div>
              )}

              <span className="text-gray-300">|</span>
              <Link to="/profile" className="text-sm font-semibold text-blue-600 hover:underline">
                โปรไฟล์
              </Link>
            </div>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600 duration-300 ease-in-out hover:cursor-pointer"
            >
              Logout <ArrowRightEndOnRectangleIcon className="size-5" />
            </button>
          </div>
        )}
      </nav>

      {/* Logout Modal */}
      {isModalOpen && (
        <LogoutModal
          onSubmit={handleLogout}
          onClose={() => setModalOpen(false)}
        />
      )}
    </header>
  );
};
