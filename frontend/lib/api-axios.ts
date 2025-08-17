import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;
      
      if (data?.message) {
        errorMessage = data.message;
      } else {
        switch (status) {
          case 400:
            errorMessage = 'Bad request';
            break;
          case 401:
            errorMessage = 'Unauthorized - Please login again';
            // Clear token if unauthorized
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
            }
            break;
          case 403:
            errorMessage = 'Forbidden - You don\'t have permission';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 422:
            errorMessage = 'Validation error';
            break;
          case 500:
            errorMessage = 'Internal server error';
            break;
          default:
            errorMessage = `Request failed with status ${status}`;
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server - Please check your connection';
    } else {
      // Something else happened
      errorMessage = error.message || 'Request setup error';
    }

    // Show error toast
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });

    return Promise.reject(error);
  }
);

// Helper function to extract data from new response format
const extractData = (response: any) => {
  // If response has the new format with status and data fields, extract the data
  if (response && typeof response === 'object' && 'status' in response) {
    // For responses that have a specific data field
    if ('products' in response) return response.products;
    if ('orders' in response) return response.orders;
    if ('users' in response) return response.users;
    if ('categories' in response) return response.categories;
    if ('cart' in response) return response.cart;
    if ('addresses' in response) return response.addresses;
    if ('user' in response) return response.user;
    if ('order' in response) return response.order;
    if ('product' in response) return response.product;
    if ('item' in response) return response.item;
    
    // For responses that don't have a specific data field, return the whole response
    // but remove the status and message fields
    const { status, message, ...data } = response;
    return Object.keys(data).length > 0 ? data : response;
  }
  
  // Return response as-is for backward compatibility
  return response;
};

// Helper function for API calls with token parameter
const apiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  customToken?: string
): Promise<T> => {
  const config: any = {
    method,
    url,
  };

  if (data) {
    if (method === 'GET') {
      config.params = data;
    } else {
      config.data = data;
    }
  }

  if (customToken) {
    config.headers = { Authorization: `Bearer ${customToken}` };
  }

  const response = await apiClient(config);
  return extractData(response.data);
};

// API endpoints
export const AuthApi = {
  login: (email: string, password: string) =>
    apiCall<{ status: boolean; message: string; token: string; user: any }>(
      'POST',
      '/api/auth/login',
      { email, password }
    ),
  register: (name: string, email: string, password: string) =>
    apiCall<{ status: boolean; message: string; user: any }>(
      'POST',
      '/api/auth/register',
      { name, email, password }
    ),
};

export const UsersApi = {
  list: (token?: string) => apiCall('GET', '/api/users', undefined, token),
  updateRole: (id: string, role: "ADMIN" | "CUSTOMER", token?: string) =>
    apiCall('PATCH', `/api/users/${id}/role`, { role }, token),
};

export const ProductsApi = {
  list: () => apiCall('GET', '/api/products'),
  categories: () => apiCall('GET', '/api/categories'),
  addCategory: (name: string, token?: string) =>
    apiCall('POST', '/api/categories', { name }, token),
  updateCategory: (id: string, name: string, token?: string) =>
    apiCall('PATCH', `/api/categories/${id}`, { name }, token),
  deleteCategory: (id: string, token?: string) =>
    apiCall('DELETE', `/api/categories/${id}`, undefined, token),
  updateProduct: (id: string, product: any, token?: string) =>
    apiCall('PUT', `/api/products/${id}`, product, token),
  deleteProduct: (id: string, token?: string) =>
    apiCall('DELETE', `/api/products/${id}`, undefined, token),

  // Multipart create using FormData (supports image upload)
  createMultipart: async (formData: FormData, token?: string) => {
    const config: any = {
      method: 'POST',
      url: '/api/products',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiClient(config);
    return extractData(response.data);
  },
  
  // Multipart update using FormData (supports image upload)
  updateProductMultipart: async (id: string, formData: FormData, token?: string) => {
    const config: any = {
      method: 'PUT',
      url: `/api/products/${id}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await apiClient(config);
    return extractData(response.data);
  },
};

export const CartApi = {
  add: (variantId: string, quantity: number, token?: string) =>
    apiCall('POST', '/api/cart/add', { variantId, quantity }, token),
  get: (userId: string, token?: string) => apiCall('GET', `/api/cart/${userId}`, undefined, token),
  updateItem: (cartItemId: string, quantity: number, token?: string) =>
    apiCall('PATCH', `/api/cart/item/${cartItemId}`, { quantity }, token),
  removeItem: (cartItemId: string, token?: string) => 
    apiCall('DELETE', `/api/cart/item/${cartItemId}`, undefined, token),
  clear: (userId: string, token?: string) => 
    apiCall('DELETE', `/api/cart/clear/${userId}`, undefined, token),
};

export const OrdersApi = {
  list: (token?: string) => apiCall('GET', '/api/orders', undefined, token),
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
  ) => apiCall('POST', '/api/orders', payload, token),
  updateStatus: (id: string, status: string, token?: string) =>
    apiCall('PATCH', `/api/orders/${id}`, { status }, token),
};

export const AddressesApi = {
  list: (token?: string) => apiCall('GET', '/api/addresses', undefined, token),
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
  ) => apiCall('POST', '/api/addresses', payload, token),
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
  ) => apiCall('PATCH', `/api/addresses/${id}`, payload, token),
  delete: (id: string, token?: string) => 
    apiCall('DELETE', `/api/addresses/${id}`, undefined, token),
};

// Export the axios instance for custom requests
export { apiClient };
