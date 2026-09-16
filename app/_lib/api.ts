export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  let baseUrl = API_BASE_URL;

  // Keep local development on one site so SameSite=Lax session cookies work.
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost") {
      baseUrl = baseUrl.replace("127.0.0.1", "localhost");
    } else if (window.location.hostname === "127.0.0.1") {
      baseUrl = baseUrl.replace("localhost", "127.0.0.1");
    }
  }

  return `${baseUrl}${cleanPath}`;
}

export function authHeaders(init?: HeadersInit, includeAccept = true): Headers {
  const headers = new Headers(init);

  if (includeAccept && !headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (typeof document !== "undefined") {
    const xsrfCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("XSRF-TOKEN="));

    if (xsrfCookie) {
      headers.set(
        "X-XSRF-TOKEN",
        decodeURIComponent(xsrfCookie.slice("XSRF-TOKEN=".length))
      );
    }
  }

  return headers;
}

export async function csrfCookie(): Promise<void> {
  const csrfUrl = `${new URL(apiUrl("/")).origin}/sanctum/csrf-cookie`;
  const response = await fetch(csrfUrl, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`No se pudo iniciar la protección CSRF (${response.status})`);
  }
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

  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hamacas:unauthorized"));
    }
  }

  return response;
}
