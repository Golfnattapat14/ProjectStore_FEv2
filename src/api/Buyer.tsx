import { getAuthHeadersJSON } from "./Token";

const BASE = "http://localhost:5260/api/";

export async function getProducts() {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/all`, { method: "GET", headers });
  if (!res.ok) throw new Error("โหลดสินค้า (Buyer) ล้มเหลว");
  return res.json();
}

export const getCartItems = async () => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/cart`, { headers });
  if (!res.ok) throw new Error("โหลดตะกร้าไม่สำเร็จ");
  return res.json();
};

export const getCartItemCount = async (): Promise<number> => {
  const res = await fetch("/api/buyer/cart/count", {
    credentials: "include",
  });

  if (!res.ok) throw new Error("ไม่สามารถโหลดจำนวนสินค้าในตะกร้าได้");
  return await res.json(); // ได้เป็นตัวเลข เช่น 3
};


export const addToCart = async (productId: string, quantity = 1) => {
  const headers = { ...getAuthHeadersJSON(), "Content-Type": "application/json" };
  const res = await fetch(`${BASE}buyer/cart`, {
    method: "POST",
    headers,
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("เพิ่มสินค้าไม่สำเร็จ");
  return res.json();
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  const headers = { ...getAuthHeadersJSON(), "Content-Type": "application/json" };
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
