import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { LogoutModal } from "../modals/logout";
import { ArrowRightEndOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/solid";


interface NavigationItem {
  name: string;
  path: string;
}

export const NavbarComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // ตรวจสอบ token หมดอายุทุก 60 วินาที
  useEffect(() => {
    const interval = setInterval(checkTokenExpiry, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // โหลดข้อมูลจาก localStorage และตรวจสอบความถูกต้อง
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    if (!token || !storedUsername || !storedRole) {
      handleLogout();
    } else {
      setUsername(storedUsername);
      setRole(storedRole);
    }
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
    { name: "สถานะการสั่งซื้อ", path: "/buyer" },
  ];

  const adminLinks: NavigationItem[] = [
    { name: "จัดการสินค้า", path: "/admin" },
    { name: "จัดการผู้ใช้", path: "/adminManage" },
    { name: "เพิ่มสินค้า", path: "/adminAdd" },
  ];

  const roleLinks = role === "buyer" ? buyerLinks : role === "admin" ? adminLinks : [];

  return (
    <header className="bg-white border-b-2 border-gray-200 shadow sticky top-0 z-50">
      <nav className="flex items-center justify-between p-2 lg:px-4">
        {/* โลโก้ */}
        <div className="flex lg:flex-1 text-xl font-bold text-gray-500">
          <div className="bg-gradient-to-r from-red-500 via-violet-500 to-sky-500 bg-clip-text text-transparent font-bold text-xl hover:scale-110">
            Store Shope
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

        {/* โปรไฟล์ผู้ใช้และ Logout */}
        {username && (
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-3">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="size-7 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">{username}</span>
            </div>
            |
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
