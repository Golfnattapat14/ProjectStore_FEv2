import { UserCart } from "@/types/Cart";
import { getAuthHeadersJSON } from "./Token";

const BASE = "http://localhost:5260/api/";

export const getCartItems = async (): Promise<UserCart[]> => {
  const headers = getAuthHeadersJSON(); 
  const res = await fetch(`${BASE}buyer/cart`, { headers });
  if (!res.ok) throw new Error("โหลดตะกร้าไม่สำเร็จ");
  return res.json();
};

export const addToCart = async (productId: string, quantity: number) => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/cart`, {
    method: "POST",
    headers,
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("เพิ่มสินค้าไม่สำเร็จ");
  return res.json();
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/cart/${cartItemId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("อัปเดตสินค้าไม่สำเร็จ");
  return res.json();
};

export const removeCartItem = async (cartItemId: string) => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/cart/${cartItemId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("ลบสินค้าไม่สำเร็จ");
  return res.json();
};

export const clearCart = async () => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/cart`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("ล้างตะกร้าไม่สำเร็จ");
  return res.json();
};

export const searchProducts = async (keyword: string) => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}products/search?keyword=${encodeURIComponent(keyword)}`, {
    headers,
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
};
