import { getAuthHeadersJSON } from "./Token";

const BASE = "http://localhost:5260/api/";

export async function getProducts(
  keyword?: string,
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    productTypes?: number[];      // ตัวเลข เช่น [1, 2]
    minPrice?: number;
    maxPrice?: number;
    releaseDateFrom?: string;     // YYYY-MM-DD
    releaseDateTo?: string;       // YYYY-MM-DD
    isActive?: boolean;
  }
) {
  const headers = getAuthHeadersJSON();
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (keyword) params.append("keyword", keyword);

  if (filters) {
    if (filters.productTypes?.length) {
      filters.productTypes.forEach((type) => {
        params.append("productTypes", String(type));
      });
    }
    if (filters.minPrice != null) params.append("minPrice", String(filters.minPrice));
    if (filters.maxPrice != null) params.append("maxPrice", String(filters.maxPrice));
    if (filters.releaseDateFrom) params.append("releaseDateFrom", filters.releaseDateFrom);
    if (filters.releaseDateTo) params.append("releaseDateTo", filters.releaseDateTo);
    if (filters.isActive != null) params.append("isActive", String(filters.isActive));
  }

  const url = `${BASE}products/all?${params.toString()}`;
  const res = await fetch(url, { method: "GET", headers });

  if (!res.ok) throw new Error("โหลดสินค้า (seller) ล้มเหลว");

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
