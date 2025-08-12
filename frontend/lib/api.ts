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
// ...existing code...
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
  addCategory: (name: string, token?: string) =>
    apiFetch("/api/categories", { method: "POST", body: { name }, token }),
  updateCategory: (id: string, name: string, token?: string) =>
    apiFetch(`/api/categories/${id}`, { method: "PATCH", body: { name }, token }),
  deleteCategory: (id: string, token?: string) =>
    apiFetch(`/api/categories/${id}`, { method: "DELETE", token }),

  // Multipart create using FormData (supports image upload)
  createMultipart: async (formData: FormData, token?: string) => {
    const res = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as any,
      body: formData,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(text || `Request failed with status ${res.status}`)
    }
    return res.json()
  },
  updateProduct: (id: string, product: any, token?: string) =>
    apiFetch(`/api/products/${id}`, { method: "PUT", body: product, token }),
  deleteProduct: (id: string, token?: string) =>
    apiFetch(`/api/products/${id}`, { method: "DELETE", token }),
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
  list: (token?: string) => apiFetch("/api/orders", { token }),
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
  updateStatus: (id: string, status: string, token?: string) =>
    apiFetch(`/api/orders/${id}`, { method: "PATCH", body: { status }, token }),
}

export const AddressesApi = {
  list: (token?: string) => apiFetch("/api/addresses", { token }),
  create: (
    payload: {
      label?: string
      fullName: string
      phone: string
      line1: string
      line2?: string
      city: string
      state: string
      postalCode: string
      country: string
      isDefault?: boolean
    },
    token?: string,
  ) => apiFetch("/api/addresses", { method: "POST", body: payload, token }),
  update: (
    id: string,
    payload: {
      label?: string
      fullName?: string
      phone?: string
      line1?: string
      line2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
      isDefault?: boolean
    },
    token?: string,
  ) => apiFetch(`/api/addresses/${id}`, { method: "PATCH", body: payload, token }),
  delete: (id: string, token?: string) => apiFetch(`/api/addresses/${id}`, { method: "DELETE", token }),
}