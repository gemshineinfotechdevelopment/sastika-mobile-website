import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PRODUCTS, SEED_ORDERS, SEED_TICKETS } from './data';
import type { CartLine, FlashDealConfig, FlashDealItem, Order, OrderStatus, Product, Ticket, TicketStatus } from './types';
import { api } from './api';
import { apiGetFlashDeal, apiUpdateFlashDeal, apiAddFlashDealItem, apiDeleteFlashDealItem } from './services/api';
import defaultLogo from './assets/logo.png';

const DEFAULT_FLASH_DEAL: FlashDealConfig = {
  isActive: true,
  title: 'Flash Deal Drop',
  subtitle: 'LIMITED STOCK LEFT',
  festivalName: 'Festive Mega Drop',
  endTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
  items: [
    {
      id: 'fd1',
      name: 'OnePlus Nord CE4 5G',
      brand: 'OnePlus',
      category: 'phone',
      price: 21999,
      mrp: 26999,
      color: '#4b6b5a',
      badge: 'Festive Offer',
      stock: 14,
      claimedPct: 74,
      description: 'Festival special drop with bank discount included.',
    },
    {
      id: 'fd2',
      name: 'Redmi Note 13 Pro+ 5G',
      brand: 'Xiaomi',
      category: 'phone',
      price: 27999,
      mrp: 33999,
      color: '#3a4a7a',
      badge: 'Mega Saver',
      stock: 8,
      claimedPct: 62,
      description: 'Exclusive festival pricing with free tempered glass.',
    },
  ],
};

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

  logo: string;
  setLogo: (logo: string) => void;

  serverOnline: boolean;

  flashDeal: FlashDealConfig;
  updateFlashDeal: (patch: Partial<FlashDealConfig>) => void;
  addFlashDealItem: (item: Omit<FlashDealItem, 'id'>) => void;
  removeFlashDealItem: (id: string) => void;
}

const Ctx = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocalState<Product[]>('products', PRODUCTS);
  const [cart, setCart] = useLocalState<CartLine[]>('cart', []);
  const [wishlist, setWishlist] = useLocalState<string[]>('wishlist', ['p1']);
  const [coupon, setCoupon] = useLocalState<string>('coupon', '');
  const [orders, setOrders] = useLocalState<Order[]>('orders', SEED_ORDERS);
  const [tickets, setTickets] = useLocalState<Ticket[]>('tickets', SEED_TICKETS);
  const [logo, setLogo] = useLocalState<string>('logo', defaultLogo);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [flashDeal, setFlashDeal] = useLocalState<FlashDealConfig>('flash_deal', DEFAULT_FLASH_DEAL);

  // Sync with backend API on mount
  useEffect(() => {
    let mounted = true;

    async function syncBackend() {
      try {
        const health = await api.checkHealth().catch(() => null);
        if (health && mounted) {
          setServerOnline(true);
        }

        const [serverProducts, serverOrders, serverTickets, serverFlashDeal] = await Promise.all([
          api.getProducts().catch(() => null),
          api.getOrders().catch(() => null),
          api.getTickets().catch(() => null),
          apiGetFlashDeal().catch(() => null),
        ]);

        if (mounted) {
          if (serverProducts && serverProducts.length > 0) setProducts(serverProducts);
          if (serverOrders && serverOrders.length > 0) setOrders(serverOrders);
          if (serverTickets && serverTickets.length > 0) setTickets(serverTickets);
          if (serverFlashDeal && serverFlashDeal.items) setFlashDeal(serverFlashDeal);
        }
      } catch {
        if (mounted) {
          setServerOnline(false);
        }
      }
    }

    syncBackend();
    return () => {
      mounted = false;
    };
  }, [setProducts, setOrders, setTickets, setFlashDeal]);

  const updateFlashDeal = useCallback(
    (patch: Partial<FlashDealConfig>) => {
      setFlashDeal((prev) => {
        const updated = { ...prev, ...patch };
        apiUpdateFlashDeal(updated).catch(() => {});
        return updated;
      });
    },
    [setFlashDeal],
  );

  const addFlashDealItem = useCallback(
    (item: Omit<FlashDealItem, 'id'>) => {
      const newItem: FlashDealItem = {
        ...item,
        id: 'fd_' + Date.now().toString(36),
      };
      setFlashDeal((prev) => {
        const updated = { ...prev, items: [newItem, ...(prev.items || [])] };
        apiAddFlashDealItem(newItem).catch(() => {});
        return updated;
      });
    },
    [setFlashDeal],
  );

  const removeFlashDealItem = useCallback(
    (id: string) => {
      setFlashDeal((prev) => {
        const updated = { ...prev, items: (prev.items || []).filter((it) => it.id !== id) };
        apiDeleteFlashDealItem(id).catch(() => {});
        return updated;
      });
    },
    [setFlashDeal],
  );

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id) || (flashDeal.items?.find((x) => x.id === id) as unknown as Product | undefined),
    [products, flashDeal.items],
  );

  const addProduct = useCallback(
    (p: Omit<Product, 'id'>) => {
      const tempId = 'n' + Date.now().toString(36);
      const newProduct: Product = { ...p, id: tempId };
      setProducts((prev) => [newProduct, ...prev]);

      api.createProduct(p).then((created) => {
        if (created) {
          setProducts((prev) => prev.map((item) => (item.id === tempId ? created : item)));
        }
      }).catch(() => {});
    },
    [setProducts],
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      api.updateProduct(id, patch).catch(() => {});
    },
    [setProducts],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      api.deleteProduct(id).catch(() => {});
    },
    [setProducts],
  );

  const addTicket = useCallback(
    (t: Omit<Ticket, 'id' | 'status' | 'tech' | 'eta'>) => {
      const tempId = 'SR-' + String(5522 + tickets.length);
      const newTicket: Ticket = {
        ...t,
        id: tempId,
        status: 'Open',
        tech: 'Unassigned',
        eta: 'Within 24h',
      };
      setTickets((prev) => [newTicket, ...prev]);

      api.createTicket({
        customer: t.customer,
        phone: t.phone,
        device: t.device,
        issue: t.issue,
        cost: t.cost,
      }).then((created) => {
        if (created) {
          setTickets((prev) => prev.map((item) => (item.id === tempId ? created : item)));
        }
      }).catch(() => {});

      return tempId;
    },
    [tickets.length, setTickets],
  );

  const setTicketStatus = useCallback(
    (id: string, status: TicketStatus) => {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      api.updateTicketStatus(id, status).catch(() => {});
    },
    [setTickets],
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      api.updateOrderStatus(id, status).catch(() => {});
    },
    [setOrders],
  );

  const value = useMemo<StoreShape>(
    () => ({
      products,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,

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
            const p = products.find((x) => x.id === l.id) || flashDeal.items?.find((x) => x.id === l.id);
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

        api.createOrder({
          customer: info.name,
          phone: info.phone,
          city: info.city,
          address: info.address,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
          total: Math.max(0, subtotal - info.discount),
          payment: info.payment,
        }).catch(() => {});

        return id;
      },
      updateOrderStatus,

      tickets,
      addTicket,
      setTicketStatus,

      logo,
      setLogo,

      serverOnline,

      flashDeal,
      updateFlashDeal,
      addFlashDealItem,
      removeFlashDealItem,
    }),
    [
      products,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      cart,
      wishlist,
      coupon,
      orders,
      updateOrderStatus,
      tickets,
      addTicket,
      setTicketStatus,
      logo,
      setLogo,
      serverOnline,
      flashDeal,
      updateFlashDeal,
      addFlashDealItem,
      removeFlashDealItem,
      setCart,
      setWishlist,
      setCoupon,
      setOrders,
      setProducts,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreShape {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
