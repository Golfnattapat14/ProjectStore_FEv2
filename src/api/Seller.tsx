// src/api/sellerApi.ts

import { getAuthHeadersJSON } from "./Token";
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
  const headers = getAuthHeadersJSON();
  if (!headers.Authorization) throw new Error("Token not found, please login");

  // var data = new FormData

  // data.append('productName', product.ProductName)
  // data.append('productName', product.ProductName)
  // data.append('productName', product.ProductName)
  // data.append('productName', product.ProductName)
  
  const response = await fetch(`${BASE}products`, {
    method: "POST",
    headers,
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "ไม่สามารถเพิ่มสินค้าได้");
  }

  return response.json();
}

// แก้ไขสินค้า
export async function updateProduct(id: string, data: ProductRequest): Promise<ProductResponse> {
  const headers = {
    ...getAuthHeadersJSON(),
    "Content-Type": "application/json", 
  };

  // if (!headers.Authorization) throw new Error("Token not found, please login");

  const response = await fetch(`${BASE}products/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
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


