import { getAuthHeadersFormData, getAuthHeadersJSON } from "./Token";
import type { ProductRequest, ProductResponse} from "../types/product";
import { User,UpdateUserRequest,UserResponse } from "@/types/adminDashborad";

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

export async function getProductsAdmin(
  keyword?: string,
  page: number = 1,
  pageSize: number = 10
) {
  const headers = getAuthHeadersJSON();
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (keyword) {
    params.append("keyword", keyword);
  }

  const url = keyword
    ? `${BASE}products/search?${params.toString()}`
    : `${BASE}products/all?${params.toString()}`;

  const res = await fetch(url, { method: "GET", headers });

  if (!res.ok) throw new Error("โหลดสินค้า (admin) ล้มเหลว");

  return res.json();
}

export async function getUserById(id: string): Promise<UserResponse> {
  const res = await fetch(`${BASE}admin/user/${id}`, {
    method: "GET",
    headers:getAuthHeadersJSON(),
  });
  if (!res.ok) throw new Error("ไม่พบผู้ใช้");
  return res.json();
}


export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}Admin/users`, {
    method: "GET",
    headers: getAuthHeadersJSON(),
  });
  if (!res.ok) throw new Error("โหลดผู้ใช้ล้มเหลว");
  return await res.json();
}

export async function createProduct(req: ProductRequest) {
  const res = await fetch(`${BASE}Admin`, {
    method: "POST",
    headers: getAuthHeadersJSON(),
    body: JSON.stringify(req),
  });
  if (res.status === 409) throw new Error("ชื่อซ้ำ");
  if (!res.ok) throw new Error("เพิ่มสินค้าล้มเหลว");
  return await res.json();
}

export async function updateUser(id: string, req: UpdateUserRequest) {
  const res = await fetch(`${BASE}Admin/manage/${id}`, {
    method: "PUT",
    headers: getAuthHeadersJSON(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("แก้ไขผู้ใช้ล้มเหลว");
}


export async function updateProduct(
  id: string,
  data: ProductRequest
): Promise<ProductResponse> {
  const headers = getAuthHeadersFormData();

  if (!headers.Authorization) throw new Error("Token not found, please login");

  const formData = new FormData();
  formData.append("Id", id);
  formData.append("ProductName", data.ProductName);
  formData.append("ProductPrice", data.ProductPrice.toString());
  formData.append("ProductType", data.ProductType.toString());
  formData.append("Quantity", data.Quantity.toString());
  formData.append("IsActive", data.IsActive ? "true" : "false");

  // เพิ่มเฉพาะถ้า FilePath เป็นไฟล์จริง
  if (data.FilePath instanceof File) {
    formData.append("FilePath", data.FilePath);
  }

  const { Authorization } = headers;

  const response = await fetch(`${BASE}products/${id}`, {
    method: "PUT",
    headers: {
      Authorization,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "ไม่สามารถอัปเดตสินค้าได้");
  }

  return response.json();
}


export async function deleteProduct(id: string): Promise<void> {
  const headers = getAuthHeadersJSON();
  console.log("Auth Headers:", headers); // เช็ค header

  if (!headers.Authorization) throw new Error("Token not found, please login");

  const response = await fetch(`${BASE}products/${id}`, {
    method: "DELETE",
    headers,
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "ไม่สามารถลบสินค้าได้");
  }
}

// ลบไฟล์ของสินค้า
export async function deleteProductFile(id: string): Promise<void> {
  const headers = getAuthHeadersJSON();
  if (!headers.Authorization) throw new Error("Token not found, please login");

  const response = await fetch(`${BASE}products/delete-file/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "ไม่สามารถลบไฟล์ของสินค้าได้");
  }
}

export async function deleteUser(id: string) {
  const res = await fetch(`${BASE}Admin/user/${id}`, {
    method: "DELETE",
    headers: getAuthHeadersJSON(),
  });
  if (!res.ok) throw new Error("ลบผู้ใช้ล้มเหลว");
}


