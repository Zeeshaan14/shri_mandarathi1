export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const AuthApi = {
  login: (email: string, password: string) =>
    apiFetch<{ status: boolean; message: string; token: string; user: any }>(
      "/api/auth/login",
      { method: "POST", body: { email, password } },
    ),
  register: (name: string, email: string, password: string) =>
    apiFetch<{ status: boolean; message: string; user: any }>(
      "/api/auth/register",
      { method: "POST", body: { name, email, password } },
    ),
};

export const ProductsApi = {
  list: () => apiFetch("/api/products"),
  categories: () => apiFetch("/api/categories"),
};

export const CartApi = {
  add: (variantId: string, quantity: number, token?: string) =>
    apiFetch("/api/cart/add", { method: "POST", body: { variantId, quantity }, token }),
  get: (userId: string, token?: string) => apiFetch(`/api/cart/${userId}`, { token }),
  updateItem: (cartItemId: string, quantity: number, token?: string) =>
    apiFetch(`/api/cart/item/${cartItemId}`, { method: "PATCH", body: { quantity }, token }),
  removeItem: (cartItemId: string, token?: string) => apiFetch(`/api/cart/item/${cartItemId}`, { method: "DELETE", token }),
  clear: (userId: string, token?: string) => apiFetch(`/api/cart/clear/${userId}`, { method: "DELETE", token }),
}

export const OrdersApi = {
  create: (
    payload: {
      items: Array<{ variantId: string; quantity: number }>
      shipping: {
        fullName: string
        phone: string
        line1: string
        line2?: string
        city: string
        state: string
        postalCode: string
        country: string
      }
    },
    token?: string,
  ) => apiFetch("/api/orders", { method: "POST", body: payload, token }),
}
