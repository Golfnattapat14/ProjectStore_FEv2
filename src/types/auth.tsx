export interface RegisterRequest {
  username: string;
  password: string;
  role: "Buyer" | "Seller" | "Admin";
}

export interface ILoginState {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  token: string;
  role: "Admin" | "Buyer" | "Seller";
}