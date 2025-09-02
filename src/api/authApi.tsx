import { RegisterRequest,ILoginState, LoginResponse } from "@/types/auth";
// src/api/authApi.ts

const BASE = "http://localhost:5260/api/";

export async function registerUser(data: RegisterRequest) {
  const payload = {
    ...data,
    PhoneNumber: data.PhoneNumber ?? "",
  };
  const response = await fetch(BASE + "users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Register failed");
  }

  return response.json();
}

export async function loginUser(credentials: ILoginState): Promise<LoginResponse> {
  const response = await fetch(BASE + "users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return response.json();
}
