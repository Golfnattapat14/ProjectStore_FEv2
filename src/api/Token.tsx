// Token.ts
export function getToken(): string {
  return localStorage.getItem("token") ?? "";
}

export function getAuthHeadersJSON(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getAuthHeadersFormData(): Record<string, string> {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ตรวจสอบว่า token หมดอายุหรือยัง
export function isTokenExpired(token: string): boolean {
  if (!token) return true;

  try {
    // decode payload จาก JWT
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch (e) {
    // decode ไม่ได้ ถือว่า token หมดอายุ
    return true;
  }
}
