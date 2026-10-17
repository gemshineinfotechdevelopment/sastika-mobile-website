import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PRODUCTS, SEED_ORDERS, SEED_TICKETS } from './data';
import type { CartLine, Order, OrderStatus, Product, Ticket, TicketStatus } from './types';

function useLocalState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem('sastika:' + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('sastika:' + key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);
  return [value, setValue];
}

export interface CheckoutInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  payment: string;
  discount: number;
}

interface StoreShape {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;

  cart: CartLine[];
  cartCount: number;
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
  coupon: string;
  setCoupon: (c: string) => void;

  orders: Order[];
  placeOrder: (info: CheckoutInfo) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  tickets: Ticket[];
  addTicket: (t: Omit<Ticket, 'id' | 'status' | 'tech' | 'eta'>) => string;
  setTicketStatus: (id: string, status: TicketStatus) => void;
}

const Ctx = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocalState<Product[]>('products', PRODUCTS);
  const [cart, setCart] = useLocalState<CartLine[]>('cart', []);
  const [wishlist, setWishlist] = useLocalState<string[]>('wishlist', ['p1']);
  const [coupon, setCoupon] = useLocalState<string>('coupon', '');
  const [orders, setOrders] = useLocalState<Order[]>('orders', SEED_ORDERS);
  const [tickets, setTickets] = useLocalState<Ticket[]>('tickets', SEED_TICKETS);

  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  const value = useMemo<StoreShape>(
    () => ({
      products,
      getProduct,
      addProduct: (p) =>
        setProducts((prev) => [{ ...p, id: 'n' + Date.now().toString(36) }, ...prev]),
      updateProduct: (id, patch) =>
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      deleteProduct: (id) => setProducts((prev) => prev.filter((p) => p.id !== id)),

      cart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      addToCart: (id, qty = 1) =>
        setCart((prev) => {
          const found = prev.find((l) => l.id === id);
          return found
            ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
            : [...prev, { id, qty }];
        }),
      setQty: (id, qty) =>
        setCart((prev) => (qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)))),
      removeFromCart: (id) => setCart((prev) => prev.filter((l) => l.id !== id)),
      wishlist,
      toggleWish: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      coupon,
      setCoupon,

      orders,
      placeOrder: (info) => {
        const items = cart
          .map((l) => {
            const p = products.find((x) => x.id === l.id);
            return p ? { productId: p.id, name: p.name, qty: l.qty, price: p.price } : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
        const id = '#SM-' + String(Math.floor(100000 + Math.random() * 899999));
        const order: Order = {
          id,
          customer: info.name,
          phone: info.phone,
          city: info.city,
          address: info.address,
          items,
          total: Math.max(0, subtotal - info.discount),
          status: 'Placed',
          payment: info.payment,
          date: new Date().toISOString().slice(0, 10),
        };
        setOrders((prev) => [order, ...prev]);
        setProducts((prev) =>
          prev.map((p) => {
            const line = items.find((i) => i.productId === p.id);
            return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
          }),
        );
        setCart([]);
        setCoupon('');
        return id;
      },
      updateOrderStatus: (id, status) =>
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))),

      tickets,
      addTicket: (t) => {
        const id = 'SR-' + String(5522 + tickets.length);
        setTickets((prev) => [{ ...t, id, status: 'Open', tech: 'Unassigned', eta: 'Within 24h' }, ...prev]);
        return id;
      },
      setTicketStatus: (id, status) =>
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t))),
    }),
    [products, cart, wishlist, coupon, orders, tickets, getProduct, setProducts, setCart, setWishlist, setCoupon, setOrders, setTickets],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreShape {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
