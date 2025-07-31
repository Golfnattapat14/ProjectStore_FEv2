// src/api/sellerApi.ts

import { getAuthHeadersFormData, getAuthHeadersJSON } from "./Token";
import type { ProductRequest, ProductResponse } from "../types/product";

const BASE = "http://localhost:5260/api/";

// ดึงสินค้าทั้งหมดของ Seller นั้นๆ
export async function getProductsSeller(): Promise<ProductResponse[]> {
  const headers = getAuthHeadersJSON();
  if (!headers.Authorization) throw new Error("Token not found, please login");

  const response = await fetch(`${BASE}products/all`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "ไม่สามารถโหลดสินค้าสำหรับ Seller ได้");
  }

  return response.json();
}

// เพิ่มสินค้า
export async function addNewProduct(product: ProductRequest): Promise<ProductResponse> {
  const headers = getAuthHeadersFormData();
  if (!headers.Authorization) throw new Error("Token not found, please login");

  const formData = new FormData();
  formData.append("ProductName", product.ProductName);
  formData.append("ProductPrice", String(product.ProductPrice));
  formData.append("ProductType", String(product.ProductType));
  formData.append("Quantity", String(product.Quantity));
  formData.append("IsActive", product.IsActive ? "true" : "false");

  if (product.FilePath) {
    formData.append("FilePath", product.FilePath);
  }

  const { Authorization } = headers;

  const response = await fetch(`${BASE}products`, {
    method: "POST",
    headers: {
      Authorization,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log("Error response from server:", errorData);
    throw new Error(errorData.message || "ไม่สามารถเพิ่มสินค้าได้");
  }

  return response.json();
}



// แก้ไขสินค้า
export async function updateProduct(id: string, data: ProductRequest): Promise<ProductResponse> {
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




// ดึงสินค้าตาม ID
export async function getProductById(id: string): Promise<ProductResponse> {
  const headers = getAuthHeadersJSON();
  const response = await fetch(`${BASE}products/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "ไม่สามารถดึงข้อมูลสินค้านี้ได้");
  }

  return response.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const headers = getAuthHeadersJSON();
  console.log("Auth Headers:", headers);  // เช็ค header

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



