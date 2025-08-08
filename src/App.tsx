import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ErrorPage } from "./pages/auth/Error";
import { NavbarComponent } from "./components/layouts/navbar";
import SellerPage from "./pages/Seller/SellerPage";
import SellerAdd from "./pages/Seller/SellerAdd";
import SellerManage from "./pages/Seller/SellerManage";
import AdminPage from "./pages/Admin/AdminPage";
import AdminManage from "./pages/Admin/AdminManage";
import AdminManageUser from "./pages/Admin/AdminManageUser";
import AdminManageProducts from "./pages/Admin/AdminManageProducts";
import BuyerCart from "./pages/Buyer/BuyerCart";
import BuyerPage from "./pages/Buyer/BuyerPage";

import { getToken, isTokenExpired } from "./api/Token";
import AdminAddProduct from "./pages/Admin/AdminAddProduct";
import AdminProducts from "./pages/Admin/AdminProducts";

const AuthChecker = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      navigate("/", { replace: true }); // redirect ไปหน้า login
    }
  }, [location, navigate]);

  return null;
};

const App = () => {
  const location = useLocation();

  // ซ่อน Navbar ในหน้า Login และ Register
  const hideNavbarPaths = ["/", "/register"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      <AuthChecker />

      {/* แสดง Navbar เฉพาะหน้าอื่น ๆ ที่ไม่ใช่ Login/Register */}
      {!shouldHideNavbar && <NavbarComponent />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<ErrorPage />} />

        {/* Seller */}
        <Route path="/seller" element={<SellerPage />} />
        <Route path="/sellerAdd" element={<SellerAdd />} />
        <Route path="/sellerManage/:id" element={<SellerManage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/adminProducts" element={<AdminProducts />} />
        <Route path="/adminManage" element={<AdminManage />} />
        <Route path="/adminManageUser/:id" element={<AdminManageUser />} />
        <Route path="/adminManageProducts/:id" element={<AdminManageProducts />} />
        <Route path="adminAdd" element={<AdminAddProduct />} />



        {/* Buyer */}
        <Route path="/buyer" element={<BuyerPage />} />
        <Route path="/buyerCart" element={<BuyerCart />} />

      </Routes>

      <ToastContainer aria-label="Notification Container" />
    </>
  );
};

export default App;
