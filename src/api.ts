import type { Order, OrderStatus, Product, Ticket, TicketStatus } from './types';

const getDefaultApiUrl = () => {
  return '/api';
};

const RAW_API_BASE_URL = (import.meta.env.VITE_API_URL as string) || getDefaultApiUrl();
export const API_BASE_URL = RAW_API_BASE_URL.endsWith('/') ? RAW_API_BASE_URL.slice(0, -1) : RAW_API_BASE_URL;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || errorBody.error || `Request failed with status ${response.status}`);
  }

  const json = await response.json();
  if (json && typeof json === 'object' && 'data' in json && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; port: number }>('/health'),

  // Products
  getProducts: (params?: { category?: string; brand?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.brand) searchParams.append('brand', params.brand);
    if (params?.search) searchParams.append('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<Product[]>(`/products${query}`);
  },
  getProductById: (id: string) => request<Product>(`/products/${id}`),
  createProduct: (product: Omit<Product, 'id'>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateProduct: (id: string, patch: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
  deleteProduct: (id: string) =>
    request<{ message: string; id: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders
  getOrders: () => request<Order[]>('/orders'),
  createOrder: (order: {
    id?: string;
    customer: string;
    phone: string;
    email?: string;
    city: string;
    address: string;
    items: Array<{ productId: string; name: string; qty: number; price: number }>;
    total: number;
    payment: string;
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateOrderStatus: (id: string, status: OrderStatus, cancelReason?: string) =>
    request<Order>(`/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...(cancelReason !== undefined ? { cancelReason } : {}) }),
    }),

  // Tickets
  getTickets: () => request<Ticket[]>('/tickets'),
  createTicket: (ticket: {
    id?: string;
    userId?: string;
    customer: string;
    phone: string;
    device: string;
    issue: string;
    cost: number;
  }) =>
    request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    }),
  updateTicketStatus: (id: string, status: TicketStatus) =>
    request<Ticket>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteTicket: (id: string) =>
    request<{ message: string }>(`/tickets/${id}`, {
      method: 'DELETE',
    }),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    request<{ success: boolean; token: string; user: any; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  googleLogin: (data: { credential?: string; code?: string; redirectUri?: string; accessToken?: string }) =>
    request<{ success: boolean; token: string; user: any; message?: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getGoogleAuthUrl: () =>
    request<{ success: boolean; configured: boolean; url?: string; clientId?: string; message?: string }>(
      '/auth/google/url'
    ),
  getMe: (token?: string) => {
    const t = token || localStorage.getItem('auth_token') || localStorage.getItem('sastika:customer_token');
    return request<{ success: boolean; user: any }>('/auth/me', {
      method: 'GET',
      headers: t ? { Authorization: `Bearer ${t.replace(/^"|"$/g, '')}` } : {},
    });
  },
  syncUserData: (data: { cart: Array<{ id: string; qty: number }>; wishlist: string[] }, token?: string) => {
    const t = token || localStorage.getItem('auth_token') || localStorage.getItem('sastika:customer_token');
    return request<{ success: boolean; cart: any[]; wishlist: string[] }>('/auth/sync', {
      method: 'PUT',
      headers: t ? { Authorization: `Bearer ${t.replace(/^"|"$/g, '')}` } : {},
      body: JSON.stringify(data),
    });
  },
};

