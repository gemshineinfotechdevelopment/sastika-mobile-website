import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import { api } from '../api';
import type { OrderStatus, TicketStatus } from '../types';
import Icon, { type IconName } from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { CountUp, Reveal } from '../components/anim';
import { Btn, Pill, input } from './ui';
import ProductCard from './ProductCard';

const FLOW: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Delivered'];

const TICKET_FLOW: { s: TicketStatus; label: string; desc: string }[] = [
  { s: 'Open', label: 'Received', desc: 'Registered at Sivakasi repair desk' },
  { s: 'In Progress', label: 'In Repair', desc: 'Hardware diagnosis & replacement' },
  { s: 'Ready', label: 'Ready', desc: 'Tested & ready for store pickup' },
  { s: 'Closed', label: 'Delivered', desc: 'Handed over to customer' },
];

const getTicketStage = (st: TicketStatus): number => {
  if (st === 'Closed') return 3;
  if (st === 'Ready') return 2;
  if (st === 'In Progress') return 1;
  return 0;
};

export default function Account() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { orders, wishlist, products, tickets, cartCount, user, logout, setOrders } = useStore();

  // Auto-sync orders every 3 seconds so admin status changes & cancellations show in real-time
  useEffect(() => {
    let active = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getOrders();
        if (active && Array.isArray(fresh) && fresh.length > 0) {
          setOrders(fresh);
        }
      } catch {
        // silent fallback
      }
    };
    fetchLatest();
    const interval = setInterval(fetchLatest, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [setOrders]);

  const initialTab = (params.get('tab') as 'orders' | 'wishlist' | 'service') || 'orders';
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'service'>(
    ['orders', 'wishlist', 'service'].includes(initialTab) ? initialTab : 'orders'
  );

  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState(params.get('id') ?? '');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');

  // Care Ticket filtering state
  const [ticketFilter, setTicketFilter] = useState<'All' | TicketStatus>('All');
  const [ticketQ, setTicketQ] = useState('');

  const wished = products.filter((p) => wishlist.includes(p.id));

  const tone = (s: OrderStatus) =>
    s === 'Delivered' ? 'success' : s === 'Cancelled' ? 'danger' : s === 'Shipped' ? 'accent' : s === 'Packed' ? 'warn' : 'tint';

  const ticketTone = (s: TicketStatus) =>
    s === 'Ready' || s === 'Closed' ? 'success' : s === 'In Progress' ? 'accent' : 'tint';

  // Normalize tickets safely to handle any backend / localStorage shape
  const normalizedTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    return tickets.map((raw: any) => {
      const t = raw?.data || raw || {};
      const validStatuses: TicketStatus[] = ['Open', 'In Progress', 'Ready', 'Closed'];
      const status: TicketStatus = validStatuses.includes(t.status) ? t.status : 'Open';
      return {
        id: String(t.id || 'SR-5500'),
        customer: String(t.customer || 'Customer'),
        phone: String(t.phone || ''),
        device: String(t.device || 'Smartphone Device'),
        issue: String(t.issue || 'Service & Repair'),
        status,
        tech: String(t.tech || 'Sastika Tech Desk'),
        eta: String(t.eta || 'Within 24 Hours'),
        cost: typeof t.cost === 'number' ? t.cost : Number(t.cost) || 0,
      };
    });
  }, [tickets]);

  // User's own orders strictly matching logged-in customer's email or 10-digit mobile number
  const userOrders = useMemo(() => {
    if (!user || !Array.isArray(orders)) return [];

    const userEmail = (user.email || '').trim().toLowerCase();
    const userPhoneClean = (user.phone || '').replace(/\D/g, '').slice(-10);
    const userName = (user.name || '').trim().toLowerCase();

    return orders.filter((o: any) => {
      const orderEmail = (o.email || '').trim().toLowerCase();
      const orderPhoneClean = (o.phone || '').replace(/\D/g, '').slice(-10);
      const orderCustomer = (o.customer || '').trim().toLowerCase();

      // Match email if both exist
      if (userEmail && orderEmail && userEmail === orderEmail) return true;

      // Match 10-digit phone number if both exist
      if (userPhoneClean.length >= 10 && orderPhoneClean.length >= 10 && userPhoneClean === orderPhoneClean) {
        return true;
      }

      // Fallback match by exact customer name ONLY if order has no email or phone
      if (!orderEmail && !orderPhoneClean && userName && orderCustomer && userName === orderCustomer) {
        return true;
      }

      return false;
    });
  }, [orders, user]);

  // User's own care tickets strictly matching logged-in customer's phone or name
  const userTickets = useMemo(() => {
    if (!user || !Array.isArray(normalizedTickets)) return [];

    const userPhoneClean = (user.phone || '').replace(/\D/g, '').slice(-10);
    const userName = (user.name || '').trim().toLowerCase();

    return normalizedTickets.filter((t: any) => {
      const tPhoneClean = (t.phone || '').replace(/\D/g, '').slice(-10);
      const tCustomer = (t.customer || '').trim().toLowerCase();

      if (userPhoneClean.length >= 10 && tPhoneClean.length >= 10 && userPhoneClean === tPhoneClean) {
        return true;
      }

      if (userName && tCustomer && (userName === tCustomer || tCustomer.includes(userName) || userName.includes(tCustomer))) {
        return true;
      }

      return false;
    });
  }, [normalizedTickets, user]);

  // Filtered orders list (only from user's own orders)
  const filteredOrders = useMemo(() => {
    return userOrders.filter((o) => {
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      const matchQuery =
        !q.trim() ||
        (o.id || '').toLowerCase().includes(q.toLowerCase()) ||
        (o.customer || '').toLowerCase().includes(q.toLowerCase()) ||
        (o.items || []).some((item) => (item.name || '').toLowerCase().includes(q.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }, [userOrders, q, statusFilter]);

  // Filtered care tickets list (only from user's own tickets)
  const filteredTickets = useMemo(() => {
    return userTickets.filter((t) => {
      const matchStatus = ticketFilter === 'All' || t.status === ticketFilter;
      const qLower = ticketQ.trim().toLowerCase();
      const matchQuery =
        !qLower ||
        t.id.toLowerCase().includes(qLower) ||
        t.customer.toLowerCase().includes(qLower) ||
        t.device.toLowerCase().includes(qLower) ||
        t.issue.toLowerCase().includes(qLower);
      return matchStatus && matchQuery;
    });
  }, [userTickets, ticketFilter, ticketQ]);

  return (
    <div className="site-page-container" style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ padding: '16px 0 0' }}>
        {/* Customer Profile Banner if logged in */}
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '16px 16px',
              borderRadius: 20,
              background: `linear-gradient(135deg, #072a25 0%, ${C.primaryDark} 50%, #052622 100%)`,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(7,42,37,0.22)',
              border: '1px solid rgba(255,255,255,0.1)',
              animation: 'fadeUp .5s ease both',
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: C.accent,
                  color: C.primaryDark,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 20,
                  fontWeight: 900,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(246,196,69,0.3)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 850, fontSize: 16, letterSpacing: 0.2 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2, wordBreak: 'break-word' }}>
                  {user.phone ? user.phone : 'Mobile verified'} · {user.email}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Pill tone="accent">GOLD CLUB MEMBER</Pill>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>✓ Warranty Enrolled</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="tap"
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '7px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all .2s ease',
                flexShrink: 0,
              }}
            >
              <Icon name="logout" size={13} color="#fca5a5" />
              Sign Out
            </button>
          </div>
        ) : (
          /* Header Hero Card for guests */
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              padding: '18px 16px',
              borderRadius: 20,
              background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
              color: '#fff',
              boxShadow: '0 8px 30px rgba(11,74,67,0.14)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(246,196,69,.15)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: C.accent,
                  color: C.primaryDark,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,.15)',
                  flexShrink: 0,
                }}
              >
                <Icon name="truck" size={24} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, color: C.accent }}>
                  REAL-TIME DISPATCH &amp; CARE
                </div>
                <h1 style={{ margin: '2px 0 2px', fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}>
                  Track &amp; Orders
                </h1>
                <div style={{ fontSize: 11.5, opacity: 0.85, lineHeight: 1.3 }}>
                  Check live shipping stages, ETA &amp; invoices
                </div>
              </div>
            </div>

            <button
              onClick={() => nav('/login')}
              className="tap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 12,
                background: C.accent,
                color: C.primaryDark,
                fontWeight: 800,
                fontSize: 12.5,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            >
              <Icon name="user" size={15} /> Sign In
            </button>
          </div>
        )}

        {/* Quick Stats Grid - Compact responsive 3-col */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { l: 'Orders', v: userOrders.length, ic: 'truck' as const },
            { l: 'Wishlist', v: wishlist.length, ic: 'heart' as const },
            { l: 'Repairs', v: userTickets.length, ic: 'tool' as const },
          ].map((s, idx) => (
            <Reveal key={s.l} delay={idx * 80}>
              <div
                style={{
                  background: '#fff',
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 16,
                  padding: '10px 6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 3,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    background: C.tint,
                    color: C.primary,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={s.ic} size={15} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: C.primaryDark, lineHeight: 1.1 }}>
                  <CountUp to={s.v} duration={800} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {cartCount > 0 && (
          <button
            className="tap"
            onClick={() => nav('/cart')}
            style={{
              width: '100%',
              marginTop: 4,
              marginBottom: 12,
              padding: '10px 14px',
              borderRadius: 14,
              background: C.warnSoft,
              color: C.warn,
              fontWeight: 800,
              fontSize: 12.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Icon name="cart" size={15} /> {cartCount} item{cartCount > 1 ? 's' : ''} in cart ready for checkout
            </span>
            <Icon name="right" size={15} />
          </button>
        )}

        {/* Tab Buttons - Compact labels that never wrap awkwardly */}
        <div style={{ marginTop: 12, display: 'flex', gap: 5, background: C.tint, padding: 4, borderRadius: 14 }}>
          {(
            [
              { k: 'orders' as const, l: `Orders (${userOrders.length})`, ic: 'truck' as IconName },
              { k: 'wishlist' as const, l: `Wishlist (${wishlist.length})`, ic: 'heart' as IconName },
              { k: 'service' as const, l: `Care (${userTickets.length})`, ic: 'tool' as IconName },
            ]
          ).map(({ k, l, ic }) => (
            <button
              key={k}
              type="button"
              className="tap"
              onClick={() => setTab(k)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '8px 2px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 11.5,
                background: tab === k ? '#fff' : 'transparent',
                color: tab === k ? C.primary : C.muted,
                boxShadow: tab === k ? '0 2px 8px rgba(11,74,67,.12)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all .2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon name={ic} size={14} color={tab === k ? C.primary : C.muted} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div key={tab} style={{ marginTop: 18, animation: 'fadeUp .3s ease both' }}>
        {/* ==================== ORDERS TAB ==================== */}
        {tab === 'orders' && (
          <div>
            {/* Search & Filter Bar */}
            <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }}>
                    <Icon name="search" size={16} />
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by Order ID or item..."
                    style={{
                      ...input,
                      width: '100%',
                      paddingLeft: 36,
                      paddingRight: q ? 30 : 12,
                      fontSize: 12.5,
                      height: 40,
                      boxSizing: 'border-box',
                    }}
                  />
                  {q && (
                    <button
                      type="button"
                      onClick={() => setQ('')}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: C.muted, cursor: 'pointer', padding: 4 }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Inline Status Filter Dropdown right next to search box */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    style={{
                      ...input,
                      height: 40,
                      padding: '0 28px 0 10px',
                      borderRadius: 12,
                      background: statusFilter === 'All' ? C.tint2 : C.primary,
                      color: statusFilter === 'All' ? C.primaryDark : '#fff',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      border: `1.5px solid ${statusFilter === 'All' ? C.border : C.primary}`,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                    }}
                  >
                    <option value="All">All ({userOrders.length})</option>
                    <option value="Placed">Placed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: statusFilter === 'All' ? C.muted : '#fff' }}>
                    <Icon name="down" size={13} />
                  </span>
                </div>
              </div>

              {/* Status Chips Row */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }} className="hide-scroll">
                {(['All', 'Placed', 'Packed', 'Shipped', 'Delivered'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className="tap"
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 99,
                      fontSize: 11.5,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      background: statusFilter === st ? C.primary : C.tint,
                      color: statusFilter === st ? '#fff' : C.primary,
                      transition: 'all .15s ease',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {!user ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}` }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.tint, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: C.primary }}>
                  <Icon name="truck" size={32} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>Sign in to View Your Orders</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: C.muted, maxWidth: 380, marginInline: 'auto' }}>
                  Please sign in with your email or mobile number to track live delivery status and view order history.
                </p>
                <Btn onClick={() => nav('/login?redirect=' + encodeURIComponent('/orders'))}>
                  <Icon name="user" size={16} /> Sign In to Your Account
                </Btn>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}` }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.tint, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: C.primary }}>
                  <Icon name="truck" size={32} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>No Orders Found</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: C.muted, maxWidth: 360, marginInline: 'auto' }}>
                  {q || statusFilter !== 'All'
                    ? 'No orders matched your search or status filter. Try clearing filters.'
                    : "You haven't placed any orders yet. Explore our genuine 5G smartphones and accessories!"}
                </p>
                {q || statusFilter !== 'All' ? (
                  <Btn onClick={() => { setQ(''); setStatusFilter('All'); }} variant="ghost">Clear Filters</Btn>
                ) : (
                  <Btn onClick={() => nav('/mobiles')}>Explore Mobiles</Btn>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {filteredOrders.map((o, idx) => {
                  const isOpen = open === o.id;
                  const stage = FLOW.indexOf(o.status);
                  const first = products.find((p) => p.id === o.items[0]?.productId);

                  return (
                    <div
                      key={o.id}
                      style={{
                        background: '#fff',
                        borderRadius: 22,
                        border: `1.5px solid ${isOpen ? C.primary : C.border}`,
                        overflow: 'hidden',
                        boxShadow: isOpen ? '0 8px 26px rgba(11,74,67,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all .25s ease',
                        animation: `fadeUp .35s ease ${idx * 40}ms both`,
                      }}
                    >
                      {/* Order Summary Header Row - 2-tier mobile-first layout */}
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : o.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          padding: '14px 14px',
                          textAlign: 'left',
                          background: isOpen ? C.tint2 : '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background .2s ease',
                        }}
                      >
                        {/* Top Tier: Product Thumbnail + ID/Date + Price/Pill + Chevron */}
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: '#fff',
                              border: `1px solid ${C.border}`,
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                              overflow: 'hidden',
                            }}
                          >
                            {first ? (
                              <ProductArt category={first.category} color={first.color} size={36} image={first.image} alt={first.name} />
                            ) : (
                              <Icon name="box" size={22} color={C.primary} />
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 900, fontSize: 14, color: C.primaryDark, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
                              {o.id}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                              📅 {o.date}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 900, fontSize: 14.5, color: C.primaryDark }}>
                              {money(o.total)}
                            </div>
                            <div style={{ marginTop: 2 }}>
                              <Pill tone={tone(o.status)}>{o.status.toUpperCase()}</Pill>
                            </div>
                          </div>

                          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease', color: C.muted, flexShrink: 0 }}>
                            <Icon name="down" size={15} />
                          </span>
                        </div>

                        {/* Bottom Tier: Items Summary Preview */}
                        <div
                          style={{
                            width: '100%',
                            fontSize: 12,
                            color: C.text,
                            fontWeight: 600,
                            paddingTop: 8,
                            borderTop: `1px dashed ${C.border}`,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span style={{ color: C.muted, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Items:</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {(o.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ')}
                          </span>
                        </div>
                      </button>

                      {/* Expandable Order Details & Tracking Progress */}
                      {isOpen && (
                        <div style={{ padding: '14px 14px 18px', borderTop: `1px solid ${C.border}`, background: '#fff' }}>
                          {/* Live Visual Tracking Stepper */}
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.1, color: C.primarySoft, marginBottom: 10, textTransform: 'uppercase' }}>
                              Live Order Tracking Status
                            </div>

                            {o.status === 'Cancelled' ? (
                              <div
                                style={{
                                  padding: '14px 16px',
                                  background: 'rgba(239, 68, 68, 0.08)',
                                  color: '#b91c1c',
                                  borderRadius: 14,
                                  border: '1.5px solid rgba(239, 68, 68, 0.25)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 6,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 850, fontSize: 13.5 }}>
                                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#ef4444', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>✕</span>
                                  <span>Order Cancelled</span>
                                </div>
                                <div style={{ fontSize: 12.5, lineHeight: 1.4, color: '#7f1d1d', paddingLeft: 30 }}>
                                  <b>Order cancelled because: </b>
                                  <span style={{ fontWeight: 600 }}>{o.cancelReason ? o.cancelReason : 'Order cancelled by store administration.'}</span>
                                </div>
                                <div style={{ fontSize: 11, color: '#991b1b', opacity: 0.85, paddingLeft: 30 }}>
                                  Refund has been initiated to your original payment method. For support, call +91 95434 34344.
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 2px 4px', width: '100%', boxSizing: 'border-box' }}>
                                {FLOW.map((s, i) => {
                                  const isDone = i <= stage;
                                  const isCurrent = i === stage;
                                  return (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                        <div
                                          style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            background: isDone ? C.success : '#fff',
                                            border: `2px solid ${isDone ? C.success : C.border}`,
                                            display: 'grid',
                                            placeItems: 'center',
                                            boxShadow: isCurrent ? '0 0 0 4px rgba(34,197,94,0.2)' : 'none',
                                            transition: 'all .3s ease',
                                          }}
                                        >
                                          {isDone ? (
                                            <Icon name="check" size={13} color="#fff" stroke={3.5} />
                                          ) : (
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.muted }} />
                                          )}
                                        </div>
                                        <span
                                          style={{
                                            fontSize: 10,
                                            fontWeight: isCurrent ? 800 : 700,
                                            color: isDone ? (isCurrent ? C.primaryDark : C.success) : C.muted,
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {s}
                                        </span>
                                      </div>
                                      {i < 3 && (
                                        <div
                                          style={{
                                            flex: 1,
                                            height: 3,
                                            margin: '0 4px 16px',
                                            background: i < stage ? C.success : C.tint2,
                                            borderRadius: 99,
                                            transition: 'background .3s ease',
                                          }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Ordered Items Grid */}
                          <div style={{ background: C.tint2, padding: '14px 16px', borderRadius: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.muted, letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' }}>
                              Items in this Order ({o.items?.length || 0})
                            </div>
                            <div style={{ display: 'grid', gap: 10 }}>
                              {(o.items || []).map((item, itemIdx) => {
                                const prod = products.find((p) => p.id === item.productId);
                                return (
                                  <div
                                    key={itemIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 12,
                                      paddingBottom: itemIdx < o.items.length - 1 ? 8 : 0,
                                      borderBottom: itemIdx < o.items.length - 1 ? `1px solid ${C.border}` : 'none',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fff', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                                        {prod ? (
                                          <ProductArt category={prod.category} color={prod.color} size={30} image={prod.image} alt={item.name} />
                                        ) : (
                                          <Icon name="phone" size={18} color={C.primary} />
                                        )}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 800, fontSize: 13 }}>{item.name}</div>
                                        <div style={{ fontSize: 11, color: C.muted }}>Qty: {item.qty}</div>
                                      </div>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 13.5, color: C.primaryDark }}>
                                      {money(item.price * item.qty)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Order Details & Shipping Address */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 12 }}>
                            <div style={{ padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: '#fff' }}>
                              <div style={{ fontWeight: 800, color: C.muted, marginBottom: 4, textTransform: 'uppercase', fontSize: 10.5 }}>
                                📍 Delivery Address
                              </div>
                              <div style={{ fontWeight: 700, color: C.primaryDark }}>{o.customer}</div>
                              <div style={{ color: C.text, marginTop: 2 }}>{o.address}</div>
                              <div style={{ color: C.muted, marginTop: 2 }}>📞 {o.phone}</div>
                            </div>

                            <div style={{ padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: '#fff' }}>
                              <div style={{ fontWeight: 800, color: C.muted, marginBottom: 4, textTransform: 'uppercase', fontSize: 10.5 }}>
                                💳 Payment &amp; Invoice
                              </div>
                              <div>Method: <b style={{ color: C.primaryDark }}>{o.payment}</b></div>
                              <div style={{ marginTop: 3 }}>Showroom GST Bill: <b style={{ color: C.success }}>✓ Included</b></div>
                              <div style={{ marginTop: 3, color: C.muted }}>Order Date: {o.date}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== WISHLIST TAB ==================== */}
        {tab === 'wishlist' && (
          <div>
            {wished.length === 0 ? (
              <Empty icon="heart" text="No saved items in wishlist yet. Tap the heart on any product to save it here." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {wished.map((p) => (
                  <ProductCard key={p.id} p={p} compact />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== CARE SERVICE TICKETS TAB ==================== */}
        {tab === 'service' && (
          <div>
            {/* Search & Filter Bar */}
            <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }}>
                    <Icon name="search" size={16} />
                  </span>
                  <input
                    value={ticketQ}
                    onChange={(e) => setTicketQ(e.target.value)}
                    placeholder="Search by Ticket ID or device..."
                    style={{
                      ...input,
                      width: '100%',
                      paddingLeft: 36,
                      paddingRight: ticketQ ? 30 : 12,
                      fontSize: 12.5,
                      height: 40,
                      boxSizing: 'border-box',
                    }}
                  />
                  {ticketQ && (
                    <button
                      type="button"
                      onClick={() => setTicketQ('')}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: C.muted, cursor: 'pointer', padding: 4 }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Inline Status Filter Dropdown right next to search box */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value as any)}
                    style={{
                      ...input,
                      height: 40,
                      padding: '0 28px 0 10px',
                      borderRadius: 12,
                      background: ticketFilter === 'All' ? C.tint2 : C.primary,
                      color: ticketFilter === 'All' ? C.primaryDark : '#fff',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      border: `1.5px solid ${ticketFilter === 'All' ? C.border : C.primary}`,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                    }}
                  >
                    <option value="All">All ({userTickets.length})</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready">Ready</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ticketFilter === 'All' ? C.muted : '#fff' }}>
                    <Icon name="down" size={13} />
                  </span>
                </div>
              </div>

              {/* Status Chips Row */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }} className="hide-scroll">
                {(['All', 'Open', 'In Progress', 'Ready', 'Closed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className="tap"
                    onClick={() => setTicketFilter(st)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 99,
                      fontSize: 11.5,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      background: ticketFilter === st ? C.primary : C.tint,
                      color: ticketFilter === st ? '#fff' : C.primary,
                      transition: 'all .15s ease',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {!user ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}` }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.tint, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: C.primary }}>
                  <Icon name="tool" size={32} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>Sign in to View Care Tickets</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: C.muted, maxWidth: 380, marginInline: 'auto' }}>
                  Please sign in with your phone or email to track live repair status and service desk updates.
                </p>
                <Btn onClick={() => nav('/login?redirect=' + encodeURIComponent('/orders?tab=service'))}>
                  <Icon name="user" size={16} /> Sign In to Your Account
                </Btn>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}` }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.tint, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: C.primary }}>
                  <Icon name="tool" size={32} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>No Care Tickets Found</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: C.muted, maxWidth: 360, marginInline: 'auto' }}>
                  {ticketQ || ticketFilter !== 'All'
                    ? 'No repair tickets matched your search or status filter. Try clearing filters.'
                    : "You haven't booked any repair services yet. Book our certified doorstep or in-store repair!"}
                </p>
                {ticketQ || ticketFilter !== 'All' ? (
                  <Btn onClick={() => { setTicketQ(''); setTicketFilter('All'); }} variant="ghost">Clear Filters</Btn>
                ) : (
                  <Btn onClick={() => nav('/services')}>Book a Device Service</Btn>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {filteredTickets.map((t, idx) => {
                  const stage = getTicketStage(t.status);
                  return (
                    <div
                      key={t.id}
                      style={{
                        background: '#fff',
                        borderRadius: 22,
                        border: `1.5px solid ${C.border}`,
                        overflow: 'hidden',
                        padding: '18px 20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        animation: `fadeUp .35s ease ${idx * 40}ms both`,
                      }}
                    >
                      {/* Ticket Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: C.tint, display: 'grid', placeItems: 'center', color: C.primary }}>
                            <Icon name="tool" size={22} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 900, fontSize: 16, color: C.primaryDark }}>#{t.id}</span>
                              <Pill tone={ticketTone(t.status)}>
                                {t.status.toUpperCase()}
                              </Pill>
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                              Registered for <b>{t.customer}</b> {t.phone ? `(${t.phone})` : ''}
                            </div>
                          </div>
                        </div>

                        {t.cost > 0 && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>ESTIMATED COST</div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: C.primaryDark }}>{money(t.cost)}</div>
                          </div>
                        )}
                      </div>

                      {/* Device & Issue */}
                      <div style={{ background: C.tint2, borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: C.primaryDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon name="phone" size={16} color={C.primary} />
                          <span>{t.device}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: C.text, marginTop: 5, paddingLeft: 24, lineHeight: 1.4 }}>
                          {t.issue}
                        </div>
                      </div>

                      {/* Live Repair Progress Stepper */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.1, color: C.primarySoft, marginBottom: 10, textTransform: 'uppercase' }}>
                          Live Repair Progress
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 2px', width: '100%', boxSizing: 'border-box' }}>
                          {TICKET_FLOW.map((step, i) => {
                            const isDone = i <= stage;
                            const isCurrent = i === stage;
                            return (
                              <div key={step.s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                  <div
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      background: isDone ? (isCurrent ? C.accent : C.success) : '#fff',
                                      color: isDone ? (isCurrent ? C.primaryDark : '#fff') : C.muted,
                                      border: `2px solid ${isDone ? (isCurrent ? C.accentDark : C.success) : C.border}`,
                                      display: 'grid',
                                      placeItems: 'center',
                                      boxShadow: isCurrent ? '0 0 0 4px rgba(246,196,69,0.3)' : 'none',
                                      transition: 'all .3s ease',
                                    }}
                                  >
                                    {isDone && !isCurrent ? (
                                      <Icon name="check" size={13} color="#fff" stroke={3.5} />
                                    ) : (
                                      <span style={{ fontSize: 10, fontWeight: 900 }}>{i + 1}</span>
                                    )}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: isCurrent ? 800 : 700,
                                      color: isDone ? (isCurrent ? C.primaryDark : C.success) : C.muted,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                {i < 3 && (
                                  <div
                                    style={{
                                      flex: 1,
                                      height: 3,
                                      margin: '0 4px 16px',
                                      background: i < stage ? C.success : C.tint2,
                                      borderRadius: 99,
                                      transition: 'background .3s ease',
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ticket Meta / Tech Info */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted }}>
                          <Icon name="clock" size={15} color={C.primary} />
                          <span>ETA: <b style={{ color: C.text }}>{t.eta}</b></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted }}>
                          <Icon name="user" size={15} color={C.primary} />
                          <span>Technician: <b style={{ color: C.text }}>{t.tech}</b></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <a
                            href="tel:+919543434344"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 12px',
                              borderRadius: 8,
                              background: C.tint,
                              color: C.primary,
                              fontSize: 11.5,
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            <Icon name="phone" size={13} /> Call Desk
                          </a>
                          <a
                            href={`https://wa.me/919543434344?text=${encodeURIComponent(`Hi Sastika Mobiles, I would like an update on my repair ticket #${t.id} (${t.device}).`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 12px',
                              borderRadius: 8,
                              background: '#25D366',
                              color: '#fff',
                              fontSize: 11.5,
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: 8 }}>
                  <Btn full variant="light" onClick={() => nav('/services')}>
                    + Book a New Device Service
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: 'heart' | 'tool' | 'truck'; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, color: C.muted }}>
      <Icon name={icon} size={42} style={{ margin: '0 auto 10px', display: 'block', animation: 'wiggle 2.5s ease-in-out infinite' }} />
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{text}</div>
    </div>
  );
}
