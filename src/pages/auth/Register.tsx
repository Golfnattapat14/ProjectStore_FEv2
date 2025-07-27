import React from "react";
import { useState } from "react";
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
import Shopay from "../../assets/Shopay.jpeg";
import { registerUser } from "@/api/authApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type RoleType = "Buyer" | "Seller";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RoleType>("Buyer");

  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword || !role) {
      setShowError(true);
      return;
    }
    if (password !== confirmPassword) {
      setShowError(true);
      return;
    }
    setShowError(false);

    const dataToSend = { username, password, role };
    try {
      const result = await registerUser(dataToSend);
      toast.success("Register Success! User ID: " + result.id);
   
      navigate("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Unexpected error occurred.");
      }
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
                  showError && !password ? "border-2 border-red-400" : ""
                }`}
              />
              {showError && !password && (
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
            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">
                Confirm Password
              </span>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full, ${
                  showError && !confirmPassword ? "border-2 border-red-400" : ""
                }`}
              />
              {showError && !confirmPassword && (
                <p className="text-xs text-red-400 my-1">
                  This field is required
                </p>
              )}
            </div>
            <div className="w-full">
              <span className="font-semibold text-sm text-gray-400">Role</span>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as RoleType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Buyer">Buyer</SelectItem>
                    <SelectItem value="Seller">Seller</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {showError && !role && (
                <p className="text-xs text-red-400 my-1">
                  This field is required
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full">
            Register
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
