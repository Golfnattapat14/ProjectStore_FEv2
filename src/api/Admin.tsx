import { getAuthHeaders } from "./Token";
import type { ProductRequest, ProductResponse} from "../types/product";
import { User,UpdateUserRequest,UserResponse } from "@/types/adminDashborad";

const BASE = "http://localhost:5260/api/";


export async function getProducts(): Promise<ProductResponse[]> {
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE}admin/all_product`, { method: "GET", headers });
    if (!res.ok) throw new Error("โหลดสินค้า (Admin) ล้มเหลว");
    return await res.json();
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการโหลดสินค้า:", err);
    throw err;
  }
}

export async function getUserById(id: string): Promise<UserResponse> {
  const res = await fetch(`${BASE}admin/user/${id}`, {
    method: "GET",
    headers:getAuthHeaders(),
  });
  if (!res.ok) throw new Error("ไม่พบผู้ใช้");
  return res.json();
}


export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}Admin/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("โหลดผู้ใช้ล้มเหลว");
  return await res.json();
}

export async function createProduct(req: ProductRequest) {
  const res = await fetch(`${BASE}Admin`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });
  if (res.status === 409) throw new Error("ชื่อซ้ำ");
  if (!res.ok) throw new Error("เพิ่มสินค้าล้มเหลว");
  return await res.json();
}

export async function updateUser(id: string, req: UpdateUserRequest) {
  const res = await fetch(`${BASE}Admin/manage/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("แก้ไขผู้ใช้ล้มเหลว");
}
export async function updateProduct(id: string, req: ProductRequest) {
  const res = await fetch(`${BASE}Admin/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("แก้ไขสินค้าล้มเหลว");
  return await res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${BASE}Admin/Products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("ลบสินค้าล้มเหลว");
}

export async function deleteUser(id: string) {
  const res = await fetch(`${BASE}Admin/user/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("ลบผู้ใช้ล้มเหลว");
}

