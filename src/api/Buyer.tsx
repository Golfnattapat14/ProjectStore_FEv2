import { getAuthHeadersJSON } from "./Token";

const BASE = "http://localhost:5260/api/";

export interface CheckoutItem {
  productId: string;
  quantity: number;
  unitPrice?: number;

}

export interface CheckoutRequest {
  sellerId: string;       // รหัสร้านค้า
  items: CheckoutItem[];  // รายการสินค้า
}

export interface CheckoutResponse {
  orderId: string;
  totalAmount: number;
  message: string;
}

export interface BuyerOrder {
  sellerName: string;
  orderId: string;
  status: number;
  statusLabel: string;
  createByName: string | null;
  createBy: string | null;
  productId: string;
  productName: string;
  productPrice: number | null;
  productType: number;
  productTypeLabel: string;
  createDate: string;
  filePath?: string | null;
}

export async function getProducts(
  keyword?: string,
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    productTypes?: number[];
    minPrice?: number;
    maxPrice?: number;
    releaseDateFrom?: string;
    releaseDateTo?: string;
    isActive?: boolean;
  }
) {
  const headers = getAuthHeadersJSON();
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (keyword) params.append("keyword", keyword);

  if (!filters) filters = {};
  
  // บังคับให้ isActive = true สำหรับ buyer
  if (filters.isActive == null) filters.isActive = true;

  if (filters.productTypes?.length) {
    filters.productTypes.forEach((type) => {
      params.append("productTypes", String(type));
    });
  }
  if (filters.minPrice != null)
    params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null)
    params.append("maxPrice", String(filters.maxPrice));
  if (filters.releaseDateFrom)
    params.append("releaseDateFrom", filters.releaseDateFrom);
  if (filters.releaseDateTo)
    params.append("releaseDateTo", filters.releaseDateTo);

  if (filters.isActive != null)
    params.append("isActive", String(filters.isActive)); // จะเป็น true เสมอ

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
  const headers = {
    ...getAuthHeadersJSON(),
    "Content-Type": "application/json",
  };
  const res = await fetch(`${BASE}buyer/cart`, {
    method: "POST",
    headers,
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("เพิ่มสินค้าไม่สำเร็จ");
  return res.json();
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  const headers = {
    ...getAuthHeadersJSON(),
    "Content-Type": "application/json",
  };
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

export const checkout = async (payload: CheckoutRequest[]) => {
  const headers = {
    ...getAuthHeadersJSON(),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE}buyer/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload), 
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message || "สั่งซื้อไม่สำเร็จ");
  }

  return res.json();
};


// ดึง order ของผู้ใช้
export const getBuyerOrders = async (): Promise<BuyerOrder[]> => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/orders`, { headers });
  if (!res.ok) throw new Error("โหลดคำสั่งซื้อไม่สำเร็จ");
  const data: BuyerOrder[] = await res.json();

  // map ให้ ProductPrice มีค่า default 0
  return data.map((item) => ({
    ...item,
    productPrice: item.productPrice ?? 0,
    createByName: item.createByName ?? "",
    createBy: item.createBy ?? "",
    productName: item.productName ?? "",
    productTypeLabel: item.productTypeLabel ?? "",
    filePath: item.filePath ?? "",
  }));
};



export const getOrderDetail = async (orderId: string) => {
  const headers = getAuthHeadersJSON();
  const res = await fetch(`${BASE}buyer/orders/${orderId}`, { headers });
  if (!res.ok) throw new Error("โหลดบิลไม่สำเร็จ");
  const data = await res.json(); // ได้เป็น array ของสินค้า

  // รวมเป็น object เดียว
  const totalAmount = data.reduce(
    (sum: number, i: any) => sum + (i.unitPrice ?? 0) * (i.quantity ?? 0),
    0
  );
  return {
    Id: orderId,
    Status: data[0]?.status ?? 0,
    StatusLabel: data[0]?.statusLabel ?? "",
    TotalAmount: totalAmount,
    Items: data.map((i: any) => ({
      ProductId: i.productId,
      ProductName: i.productName,
      UnitPrice: i.unitPrice,
      Quantity: i.quantity,
    })),
  };
};

export const payOrder = async (
  orderId: string,
  paidAmount: number,
  paymentMethod: string
) => {
  const headers = {
    ...getAuthHeadersJSON(),
    "Content-Type": "application/json",
  };
  const res = await fetch(`${BASE}buyer/payment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orderId, paidAmount, paymentMethod }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message || "ชำระเงินไม่สำเร็จ");
  }

  return await res.json();
};
