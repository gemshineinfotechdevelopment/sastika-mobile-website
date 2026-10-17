import type { Order, Product, Ticket } from '../types';

const getDefaultApiUrl = () => {
  return '/api';
};

const RAW_API_BASE_URL = (import.meta.env.VITE_API_URL as string) || getDefaultApiUrl();
const API_BASE_URL = RAW_API_BASE_URL.endsWith('/') ? RAW_API_BASE_URL.slice(0, -1) : RAW_API_BASE_URL;

/**
 * Helper to fetch from API with automatic error handling and fallback support
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const res = await fetch(`${API_BASE_URL}${formattedEndpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      console.warn(`[API] HTTP error on ${endpoint}:`, res.statusText);
      return null;
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[API] Failed to connect to server at ${API_BASE_URL}${endpoint}:`, err);
    return null;
  }
}

// Product API
export const apiGetProducts = () => apiFetch<Product[]>('/products');
export const apiGetProduct = (id: string) => apiFetch<Product>(`/products/${id}`);
export const apiCreateProduct = (data: Partial<Product>) =>
  apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateProduct = (id: string, patch: Partial<Product>) =>
  apiFetch<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
export const apiDeleteProduct = (id: string) =>
  apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' });

// Order API
export const apiGetOrders = () => apiFetch<Order[]>('/orders');
export const apiCreateOrder = (data: Partial<Order>) =>
  apiFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateOrderStatus = (id: string, status: string) =>
  apiFetch<Order>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// Ticket API
export const apiGetTickets = () => apiFetch<Ticket[]>('/tickets');
export const apiCreateTicket = (data: Partial<Ticket>) =>
  apiFetch<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateTicket = (id: string, patch: Partial<Ticket>) =>
  apiFetch<Ticket>(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(patch) });

// Flash Deal API
export const apiGetFlashDeal = () => apiFetch<any>('/flash-deals');
export const apiUpdateFlashDeal = (data: any) =>
  apiFetch<any>('/flash-deals', { method: 'PUT', body: JSON.stringify(data) });
export const apiAddFlashDealItem = (data: any) =>
  apiFetch<any>('/flash-deals/items', { method: 'POST', body: JSON.stringify(data) });
export const apiDeleteFlashDealItem = (id: string) =>
  apiFetch<any>(`/flash-deals/items/${id}`, { method: 'DELETE' });

// Health Check
export const apiCheckHealth = () => apiFetch<{ status: string; database: string }>('/health');
