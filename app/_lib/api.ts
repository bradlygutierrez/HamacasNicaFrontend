export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export function authHeaders(init?: HeadersInit, includeAccept = true): Headers {
  const headers = new Headers(init);

  if (includeAccept && !headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const token = getStoredToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  const headers = authHeaders(init.headers, true);

  if (isFormData) {
    headers.delete("Content-Type");
  }

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...init,
    headers,
  });
}