// api/User.ts
import { getAuthHeadersJSON } from "./Token";

const BASE = "http://localhost:5260/api/";

// =====================
// ดัก Error จาก backend
// =====================
async function extractError(res: Response, fallback: string): Promise<never> {
  try {
    const data = await res.json();

    // Direct message
    if (typeof data?.message === "string" && data.message.trim()) {
      throw new Error(data.message);
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      throw new Error(data.error);
    }

    // Validation errors: { errors: { field: [msg] } }
    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const firstVal = data.errors[firstKey];
      if (Array.isArray(firstVal) && typeof firstVal[0] === "string") {
        throw new Error(firstVal[0]);
      }
      if (typeof firstVal === "string") {
        throw new Error(firstVal);
      }
    }
  } catch (_) {}

  try {
    const text = await res.text();
    if (text && text.trim()) {
      throw new Error(text);
    }
  } catch (_) {}

  throw new Error(fallback);
}

// =====================
// Types
// =====================
export interface UserProfile {
  id: string;
  username: string;
  role: "Admin" | "Buyer" | "Seller";
  PhoneNumber?: string | null;
}

export interface UpdateProfileRequest {
  username?: string;
  PhoneNumber?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// =====================
// API Calls
// =====================
export async function getCurrentUser(): Promise<UserProfile> {
  const res = await fetch(`${BASE}users/me`, {
    method: "GET",
    headers: getAuthHeadersJSON(),
  });
  if (!res.ok) return extractError(res, "โหลดโปรไฟล์ล้มเหลว");
  return res.json();
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UserProfile> {
  const res = await fetch(`${BASE}users/me`, {
    method: "PUT",
    headers: getAuthHeadersJSON(),
    body: JSON.stringify(data),
  });
  if (!res.ok) return extractError(res, "อัปเดตโปรไฟล์ล้มเหลว");
  return res.json();
}

export async function changePassword(
  req: ChangePasswordRequest
): Promise<void> {
  const res = await fetch(`${BASE}users/change-password`, {
    method: "POST",
    headers: getAuthHeadersJSON(),
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.message || "เปลี่ยนรหัสผ่านล้มเหลว";
    throw new Error(msg);
  }

  // Success message ถ้าต้องการ ใช้ toast ที่ component
  const data = await res.json().catch(() => null);
  if (data?.message) {
    // สามารถเลือก toast ที่นี่ หรือที่ component
    console.log(data.message);
  }
}
