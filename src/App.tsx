import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ErrorPage } from "./pages/auth/Error";
import { Layout } from "./components/layouts/layout";
import SellerPage from "./pages/Seller/SellerPage";
import SellerAdd from "./pages/Seller/SellerAdd";
import SellerManage from "./pages/Seller/SellerManage";
import AdminPage from "./pages/Admin/AdminPage";
import { NavbarComponent } from "./components/layouts/navbar";
import AdminManage from "./pages/Admin/AdminManage";
import AdminManageUser from "./pages/Admin/AdminManageUser";
import AdminManageProducts from "./pages/Admin/AdminManageProducts";
import BuyerCart from "./pages/Buyer/BuyerCart";
import BuyerPage from "./pages/Buyer/BuyerPage";

const App = () => {
  const location = useLocation();

  // ซ่อน Navbar ในหน้า Login และ Register
  const hideNavbarPaths = ["/", "/register"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {/* Navbar จะแสดงเฉพาะเมื่อไม่อยู่ในหน้า Login/Register */}
      {!shouldHideNavbar && <NavbarComponent />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<ErrorPage />} />

        {/* หน้าสำหรับ Seller */}
        <Route path="/seller" element={<SellerPage />} />
        <Route path="/sellerAdd" element={<SellerAdd />} />
        <Route path="/sellerManage/:id" element={<SellerManage />} />

        {/* หน้าสำหรับ Admin */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path ="/adminManage" element={<AdminManage/>}></Route>
        <Route path ="/adminManageUser/:id" element={<AdminManageUser/>}></Route>
        <Route path ="/adminManageProducts/:id" element={<AdminManageProducts/>}></Route>


        <Route path="/buyer" element={<BuyerPage />} />
        <Route path="/buyerCart" element={<BuyerCart />} />
        




        {/* Layout ทั่วไป (ในอนาคต) */}
        <Route element={<Layout />}>
          {/* เช่น: <Route path="/todo" element={<TodosList />} /> */}
        </Route>
      </Routes>

      <ToastContainer aria-label="Notification Container" />
    </>
  );
};

export default App;
