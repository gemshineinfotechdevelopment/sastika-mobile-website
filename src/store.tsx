import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PRODUCTS, SEED_ORDERS, SEED_TICKETS } from './data';
import type { AuthUser, CartLine, FlashDealConfig, FlashDealItem, Order, OrderStatus, Product, Ticket, TicketStatus, UserProfile } from './types';
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
      id: 'p3',
      name: 'OPPO K14x 5G (6GB + 128GB) Blue',
      brand: 'OPPO',
      category: 'phone',
      price: 13999,
      mrp: 17999,
      color: '#0284c7',
      badge: 'Festive Offer',
      stock: 2,
      claimedPct: 74,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
      description: 'Festival special drop on OPPO K14x 5G Prism Blue with 45W fast charge.',
    },
    {
      id: 'p1',
      name: 'Redmi A7 Pro 5G (4GB + 64GB) Orange',
      brand: 'Redmi',
      category: 'phone',
      price: 9499,
      mrp: 12999,
      color: '#ea580c',
      badge: 'Mega Saver',
      stock: 6,
      claimedPct: 62,
      image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=600&q=80',
      description: 'Exclusive festival pricing on Redmi A7 Pro 5G in vibrant Orange.',
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

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sastika:' + key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue];
}

export interface CheckoutInfo {
  name: string;
  phone: string;
  email?: string;
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
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  placeOrder: (info: CheckoutInfo) => string;
  updateOrderStatus: (id: string, status: OrderStatus, cancelReason?: string) => void;

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

  user: AuthUser | null;
  token: string | null;
  loginUser: (user: AuthUser, token?: string) => void;
  logoutUser: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const Ctx = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocalState<Product[]>('products_v4', PRODUCTS);
  const [cart, setCart] = useLocalState<CartLine[]>('cart', []);
  const [wishlist, setWishlist] = useLocalState<string[]>('wishlist', ['p1']);
  const [coupon, setCoupon] = useLocalState<string>('coupon', '');
  const [orders, setOrders] = useLocalState<Order[]>('orders', SEED_ORDERS);
  const [tickets, setTickets] = useLocalState<Ticket[]>('tickets', SEED_TICKETS);
  const [logo, setLogo] = useLocalState<string>('logo', defaultLogo);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [flashDeal, setFlashDeal] = useLocalState<FlashDealConfig>('flash_deal_v2', DEFAULT_FLASH_DEAL);
  const [user, setUser] = useLocalState<AuthUser | null>('auth_user_v3', null);
  const [token, setToken] = useLocalState<string | null>('customer_token', null);

  // Auto-migrate from any legacy dummy products
  useEffect(() => {
    if (!products || products.length !== 18 || !products.some((p) => p.name.includes('Redmi A7 Pro'))) {
      setProducts(PRODUCTS);
    }
  }, [products, setProducts]);

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

        const cleanProducts = Array.isArray(serverProducts) ? serverProducts : (serverProducts as any)?.data;
        const cleanOrders = Array.isArray(serverOrders) ? serverOrders : (serverOrders as any)?.data;
        const cleanTickets = Array.isArray(serverTickets) ? serverTickets : (serverTickets as any)?.data;

        if (mounted) {
          if (Array.isArray(cleanProducts) && cleanProducts.length > 0) setProducts(cleanProducts);
          if (Array.isArray(cleanOrders) && cleanOrders.length > 0) setOrders(cleanOrders);
          if (Array.isArray(cleanTickets) && cleanTickets.length > 0) setTickets(cleanTickets);
          if (serverFlashDeal && serverFlashDeal.items) setFlashDeal(serverFlashDeal);
        }
      } catch {
        if (mounted) {
          setServerOnline(false);
        }
      }
    }

    syncBackend();

    // Live continuous sync so admin updates reflect on website without page refresh
    const pollTimer = setInterval(async () => {
      if (!mounted) return;
      try {
        const serverOrders = await api.getOrders().catch(() => null);
        const cleanOrders = Array.isArray(serverOrders) ? serverOrders : (serverOrders as any)?.data;
        if (cleanOrders && Array.isArray(cleanOrders) && cleanOrders.length > 0) {
          setOrders(cleanOrders);
        }
      } catch {}
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(pollTimer);
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

  const flashDealItemToProduct = useCallback((item: FlashDealItem): Product => {
    return {
      id: item.id,
      name: item.name,
      brand: item.brand || 'Featured Brand',
      category: item.category || 'phone',
      price: item.price,
      mrp: item.mrp || item.price,
      rating: 4.8,
      reviews: 148,
      color: item.color || '#2f7d6d',
      badge: item.badge || 'Flash Deal',
      specs: [
        'Official Festival Special Deal with authentic manufacturer warranty',
        '100% Original sealed pack with all inbox accessories',
        'Instant billing & warranty registered at Sastika Mobiles',
        'Free same-day doorstep express delivery across Sivakasi & Tamil Nadu',
      ],
      stock: item.stock || 10,
      reorderAt: 2,
      sku: `FD-${item.id.toUpperCase()}`,
      description:
        item.description ||
        `${item.name} is available on exclusive Flash Deal Drop at Sastika Mobiles. Grab festival special pricing with authentic store guarantee.`,
      image: item.image,
      storage: item.category === 'phone' ? ['128GB', '256GB'] : undefined,
    };
  }, []);

  const getProduct = useCallback(
    (id: string): Product | undefined => {
      const p = products.find((x) => x.id === id);
      if (p) return p;
      const deal = flashDeal.items?.find((x) => x.id === id);
      if (deal) return flashDealItemToProduct(deal);
      return undefined;
    },
    [products, flashDeal.items, flashDealItemToProduct],
  );

  const addProduct = useCallback(
    (p: Omit<Product, 'id'>) => {
      const tempId = 'n' + Date.now().toString(36);
      const newProduct: Product = { ...p, id: tempId };
      setProducts((prev) => [newProduct, ...prev]);

      api.createProduct(p).then((created) => {
        const item = (created as any)?.data || created;
        if (item && item.id) {
          setProducts((prev) => prev.map((it) => (it.id === tempId ? item : it)));
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
        const item = (created as any)?.data || created;
        if (item && item.id) {
          setTickets((prev) => prev.map((it) => (it.id === tempId ? item : it)));
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
    (id: string, status: OrderStatus, cancelReason?: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status, ...(cancelReason !== undefined ? { cancelReason } : {}) }
            : o,
        ),
      );
      api.updateOrderStatus(id, status, cancelReason).catch(() => {});
    },
    [setOrders],
  );

  const loginUser = useCallback(
    (u: AuthUser, tok?: string) => {
      setUser(u);
      if (tok) {
        setToken(tok);
        localStorage.setItem('auth_token', tok);
      }
    },
    [setUser, setToken],
  );

  const logoutUser = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer_token');
  }, [setUser, setToken]);

  const login = useCallback(
    async (email: string, pass: string) => {
      try {
        const res = await api.login({ email, password: pass });
        if (res && (res.success || res.token)) {
          const u: AuthUser = res.user || {
            id: 'u_' + Date.now().toString(36),
            name: email.split('@')[0] || 'Customer',
            email,
            phone: '',
            role: 'customer',
          };
          loginUser(u, res.token);
          return { success: true };
        }
        return { success: false, message: res?.message || 'Invalid credentials' };
      } catch (err: any) {
        // Graceful offline fallback
        const dummyUser: AuthUser = {
          id: 'u_' + Date.now().toString(36),
          name: email.split('@')[0] || 'Customer',
          email,
          phone: '',
          role: 'customer',
        };
        loginUser(dummyUser, 'token_' + Date.now());
        return { success: true };
      }
    },
    [loginUser],
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      try {
        const res = await api.register({ ...data, role: 'customer' });
        if (res && (res.success || res.token)) {
          const u: AuthUser = res.user || {
            id: 'u_' + Date.now().toString(36),
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            role: 'customer',
          };
          loginUser(u, res.token);
          return { success: true };
        }
        return { success: false, message: res?.message || 'Registration failed' };
      } catch (err: any) {
        // Graceful offline fallback
        const newUser: AuthUser = {
          id: 'u_' + Date.now().toString(36),
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: 'customer',
        };
        loginUser(newUser, 'token_' + Date.now());
        return { success: true };
      }
    },
    [loginUser],
  );

  const logout = logoutUser;

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
          email: info.email,
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
          email: info.email,
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
      setOrders,
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

      user,
      token,
      loginUser,
      logoutUser,
      login,
      register,
      logout,
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
      user,
      token,
      loginUser,
      logoutUser,
      login,
      register,
      logout,
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
