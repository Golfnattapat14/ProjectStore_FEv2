import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { LogoutModal } from "../modals/logout";
import { Button } from "../ui/button";
import {
  ArrowRightEndOnRectangleIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";

interface NavigationItem {
  name: string;
  path: string;
}

export const NavbarComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!username) {
      handleLogout();
    }
  }, [username]);

  const handleLogout = () => {
    localStorage.clear();
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

  useEffect(() => {
    const interval = setInterval(checkTokenExpiry, 1000 * 60);
    return () => clearInterval(interval);
  }, []);
  
  

  return (
    <header className="bg-white border-b-2 border-gray-200 shadow sticky top-0 z-50">
      <nav className="flex items-center justify-between p-2 lg:px-4">
        {/* Logo */}
        <div className="flex lg:flex-1 text-xl font-bold text-gray-500">
          <div className="bg-gradient-to-r from-red-500 via-violet-500 to-sky-500 bg-clip-text text-transparent font-bold text-xl hover:scale-110">
            Store Shope
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center gap-6">
          {/* ลิงก์สำหรับ admin เท่านั้น */}
          {role === "buyer" && (
            <Link
              to="/buyer"
              className="text-blue-600 font-semibold hover:underline"
            >
              เลือกซื้อสินค้า
            </Link>
          )}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center gap-6">
          {/* ลิงก์สำหรับ admin เท่านั้น */}
          {role === "buyer" && (
            <Link
              to="/buyerCart"
              className="text-blue-600 font-semibold hover:underline"
            >
              ตะกร้าของคุณ
            </Link>
          )}
        </div>
        
          <div className="hidden lg:flex lg:flex-1 lg:justify-center gap-6">
          {/* ลิงก์สำหรับ admin เท่านั้น */}
          {role === "buyer" && (
            <Link
              to="/buyer"
              className="text-blue-600 font-semibold hover:underline"
            >
              สถานะการสั่งซื้อ
            </Link>
          )}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center gap-6">
          {/* ลิงก์สำหรับ admin เท่านั้น */}
          {role === "admin" && (
            <Link
              to="/admin"
              className="text-blue-600 font-semibold hover:underline"
            >
              จัดการสินค้า
            </Link>
          )}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center gap-6">
          {/* ลิงก์สำหรับ admin เท่านั้น */}
          {role === "admin" && (
            <Link
              to="/adminManage"
              className="text-blue-600 font-semibold hover:underline"
            >
              จัดการผู้ใช้
            </Link>
          )}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center gap-6">
          {/* ลิงก์สำหรับ admin เท่านั้น */}
          {role === "admin" && (
            <Link
              to="/adminAdd"
              className="text-blue-600 font-semibold hover:underline"
            >
              เพิ่มสินค้า
            </Link>
          )}
        </div>


        {/* User Profile + Logout */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-3">
          {/* Herei Icon + Username */}
          <div className="flex items-center gap-2">
            <UserCircleIcon className={`size-7 text-blue-400`} />
            <span className={`text-sm font-semibold text-blue-400`}>
              {username}
            </span>
          </div>
          |{/* Logout Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600 duration-300 ease-in-out hover:cursor-pointer"
          >
            Logout <ArrowRightEndOnRectangleIcon className="size-5" />
          </button>
        </div>
      </nav>

      {isModalOpen && (
        <LogoutModal
          onSubmit={handleLogout}
          onClose={() => setModalOpen(false)}
        />
      )}
    </header>
  );
};
