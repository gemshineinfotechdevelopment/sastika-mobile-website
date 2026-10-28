import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PRODUCTS, SEED_ORDERS, SEED_TICKETS } from './data';
import type { AuthUser, CartLine, FlashDealConfig, FlashDealItem, Order, OrderStatus, Product, Ticket, TicketStatus, UserProfile } from './types';
import { api } from './api';
import { apiGetFlashDeal, apiUpdateFlashDeal, apiAddFlashDealItem, apiDeleteFlashDealItem } from './services/api';
import defaultLogo from './assets/logo.png';

const DEFAULT_FLASH_DEAL: FlashDealConfig = {
  isActive: false,
  title: 'Flash Deal Drop',
  subtitle: 'LIMITED STOCK LEFT',
  festivalName: 'Festival Mega Drop',
  endTime: '',
  items: [],
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
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  payment: string;
  discount: number;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  isPreVerified?: boolean;
}

interface StoreShape {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;

  cart: CartLine[];
  cartCount: number;
  addToCart: (id: string, qty?: number) => boolean;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  wishlist: string[];
  toggleWish: (id: string) => boolean;
  coupon: string;
  setCoupon: (c: string) => void;

  authPromptModal: { open: boolean; title: string; message: string; redirectUrl?: string };
  setAuthPromptModal: (modal: { open: boolean; title: string; message: string; redirectUrl?: string }) => void;
  closeAuthPrompt: () => void;
  requireAuth: (actionName?: string, redirectUrl?: string) => boolean;

  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  placeOrder: (info: CheckoutInfo) => string;
  updateOrderStatus: (id: string, status: OrderStatus, cancelReason?: string) => void;

  tickets: Ticket[];
  addTicket: (t: Omit<Ticket, 'id' | 'status' | 'tech' | 'eta'> & { userId?: string }) => string;
  setTicketStatus: (id: string, status: TicketStatus) => void;
  deleteTicket: (id: string) => void;

  logo: string;
  setLogo: (logo: string) => void;

  serverOnline: boolean;

  flashDeal: FlashDealConfig;
  updateFlashDeal: (patch: Partial<FlashDealConfig>) => void;
  addFlashDealItem: (item: Omit<FlashDealItem, 'id'>) => void;
  removeFlashDealItem: (id: string) => void;

  settings: Record<string, any>;
  updateSettings: (patch: Record<string, any>) => Promise<void>;

  user: AuthUser | null;
  token: string | null;
  loginUser: (user: AuthUser, token?: string) => void;
  logoutUser: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const DEFAULT_STORE_SETTINGS: Record<string, any> = {
  business: 'Sastikaa Mobiles',
  gstin: '33BQTPJ5275L1Z6',
  email: 'sastikaamobiles.svk@gmail.com',
  phone: '+91 95434 34344',
  address: 'Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189',
  currency: 'INR (₹)',
  gstOn: true,
  lowStockAlerts: true,
  autoInvoice: true,
  smsUpdates: true,
  codOn: true,
  codFee: 50,
  upiOn: true,
  freeShipAbove: '0',
  managerName: 'S. Ramanathan',
  managerPhone: '+91 95434 34344',
  salesRepName: 'M. Karthi',
  salesRepPhone: '+91 98401 23456',
  adminUsername: 'admin@sastikaamobiles.com',
};

const Ctx = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocalState<Product[]>('products_v4', PRODUCTS);
  const [user, setUser] = useLocalState<AuthUser | null>('auth_user_v3', null);
  const [token, setToken] = useLocalState<string | null>('customer_token', null);

  // Helper to load user-specific storage or empty for guests
  const getInitialCart = (): CartLine[] => {
    try {
      localStorage.removeItem('sastika:cart');
      const rawUser = localStorage.getItem('sastika:auth_user_v3');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u && u.id) {
          const userCart = localStorage.getItem(`sastika_cart_${u.id}`);
          if (userCart) return JSON.parse(userCart);
          if (Array.isArray(u.cart)) return u.cart;
        }
      }
    } catch {}
    return [];
  };

  const getInitialWishlist = (): string[] => {
    try {
      localStorage.removeItem('sastika:wishlist');
      const rawUser = localStorage.getItem('sastika:auth_user_v3');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u && u.id) {
          const userWish = localStorage.getItem(`sastika_wishlist_${u.id}`);
          if (userWish) return JSON.parse(userWish);
          if (Array.isArray(u.wishlist)) return u.wishlist;
        }
      }
    } catch {}
    return [];
  };

  const [cart, setCart] = useState<CartLine[]>(getInitialCart);
  const [wishlist, setWishlist] = useState<string[]>(getInitialWishlist);
  const [coupon, setCoupon] = useLocalState<string>('coupon', '');
  const [orders, setOrders] = useLocalState<Order[]>('orders', []);
  const [tickets, setTickets] = useLocalState<Ticket[]>('tickets', SEED_TICKETS);
  const [logo, setLogo] = useLocalState<string>('logo', defaultLogo);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [flashDeal, setFlashDeal] = useLocalState<FlashDealConfig>('flash_deal_v4', DEFAULT_FLASH_DEAL);
  const [settings, setSettings] = useLocalState<Record<string, any>>('settings_v2', DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    const handleSettingsChanged = () => {
      try {
        const raw = localStorage.getItem('sastika:settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    };
    window.addEventListener('sastika:settings_changed', handleSettingsChanged);
    return () => window.removeEventListener('sastika:settings_changed', handleSettingsChanged);
  }, [setSettings]);

  const [authPromptModal, setAuthPromptModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    redirectUrl?: string;
  }>({
    open: false,
    title: '',
    message: '',
  });

  const closeAuthPrompt = useCallback(() => {
    setAuthPromptModal((prev) => ({ ...prev, open: false }));
  }, []);

  const requireAuth = useCallback(
    (actionName?: string, redirectUrl?: string): boolean => {
      if (!user) {
        setAuthPromptModal({
          open: true,
          title: 'Sign In Required 🔒',
          message: `Please sign in with your email or Google account to ${actionName || 'perform this action'}. Once signed in, all your saved items will sync across all your devices!`,
          redirectUrl: redirectUrl || window.location.hash.replace(/^#/, '') || '/',
        });
        return false;
      }
      return true;
    },
    [user],
  );

  // Initialize default products only if empty, or ensure default appliances exist (run once on mount)
  useEffect(() => {
    setProducts((prev) => {
      if (!prev || prev.length === 0) return PRODUCTS;
      const hasAppliance = prev.some((p) => p.category === 'appliance');
      if (!hasAppliance) {
        const applianceSeeds = PRODUCTS.filter((p) => p.category === 'appliance');
        return [...prev, ...applianceSeeds];
      }
      return prev;
    });
  }, [setProducts]);

  // Sync with backend API on mount
  useEffect(() => {
    let mounted = true;

    const applyProducts = (serverProducts: any) => {
      const cleanProducts = Array.isArray(serverProducts) ? serverProducts : (serverProducts as any)?.data;
      if (Array.isArray(cleanProducts) && cleanProducts.length > 0) {
        setProducts((prev) => {
          const pendingOptimistic = prev.filter((p) => p.id && p.id.startsWith('n') && !cleanProducts.some((sp: Product) => sp.id === p.id));
          const merged = pendingOptimistic.length > 0 ? [...cleanProducts, ...pendingOptimistic] : cleanProducts;
          if (prev.length === merged.length && JSON.stringify(prev) === JSON.stringify(merged)) {
            return prev;
          }
          return merged;
        });
      }
    };

    const applySettings = (serverSettings: any) => {
      const cleanSettings = serverSettings?.data || serverSettings;
      if (cleanSettings && typeof cleanSettings === 'object' && Object.keys(cleanSettings).length > 0) {
        setSettings((prev) => {
          const merged = { ...prev, ...cleanSettings };
          if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
          try {
            localStorage.setItem('sastika:settings', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    };

    const applyOrders = (serverOrders: any) => {
      const cleanOrders = Array.isArray(serverOrders) ? serverOrders : (serverOrders as any)?.data;
      if (Array.isArray(cleanOrders)) {
        setOrders((prev) => (prev.length === cleanOrders.length && JSON.stringify(prev) === JSON.stringify(cleanOrders) ? prev : cleanOrders));
      }
    };

    const applyTickets = (serverTickets: any) => {
      const cleanTickets = Array.isArray(serverTickets) ? serverTickets : (serverTickets as any)?.data;
      if (Array.isArray(cleanTickets)) {
        setTickets((prev) => (prev.length === cleanTickets.length && JSON.stringify(prev) === JSON.stringify(cleanTickets) ? prev : cleanTickets));
      }
    };

    const applyFlashDeal = (serverFlashDeal: any) => {
      if (serverFlashDeal && serverFlashDeal.items) {
        setFlashDeal((prev) => (JSON.stringify(prev) === JSON.stringify(serverFlashDeal) ? prev : serverFlashDeal));
      }
    };

    async function syncBackend() {
      try {
        const health = await api.checkHealth().catch(() => null);
        if (health && mounted) {
          setServerOnline(true);
        }

        const [serverProducts, serverOrders, serverTickets, serverFlashDeal, serverSettings] = await Promise.all([
          api.getProducts().catch(() => null),
          api.getOrders().catch(() => null),
          api.getTickets().catch(() => null),
          apiGetFlashDeal().catch(() => null),
          api.getSettings().catch(() => null),
        ]);

        if (mounted) {
          applyProducts(serverProducts);
          applyOrders(serverOrders);
          applyTickets(serverTickets);
          applyFlashDeal(serverFlashDeal);
          applySettings(serverSettings);
        }
      } catch {
        if (mounted) {
          setServerOnline(false);
        }
      }
    }

    syncBackend();

    // Live continuous sync so admin updates (products, orders, tickets, flash deal) reflect on website in real-time
    const pollTimer = setInterval(async () => {
      if (!mounted) return;
      try {
        const [serverProducts, serverOrders, serverTickets, serverFlashDeal, serverSettings] = await Promise.all([
          api.getProducts().catch(() => null),
          api.getOrders().catch(() => null),
          api.getTickets().catch(() => null),
          apiGetFlashDeal().catch(() => null),
          api.getSettings().catch(() => null),
        ]);

        if (mounted) {
          applyProducts(serverProducts);
          applyOrders(serverOrders);
          applyTickets(serverTickets);
          applyFlashDeal(serverFlashDeal);
          applySettings(serverSettings);
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
        'Instant billing & warranty registered at Sastikaa Mobiles',
        'Free same-day doorstep express delivery across Sivakasi & Tamil Nadu',
      ],
      stock: item.stock || 10,
      reorderAt: 2,
      sku: `FD-${item.id.toUpperCase()}`,
      description:
        item.description ||
        `${item.name} is available on exclusive Flash Deal Drop at Sastikaa Mobiles. Grab festival special pricing with authentic store guarantee.`,
      image: item.image,
      images: item.image ? [item.image] : [],
      colors: item.color ? [item.color] : ['#2f7d6d'],
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
    (t: Omit<Ticket, 'id' | 'status' | 'tech' | 'eta'> & { userId?: string }) => {
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
        id: tempId,
        userId: t.userId,
        customer: t.customer,
        phone: t.phone,
        device: t.device,
        issue: t.issue,
        cost: t.cost,
      }).then((created) => {
        const item = (created as any)?.data || created;
        if (item && item.id) {
          setTickets((prev) => prev.map((it) => (it.id === tempId ? { ...item, status: it.status || item.status } : it)));
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

  const deleteTicket = useCallback(
    (id: string) => {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      api.deleteTicket(id).catch(() => {});
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

  const updateSettings = useCallback(
    async (patch: Record<string, any>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem('sastika:settings', JSON.stringify(next));
          window.dispatchEvent(new Event('sastika:settings_changed'));
        } catch {}
        return next;
      });
      await api.updateSettings(patch).catch(() => {});
    },
    [setSettings],
  );

  const syncWithBackend = useCallback(
    (newCart: CartLine[], newWishlist: string[]) => {
      if (!user) return;
      try {
        localStorage.setItem(`sastika_cart_${user.id}`, JSON.stringify(newCart));
        localStorage.setItem(`sastika_wishlist_${user.id}`, JSON.stringify(newWishlist));
      } catch {}
      api.syncUserData({ cart: newCart, wishlist: newWishlist }, token || undefined).catch(() => {});
    },
    [user, token],
  );

  const loginUser = useCallback(
    (u: AuthUser, tok?: string) => {
      setUser(u);
      if (tok) {
        setToken(tok);
        localStorage.setItem('auth_token', tok);
      }
      const userCart = Array.isArray(u.cart) ? u.cart : [];
      const userWishlist = Array.isArray(u.wishlist) ? u.wishlist : [];
      setCart(userCart);
      setWishlist(userWishlist);
      try {
        localStorage.setItem(`sastika_cart_${u.id}`, JSON.stringify(userCart));
        localStorage.setItem(`sastika_wishlist_${u.id}`, JSON.stringify(userWishlist));
      } catch {}

      // Background fresh fetch from server
      api.getMe(tok).then((res) => {
        if (res && res.user) {
          if (Array.isArray(res.user.cart)) {
            setCart(res.user.cart);
            try { localStorage.setItem(`sastika_cart_${u.id}`, JSON.stringify(res.user.cart)); } catch {}
          }
          if (Array.isArray(res.user.wishlist)) {
            setWishlist(res.user.wishlist);
            try { localStorage.setItem(`sastika_wishlist_${u.id}`, JSON.stringify(res.user.wishlist)); } catch {}
          }
        }
      }).catch(() => {});
    },
    [setUser, setToken],
  );

  const logoutUser = useCallback(() => {
    setUser(null);
    setToken(null);
    setCart([]);
    setWishlist([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('sastika:customer_token');
    localStorage.removeItem('sastika:auth_user_v3');
    localStorage.removeItem('sastika:cart');
    localStorage.removeItem('sastika:wishlist');
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
      addToCart: (id, qty = 1): boolean => {
        if (!user) {
          setAuthPromptModal({
            open: true,
            title: 'Sign In Required 🔒',
            message: 'Please sign in with your email or Google account to add items to your cart. Once signed in, all your cart items will sync across all your devices!',
            redirectUrl: window.location.hash.replace(/^#/, '') || '/',
          });
          return false;
        }
        setCart((prev) => {
          const found = prev.find((l) => l.id === id);
          const updated = found
            ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
            : [...prev, { id, qty }];
          syncWithBackend(updated, wishlist);
          return updated;
        });
        return true;
      },
      setQty: (id, qty) => {
        if (!user) return;
        setCart((prev) => {
          const updated = qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l));
          syncWithBackend(updated, wishlist);
          return updated;
        });
      },
      removeFromCart: (id) => {
        if (!user) return;
        setCart((prev) => {
          const updated = prev.filter((l) => l.id !== id);
          syncWithBackend(updated, wishlist);
          return updated;
        });
      },
      wishlist,
      toggleWish: (id): boolean => {
        if (!user) {
          setAuthPromptModal({
            open: true,
            title: 'Sign In Required 🔒',
            message: 'Please sign in with your email or Google account to save items to your wishlist. Your saved wishlist will sync across all your devices!',
            redirectUrl: window.location.hash.replace(/^#/, '') || '/',
          });
          return false;
        }
        setWishlist((prev) => {
          const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
          syncWithBackend(cart, updated);
          return updated;
        });
        return true;
      },
      coupon,
      setCoupon,

      authPromptModal,
      setAuthPromptModal,
      closeAuthPrompt,
      requireAuth,

      orders,
      placeOrder: (info) => {
        const items = cart
          .map((l) => {
            const p = products.find((x) => x.id === l.id) || flashDeal.items?.find((x) => x.id === l.id);
            return p ? { productId: p.id, name: p.name, qty: l.qty, price: p.price } : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
        const id = info.id || ('#SM-' + String(Math.floor(100000 + Math.random() * 899999)));
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
          paymentStatus: info.paymentStatus || 'Pending',
          razorpayOrderId: info.razorpayOrderId,
          razorpayPaymentId: info.razorpayPaymentId,
          razorpaySignature: info.razorpaySignature,
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
        syncWithBackend([], wishlist);
        setCoupon('');

        // If not pre-verified via backend Razorpay endpoint, create it now
        if (!info.isPreVerified) {
          api.createOrder({
            id,
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
        }

        return id;
      },
      setOrders,
      updateOrderStatus,

      tickets,
      addTicket,
      setTicketStatus,
      deleteTicket,

      logo,
      setLogo,

      serverOnline,
      settings,
      updateSettings,

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
      deleteTicket,
      logo,
      setLogo,
      serverOnline,
      settings,
      updateSettings,
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
      setCoupon,
      setOrders,
      setProducts,
      authPromptModal,
      closeAuthPrompt,
      requireAuth,
      syncWithBackend,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreShape {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
