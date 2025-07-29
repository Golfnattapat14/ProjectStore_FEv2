import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Shopay from "../../assets/Shopay.jpeg";
import { loginUser } from "@/api/authApi";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setShowError(true);
      return;
    }
    setShowError(false);

    try {
      const formData = { username: username, password: password };
      const result = await loginUser(formData);
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role.toLowerCase());

            window.dispatchEvent(new Event("storage"));

      toast.success("Login success!");
      
      switch (result.role.toLowerCase()) {
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
    }
  };

  return (
    <div className="flex bg-white w-full h-screen justify-center items-center">
      <div className="w-[850px] h-max bg-[#F8F9FF] shadow-lg px-20 py-16 rounded-lg flex flex-col items-center">
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
          <div className="flex flex-col items-center gap-4">
            <img
              src={Shopay}
              alt="Shopay"
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
              />
              {showError && !username && (
                <p className="text-xs text-red-400 my-1">
                  This field is required
                </p>
              )}
            </div>
            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">
                Password
              </span>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full, ${
                  showError && !password ? "border-2 border-red-400" : ""
                }`}
              />
              {showError && !password && (
                <p className="text-xs text-red-400 my-1">
                  This field is required
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full">
            Login
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
