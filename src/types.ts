export type Category = 'phone' | 'accessory' | 'audio';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  color: string;
  badge?: string;
  specs: string[];
  stock: number;
  reorderAt: number;
  sku: string;
  description: string;
  storage?: string[];
  image?: string;
}

export interface CartLine {
  id: string;
  qty: number;
}

export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: string;
  date: string;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Ready' | 'Closed';

export interface Ticket {
  id: string;
  customer: string;
  phone: string;
  device: string;
  issue: string;
  status: TicketStatus;
  tech: string;
  eta: string;
  cost: number;
}

export interface Testimonial {
  name: string;
  meta: string;
  text: string;
}
