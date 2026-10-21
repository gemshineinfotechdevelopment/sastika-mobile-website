import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
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
  const { orders, wishlist, products, tickets, cartCount } = useStore();

  const initialTab = (params.get('tab') as 'orders' | 'wishlist' | 'service') || 'orders';
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'service'>(
    ['orders', 'wishlist', 'service'].includes(initialTab) ? initialTab : 'orders'
  );

  const [open, setOpen] = useState<string | null>(orders[0]?.id ?? null);
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

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      const matchQuery =
        !q.trim() ||
        (o.id || '').toLowerCase().includes(q.toLowerCase()) ||
        (o.customer || '').toLowerCase().includes(q.toLowerCase()) ||
        (o.items || []).some((item) => (item.name || '').toLowerCase().includes(q.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }, [orders, q, statusFilter]);

  // Filtered care tickets list
  const filteredTickets = useMemo(() => {
    return normalizedTickets.filter((t) => {
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
  }, [normalizedTickets, ticketFilter, ticketQ]);

  return (
    <div className="site-page-container" style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ padding: '16px 0 0' }}>
        {/* Header Hero Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            padding: '24px 22px',
            borderRadius: 24,
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
            color: '#fff',
            boxShadow: '0 8px 30px rgba(11,74,67,0.14)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(246,196,69,.15)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: C.accent,
                color: C.primaryDark,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,.15)',
              }}
            >
              <Icon name="truck" size={28} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.accent }}>
                REAL-TIME DISPATCH &amp; CARE TRACKING
              </div>
              <h1 style={{ margin: '4px 0 2px', fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>
                Track &amp; Orders
              </h1>
              <div style={{ fontSize: 12.5, opacity: 0.85 }}>
                Check live shipping stages, service repair progress, ETA and Sivakasi GST tax invoices
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Pill tone="accent">SIVAKASI STORE PICKUP / DISPATCH</Pill>
          </div>
        </div>

        {cartCount > 0 && (
          <button
            className="tap"
            onClick={() => nav('/cart')}
            style={{
              width: '100%',
              marginTop: 12,
              padding: '12px 16px',
              borderRadius: 14,
              background: C.warnSoft,
              color: C.warn,
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="cart" size={16} /> You have {cartCount} item{cartCount > 1 ? 's' : ''} in your cart ready for checkout
            </span>
            <Icon name="right" size={16} />
          </button>
        )}

        {/* Tab Buttons */}
        <div style={{ marginTop: 18, display: 'flex', gap: 6, background: C.tint, padding: 5, borderRadius: 16 }}>
          {(
            [
              { k: 'orders' as const, l: `Track & Orders (${orders.length})`, ic: 'truck' as IconName },
              { k: 'wishlist' as const, l: `Saved Items (${wishlist.length})`, ic: 'heart' as IconName },
              { k: 'service' as const, l: `Care Tickets (${normalizedTickets.length})`, ic: 'tool' as IconName },
            ]
          ).map(({ k, l, ic }) => (
            <button
              key={k}
              type="button"
              className="tap"
              onClick={() => setTab(k)}
              style={{
                flex: 1,
                padding: '11px 8px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                background: tab === k ? '#fff' : 'transparent',
                color: tab === k ? C.primary : C.muted,
                boxShadow: tab === k ? '0 2px 10px rgba(11,74,67,.12)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all .2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon name={ic} size={15} color={tab === k ? C.primary : C.muted} />
              <span>{l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div key={tab} style={{ marginTop: 18, animation: 'fadeUp .3s ease both' }}>
        {/* ==================== ORDERS TAB ==================== */}
        {tab === 'orders' && (
          <div>
            {/* Search & Filter Bar - Neatly placed together */}
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
                    <option value="All">All ({orders.length})</option>
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
            {filteredOrders.length === 0 ? (
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
                      {/* Order Summary Header Row */}
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : o.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '16px 18px',
                          textAlign: 'left',
                          background: isOpen ? C.tint2 : '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background .2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: '#fff',
                            border: `1px solid ${C.border}`,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          {first ? (
                            <ProductArt category={first.category} color={first.color} size={42} image={first.image} alt={first.name} />
                          ) : (
                            <Icon name="box" size={26} color={C.primary} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 900, fontSize: 15, color: C.primaryDark }}>{o.id}</span>
                            <span style={{ fontSize: 11.5, color: C.muted }}>📅 {o.date}</span>
                          </div>
                          <div style={{ fontSize: 12.5, color: C.text, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>
                            {(o.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ')}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 900, fontSize: 16, color: C.primaryDark }}>{money(o.total)}</div>
                          <div style={{ marginTop: 3 }}>
                            <Pill tone={tone(o.status)}>{o.status.toUpperCase()}</Pill>
                          </div>
                        </div>

                        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease', color: C.muted, marginLeft: 4 }}>
                          <Icon name="down" size={16} />
                        </span>
                      </button>

                      {/* Expandable Order Details & Tracking Progress */}
                      {isOpen && (
                        <div style={{ padding: '18px 20px 22px', borderTop: `1px solid ${C.border}`, background: '#fff' }}>
                          {/* Live Visual Tracking Stepper */}
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1.2, color: C.primarySoft, marginBottom: 12, textTransform: 'uppercase' }}>
                              Live Order Tracking Status
                            </div>

                            {o.status === 'Cancelled' ? (
                              <div style={{ padding: '12px 16px', background: C.dangerSoft, color: C.danger, borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
                                ✕ This order was cancelled. Refund has been initiated to your original payment method.
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 4px 6px' }}>
                                {FLOW.map((s, i) => {
                                  const isDone = i <= stage;
                                  const isCurrent = i === stage;
                                  return (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                        <div
                                          style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            background: isDone ? C.success : '#fff',
                                            border: `2px solid ${isDone ? C.success : C.border}`,
                                            display: 'grid',
                                            placeItems: 'center',
                                            boxShadow: isCurrent ? '0 0 0 5px rgba(34,197,94,0.2)' : 'none',
                                            transition: 'all .3s ease',
                                          }}
                                        >
                                          {isDone ? (
                                            <Icon name="check" size={15} color="#fff" stroke={3.5} />
                                          ) : (
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.muted }} />
                                          )}
                                        </div>
                                        <span
                                          style={{
                                            fontSize: 11,
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
                                            height: 4,
                                            margin: '0 8px 20px',
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
            {/* Search & Filter Bar - Neatly placed together */}
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
                    <option value="All">All ({normalizedTickets.length})</option>
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

            {filteredTickets.length === 0 ? (
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
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: C.primarySoft, marginBottom: 10, textTransform: 'uppercase' }}>
                          Live Repair Progress
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 4px' }}>
                          {TICKET_FLOW.map((step, i) => {
                            const isDone = i <= stage;
                            const isCurrent = i === stage;
                            return (
                              <div key={step.s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                  <div
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      background: isDone ? (isCurrent ? C.accent : C.success) : '#fff',
                                      color: isDone ? (isCurrent ? C.primaryDark : '#fff') : C.muted,
                                      border: `2px solid ${isDone ? (isCurrent ? C.accentDark : C.success) : C.border}`,
                                      display: 'grid',
                                      placeItems: 'center',
                                      boxShadow: isCurrent ? '0 0 0 5px rgba(246,196,69,0.3)' : 'none',
                                      transition: 'all .3s ease',
                                    }}
                                  >
                                    {isDone && !isCurrent ? (
                                      <Icon name="check" size={15} color="#fff" stroke={3.5} />
                                    ) : (
                                      <span style={{ fontSize: 11, fontWeight: 900 }}>{i + 1}</span>
                                    )}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: 11,
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
                                      height: 4,
                                      margin: '0 8px 18px',
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

function Empty({ icon, text }: { icon: 'heart' | 'tool'; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, color: C.muted }}>
      <Icon name={icon} size={42} style={{ margin: '0 auto 10px', display: 'block', animation: 'wiggle 2.5s ease-in-out infinite' }} />
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{text}</div>
    </div>
  );
}
