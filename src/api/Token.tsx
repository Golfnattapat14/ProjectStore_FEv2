// Token.ts
export function getToken() {
  return localStorage.getItem("token") ?? "";
}

export function getAuthHeadersJSON(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}


export function getAuthHeadersFormData() {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// utils/jwt.ts
export function isTokenExpired(token: string): boolean {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch (e) {
    return true; // ถ้า decode ไม่ได้ ให้ถือว่าหมดอายุ
  }
}

