import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ErrorPage } from "./pages/Error";
import { Layout } from "./components/layouts/layout";
import Homepage from "./pages/Homepage";

const App = () => {
  return (
    <>
    {/* ตั้งชื่อ path อะไรก็ได้ */}
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="*" element={<ErrorPage />}></Route>

        <Route element={<Layout />}>
        
          <Route path="/homepage" element={<Homepage />}></Route>
        </Route>
      </Routes>
      <ToastContainer aria-label="Notification Container" />
    </>
  );
};
export default App;
