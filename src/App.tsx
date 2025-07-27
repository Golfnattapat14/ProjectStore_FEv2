import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ErrorPage } from "./pages/auth/Error";
import { Layout } from "./components/layouts/layout";
import SellerPage from "./pages/Seller/SellerPage";
import SellerAdd from "./pages/Seller/SellerAdd";
import SellerManage from "./pages/Seller/SellerManage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="*" element={<ErrorPage />}></Route>
        <Route path="seller" element={<SellerPage />}></Route>
        <Route path="sellerAdd" element={<SellerAdd />}></Route>
        <Route path="sellerManage/:id" element={<SellerManage />} />




        <Route element={<Layout />}>
          {/* <Route path="/todo" element={<TodosList />}></Route> */}
        </Route>
      </Routes>
      <ToastContainer aria-label="Notification Container" />
    </>
  );
};
export default App;
