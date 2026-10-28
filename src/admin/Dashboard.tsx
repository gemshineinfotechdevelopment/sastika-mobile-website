import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { Order, OrderStatus, Product } from '../types';
import { useInView } from '../components/anim';
import { AButton, AdminTableScroll, Kpi, PageTitle, Tag, panel, td, th } from './ui';
import Icon from '../components/Icon';

export const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOrderDateStr = (o: Order): string => {
  if (o.date) {
    const trimmed = String(o.date).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }
  const raw = (o as any).createdAt || o.date;
  if (raw) {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return getLocalDateStr(parsed);
    }
  }
  return '';
};

export const orderTone = (s: OrderStatus): 'green' | 'red' | 'amber' | 'blue' =>
  s === 'Delivered' ? 'green' : s === 'Cancelled' ? 'red' : s === 'Shipped' ? 'blue' : 'amber';

export default function Dashboard() {
  const nav = useNavigate();
  const { orders, products, tickets, updateOrderStatus, setTicketStatus } = useStore();

  const todayStr = useMemo(() => getLocalDateStr(), []);

  // 100% Real-Time Calculations
  const validOrders = useMemo(() => orders.filter((o) => o.status !== 'Cancelled'), [orders]);
  const totalRevenue = useMemo(() => validOrders.reduce((n, o) => n + (Number(o.total) || 0), 0), [validOrders]);

  const todayOrders = useMemo(() => validOrders.filter((o) => getOrderDateStr(o) === todayStr), [validOrders, todayStr]);
  const todayRevenue = useMemo(() => todayOrders.reduce((n, o) => n + (Number(o.total) || 0), 0), [todayOrders]);

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'Placed' || o.status === 'Packed'), [orders]);
  const shippedOrders = useMemo(() => orders.filter((o) => o.status === 'Shipped'), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === 'Delivered'), [orders]);

  const totalStockUnits = useMemo(() => products.reduce((n, p) => n + p.stock, 0), [products]);
  const stockValue = useMemo(() => products.reduce((n, p) => n + p.price * p.stock, 0), [products]);
  const lowStock = useMemo(() => products.filter((p) => p.stock <= p.reorderAt), [products]);

  const openTickets = useMemo(() => tickets.filter((t) => t.status !== 'Closed'), [tickets]);
  const avgOrderValue = useMemo(
    () => (validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0),
    [totalRevenue, validOrders.length],
  );

  return (
    <div>
      <PageTitle
        title="Store Operations & Real-Time Executive Dashboard"
        sub="Live Sivakasi & Sithurajapuram retail telemetry, synchronized with storefront checkout."
        actions={
          <div className="admin-overview-actions">
            <AButton className="admin-overview-primary-btn" onClick={() => nav('/admin/products?new=1')}>
              <Icon name="plus" size={15} /> Add New Product
            </AButton>
            <div className="admin-overview-secondary-group">
              <AButton variant="ghost" onClick={() => nav('/admin/orders')}>
                View Orders ({orders.length})
              </AButton>
              <AButton variant="ghost" onClick={() => nav('/admin/inventory')}>
                Stock Audit ({totalStockUnits} Units)
              </AButton>
            </div>
          </div>
        }
      />

      {/* Real-time KPI Metric Cards */}
      <div className="admin-kpi-grid">
        <Kpi
          icon="chart"
          label="Total Realized Revenue"
          value={totalRevenue}
          prefix="₹"
          delta={`${validOrders.length} paid`}
          tone="green"
          delay={0}
        />
        <Kpi
          icon="zap"
          label="Today's Live Sales"
          value={todayRevenue}
          prefix="₹"
          delta={`${todayOrders.length} today`}
          tone="amber"
          delay={70}
        />
        <Kpi
          icon="box"
          label="Orders to Fulfil"
          value={pendingOrders.length}
          delta={`${pendingOrders.length} open`}
          tone={pendingOrders.length ? 'amber' : 'green'}
          delay={140}
        />
        <Kpi
          icon="grid"
          label="Current Stock Value"
          value={stockValue}
          prefix="₹"
          delta={`${totalStockUnits} units`}
          delay={210}
        />
      </div>

      {/* Additional telemetry bar */}
      <div className="admin-telemetry-bar">
        <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>AVERAGE ORDER VALUE (AOV)</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.primary, marginTop: 2 }}>{money(avgOrderValue)}</div>
        </div>
        <div style={{ borderRight: `1px solid ${C.border}`, paddingLeft: 8, paddingRight: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>CRITICAL REORDER ALERTS</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: lowStock.length ? C.danger : C.success, marginTop: 2 }}>
            {lowStock.length} Items {lowStock.length > 0 ? '⚠️' : '✓'}
          </div>
        </div>
        <div style={{ borderRight: `1px solid ${C.border}`, paddingLeft: 8, paddingRight: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>CARE DESK ACTIVE TICKETS</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.primarySoft, marginTop: 2 }}>{openTickets.length} Repairs</div>
        </div>
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>ORDER STATUS RATE</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.success, marginTop: 2 }}>
            {orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 100}% Delivered
          </div>
        </div>
      </div>

      {/* Dynamic 7-Day Revenue Trend & Brand Share Donut */}
      <div className="admin-split-grid">
        <div style={{ ...panel, animation: 'fadeUp .5s ease .2s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Real-Time 7-Day Sales & Revenue Trend</div>
              <div style={{ fontSize: 12, color: C.muted }}>
                Automatically updates whenever an order is submitted on the website
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, animation: 'pulseDot 1.6s infinite' }} />
              <Tag tone="green">Live Storefront Sync</Tag>
            </div>
          </div>
          <DynamicRevenueChart orders={validOrders} />
        </div>

        <div style={{ ...panel, animation: 'fadeUp .5s ease .3s both' }}>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Brand Inventory Share</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Live stock units by brand ({totalStockUnits} Total)
          </div>
          <BrandShareDonut products={products} />
        </div>
      </div>

      {/* Recent Orders & Fulfilment Queue */}
      <div className="admin-split-orders">
        <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .35s both' }}>
          <div style={{ padding: '16px 18px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Live Customer Orders ({orders.length})</div>
              <div style={{ fontSize: 12, color: C.muted }}>Instant checkout orders placed through storefront</div>
            </div>
            <AButton small variant="soft" onClick={() => nav('/admin/orders')}>
              Manage All Orders
            </AButton>
          </div>
          <AdminTableScroll>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead>
              <tr>
                {['ORDER ID', 'CUSTOMER & CITY', 'MOBILE MODELS ORDERED', 'REAL AMOUNT', 'STATUS', 'ACTION'].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>📦</div>
                    <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>No Customer Orders Yet</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                      When visitors place orders on the website, their details will appear here immediately in real time.
                    </div>
                  </td>
                </tr>
              ) : (
                orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="row-hover">
                  <td style={{ ...td, fontWeight: 800, color: C.primary }}>
                    {o.id}
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>{o.date}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{o.customer}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {o.phone} • <b style={{ color: C.primarySoft }}>{o.city}</b>
                    </div>
                  </td>
                  <td style={{ ...td, maxWidth: 220, fontSize: 12.5 }}>
                    {o.items.map((i) => (
                      <div key={i.productId} style={{ fontWeight: 600 }}>
                        {i.name} <span style={{ color: C.muted }}>×{i.qty}</span>
                      </div>
                    ))}
                  </td>
                  <td style={{ ...td, fontWeight: 800, fontSize: 14 }}>
                    {money(o.total)}
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{o.payment}</div>
                  </td>
                  <td style={td}>
                    <Tag tone={orderTone(o.status)}>{o.status}</Tag>
                  </td>
                  <td style={td}>
                    {o.status === 'Placed' && (
                      <AButton small variant="soft" onClick={() => updateOrderStatus(o.id, 'Packed')}>
                        Pack
                      </AButton>
                    )}
                    {o.status === 'Packed' && (
                      <AButton small variant="accent" onClick={() => updateOrderStatus(o.id, 'Shipped')}>
                        Ship
                      </AButton>
                    )}
                    {o.status === 'Shipped' && (
                      <AButton small variant="primary" onClick={() => updateOrderStatus(o.id, 'Delivered')}>
                        Deliver
                      </AButton>
                    )}
                    {o.status === 'Delivered' && (
                      <span style={{ fontSize: 11, color: C.success, fontWeight: 700 }}>✓ Completed</span>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
          </AdminTableScroll>
        </div>

        {/* Right Side: Critical Stock & Care Desk */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          {/* Low Stock Alerts */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .4s both' }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Low Stock Alerts</span>
              <Tag tone={lowStock.length ? 'red' : 'green'}>{lowStock.length} Models</Tag>
            </div>
            {lowStock.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13, padding: '12px 0' }}>All 18 mobile models have healthy stock levels.</div>
            ) : (
              lowStock.slice(0, 4).map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <img src={p.image} alt={p.name} style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8, background: C.tint }} />
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, lineHeight: 1.25 }}>
                    {p.name}
                    <div style={{ fontSize: 11, color: C.danger, fontWeight: 800 }}>
                      Only {p.stock} left in stock (Reorder threshold: {p.reorderAt})
                    </div>
                  </div>
                  <AButton small variant="danger" onClick={() => nav('/admin/inventory')}>
                    Restock
                  </AButton>
                </div>
              ))
            )}
          </div>

          {/* Care Lab Repair Desk */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .45s both' }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Care Lab Service Desk</span>
              <Tag tone="amber">{openTickets.length} Active</Tag>
            </div>
            {openTickets.slice(0, 3).map((t) => (
              <div key={t.id} style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>
                  #{t.id} • {t.device}
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {t.customer} ({t.phone}) — {t.issue}
                  </div>
                </div>
                {t.status === 'Open' && <AButton small variant="soft" onClick={() => setTicketStatus(t.id, 'In Progress')}>Start</AButton>}
                {t.status === 'In Progress' && <AButton small variant="accent" onClick={() => setTicketStatus(t.id, 'Ready')}>Ready</AButton>}
                {t.status === 'Ready' && <AButton small variant="soft" onClick={() => setTicketStatus(t.id, 'Closed')}>Close</AButton>}
              </div>
            ))}
            {openTickets.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No active repair tickets.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DYNAMIC 7-DAY REVENUE BAR & TREND GRAPH + DETAILED ORDER TOTALS TABLE      */
/* -------------------------------------------------------------------------- */

function DynamicRevenueChart({ orders }: { orders: Order[] }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);

  // Generate rolling last 7 days dynamically and sum all order amounts per day from database
  const daysData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = getLocalDateStr(d);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      // Match all real orders created on this exact date from database
      const dayOrders = orders.filter((o) => {
        if (o.status === 'Cancelled') return false;
        return getOrderDateStr(o) === dateStr;
      });

      // Total revenue summed across all incoming orders for this date
      const dayTotal = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const ordersCount = dayOrders.length;
      const unitsCount = dayOrders.reduce((sum, o) => {
        const itemSum = o.items?.reduce((isum, it) => isum + (Number(it.qty) || 1), 0);
        return sum + (itemSum !== undefined ? itemSum : 1);
      }, 0);

      const customerNames = [...new Set(dayOrders.map((o) => o.customer).filter(Boolean))];
      const itemsPurchased = dayOrders.flatMap((o) => o.items || []);

      return {
        label: dayLabel,
        fullDate,
        date: dateStr,
        total: dayTotal,
        ordersCount,
        unitsCount,
        customerNames,
        itemsPurchased,
        dayOrders,
        isToday: i === 6,
      };
    });
  }, [orders]);

  const total7DayRevenue = useMemo(() => daysData.reduce((acc, d) => acc + d.total, 0), [daysData]);
  const total7DayOrders = useMemo(() => daysData.reduce((acc, d) => acc + d.ordersCount, 0), [daysData]);
  const total7DayUnits = useMemo(() => daysData.reduce((acc, d) => acc + d.unitsCount, 0), [daysData]);
  const todayEntry = useMemo(() => daysData[daysData.length - 1] || { total: 0, ordersCount: 0 }, [daysData]);
  const avgDailyRevenue = Math.round(total7DayRevenue / 7);

  const maxVal = Math.max(...daysData.map((d) => d.total), 12000);

  const W = 760;
  const H = 250;
  const pad = { l: 56, r: 24, t: 44, b: 46 };
  const plotH = H - pad.t - pad.b;
  const colWidth = (W - pad.l - pad.r) / 7;

  const pts = daysData.map((d, i) => {
    const x = pad.l + (i + 0.5) * colWidth;
    const y = pad.t + (1 - d.total / maxVal) * plotH;
    const barH = plotH * (d.total / maxVal);
    const barY = H - pad.b - barH;
    return {
      x,
      y,
      barY,
      barH: Math.max(d.total > 0 ? 4 : 0, barH),
      ...d,
    };
  });

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;

  // Grid steps (3 intervals)
  const steps = [0, Math.round(maxVal / 2), Math.round(maxVal)];

  // Reverse list for day-wise table (Today first)
  const reversedDays = useMemo(() => [...daysData].reverse(), [daysData]);

  return (
    <div ref={ref}>
      {/* 7-Day Performance Header Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
          gap: 10,
          background: C.tint2,
          padding: '12px 16px',
          borderRadius: 14,
          marginBottom: 14,
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Today's Orders Sum
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.accent, marginTop: 2 }}>
            {money(todayEntry.total)}
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700 }}>
            {todayEntry.ordersCount} orders today
          </div>
        </div>

        <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            7-Day Total Revenue
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.primary, marginTop: 2 }}>
            {money(total7DayRevenue)}
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700 }}>
            {total7DayOrders} orders placed
          </div>
        </div>

        <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Total Mobiles / Items
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.primarySoft, marginTop: 2 }}>
            {total7DayUnits} Units
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700 }}>
            Purchased by users
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Daily Average
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginTop: 2 }}>
            {money(avgDailyRevenue)}
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700 }}>
            Per day average
          </div>
        </div>
      </div>

      {/* SVG Interactive Trend & Bar Hybrid Graph */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '10px 8px 12px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          marginBottom: 16,
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Real-time 7-day sales and revenue chart">
          <defs>
            <linearGradient id="realRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity="0.45" />
              <stop offset="100%" stopColor={C.primarySoft} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="barGradientNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.primarySoft} stopOpacity="0.30" />
              <stop offset="100%" stopColor={C.primary} stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={C.accent} stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Grid lines & values */}
          {steps.map((v) => {
            const y = pad.t + (1 - v / maxVal) * plotH;
            return (
              <g key={v}>
                <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={C.border} strokeDasharray="4 4" />
                <text x={pad.l - 10} y={y + 4} fontSize="11" fill={C.muted} textAnchor="end" fontWeight="700">
                  ₹{(v / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Day Vertical Bars (Height reflects exact summed total for that day) */}
          {pts.map((p) => (
            <g key={`bar-${p.date}`}>
              <rect
                x={p.x - 22}
                y={p.barY}
                width="44"
                height={p.barH}
                rx="7"
                fill={p.isToday ? 'url(#barGradientToday)' : 'url(#barGradientNormal)'}
                stroke={p.isToday ? C.accent : 'transparent'}
                strokeWidth={p.isToday ? '1.5' : '0'}
                style={{
                  transformOrigin: `${p.x}px ${H - pad.b}px`,
                  opacity: seen ? 1 : 0,
                  transition: 'opacity .6s ease',
                }}
              />
            </g>
          ))}

          {/* Area fill under curve */}
          <path d={area} fill="url(#realRevenueGradient)" style={{ opacity: seen ? 0.75 : 0, transition: 'opacity .8s ease' }} />

          {/* Trend line connecting daily totals */}
          <path
            d={line}
            fill="none"
            stroke={C.primary}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={seen ? 0 : 1}
            style={{ transition: 'stroke-dashoffset 1.3s ease' }}
          />

          {/* Data Points, Amount Tags, and Dates */}
          {pts.map((p, i) => (
            <g key={p.date} style={{ opacity: seen ? 1 : 0, transition: `opacity .4s ease ${0.3 + i * 0.08}s` }}>
              {/* Pulsing indicator for today */}
              {p.isToday && (
                <circle cx={p.x} cy={p.y} r="14" fill={C.accent} opacity="0.3" style={{ animation: 'pulseRing 2s infinite' }} />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.isToday ? 7.5 : 5.5}
                fill={p.isToday ? C.accent : '#fff'}
                stroke={C.primary}
                strokeWidth="3"
              />

              {/* Day Sum Amount Tag (Directly above the point) */}
              <text
                x={p.x}
                y={p.y - 18}
                fontSize={p.isToday ? '12.5' : '11.5'}
                fill={p.isToday ? C.accent : p.total > 0 ? C.primary : C.muted}
                textAnchor="middle"
                fontWeight="900"
              >
                ₹{p.total.toLocaleString('en-IN')}
              </text>

              {/* Order Count Subtitle Tag */}
              <text
                x={p.x}
                y={p.y - 6}
                fontSize="10"
                fill={p.isToday ? C.primary : C.muted}
                textAnchor="middle"
                fontWeight="700"
              >
                {p.ordersCount} {p.ordersCount === 1 ? 'order' : 'orders'}
              </text>

              {/* Day Label at Bottom */}
              <text
                x={p.x}
                y={H - 24}
                fontSize="12"
                fill={p.isToday ? C.primary : C.text}
                textAnchor="middle"
                fontWeight={p.isToday ? '900' : '700'}
              >
                {p.label}
              </text>

              {/* Date & Today Badge at Bottom */}
              <text
                x={p.x}
                y={H - 10}
                fontSize="10.5"
                fill={p.isToday ? C.accent : C.muted}
                textAnchor="middle"
                fontWeight={p.isToday ? '900' : '600'}
              >
                {p.isToday ? '★ TODAY' : p.fullDate}
              </text>

              <title>{`${p.fullDate} (${p.label}): ₹${p.total.toLocaleString('en-IN')} from ${p.ordersCount} orders`}</title>
            </g>
          ))}
        </svg>
      </div>

      {/* Day-Wise Customer Purchases & Revenue Breakdown Table */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📅</span>
            <span>Day-Wise Customer Orders & Total Amount Table</span>
          </div>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>
            Past 7 Days (Live MongoDB Atlas)
          </span>
        </div>

        <AdminTableScroll>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540, fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.tint2 }}>
                <th style={{ ...th, padding: '9px 12px', fontSize: 11 }}>DAY & DATE</th>
                <th style={{ ...th, padding: '9px 12px', fontSize: 11, textAlign: 'center' }}>ORDERS COUNT</th>
                <th style={{ ...th, padding: '9px 12px', fontSize: 11, textAlign: 'center' }}>UNITS BOUGHT</th>
                <th style={{ ...th, padding: '9px 12px', fontSize: 11, textAlign: 'right' }}>TOTAL AMOUNT (₹)</th>
                <th style={{ ...th, padding: '9px 12px', fontSize: 11 }}>CUSTOMER NAMES & MOBILE MODELS</th>
              </tr>
            </thead>
            <tbody>
              {reversedDays.map((d) => (
                <tr
                  key={d.date}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    background: d.isToday ? 'rgba(234, 88, 12, 0.05)' : '#fff',
                  }}
                  className="row-hover"
                >
                  <td style={{ ...td, padding: '10px 12px', fontWeight: d.isToday ? 900 : 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{d.fullDate} ({d.label})</span>
                      {d.isToday && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            background: '#ffedd5',
                            color: C.accent,
                            padding: '2px 8px',
                            borderRadius: 99,
                            border: '1px solid #fed7aa',
                          }}
                        >
                          TODAY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 500, marginTop: 1 }}>{d.date}</div>
                  </td>

                  <td style={{ ...td, padding: '10px 12px', textAlign: 'center' }}>
                    {d.ordersCount > 0 ? (
                      <span
                        style={{
                          fontWeight: 800,
                          color: d.isToday ? C.accent : C.primary,
                          background: d.isToday ? '#ffedd5' : C.tint,
                          padding: '3px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      >
                        {d.ordersCount} {d.ordersCount === 1 ? 'Order' : 'Orders'}
                      </span>
                    ) : (
                      <span style={{ color: C.muted, fontWeight: 600 }}>0 Orders</span>
                    )}
                  </td>

                  <td style={{ ...td, padding: '10px 12px', textAlign: 'center' }}>
                    {d.unitsCount > 0 ? (
                      <span style={{ fontWeight: 800, color: C.text }}>
                        {d.unitsCount} pcs
                      </span>
                    ) : (
                      <span style={{ color: C.muted }}>-</span>
                    )}
                  </td>

                  <td
                    style={{
                      ...td,
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 900,
                      fontSize: 13.5,
                      color: d.total > 0 ? (d.isToday ? C.accent : C.primary) : C.muted,
                    }}
                  >
                    {money(d.total)}
                  </td>

                  <td style={{ ...td, padding: '10px 12px', maxWidth: 240 }}>
                    {d.dayOrders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {d.dayOrders.map((o) => (
                          <div key={o.id} style={{ fontSize: 11.5, color: C.text }}>
                            <b style={{ color: C.primarySoft }}>{o.customer}:</b>{' '}
                            {o.items?.map((it) => `${it.name} (×${it.qty})`).join(', ') || 'Mobile order'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: C.muted, fontStyle: 'italic', fontSize: 11 }}>No orders placed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableScroll>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DYNAMIC BRAND INVENTORY DONUT CHART                                        */
/* -------------------------------------------------------------------------- */

function BrandShareDonut({ products }: { products: Product[] }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);

  // Dynamically compute brands and their stock share
  const brandGroups = useMemo(() => {
    const brands = ['Redmi', 'OPPO', 'Vivo', 'Nothing', 'Samsung', 'Poco'];
    const colors: Record<string, string> = {
      Redmi: '#ea580c',
      OPPO: '#0284c7',
      Vivo: '#2563eb',
      Nothing: '#475569',
      Samsung: '#7c3aed',
      Poco: '#ca8a04',
    };
    return brands.map((brand) => {
      const brandProducts = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
      const units = brandProducts.reduce((sum, p) => sum + p.stock, 0);
      return {
        label: brand,
        units,
        color: colors[brand] || C.primary,
      };
    });
  }, [products]);

  const totalUnits = brandGroups.reduce((n, g) => n + g.units, 0) || 1;
  const R = 62;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div ref={ref}>
      <div style={{ position: 'relative', width: 170, height: 170, margin: '6px auto 14px' }}>
        <svg viewBox="0 0 170 170" width="170" height="170" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="85" cy="85" r={R} fill="none" stroke={C.tint} strokeWidth="22" />
          {brandGroups.map((g) => {
            const len = (g.units / totalUnits) * circ;
            const el = (
              <circle
                key={g.label}
                cx="85"
                cy="85"
                r={R}
                fill="none"
                stroke={g.color}
                strokeWidth="22"
                strokeDasharray={`${seen ? len : 0} ${circ}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray 1.2s ease .2s' }}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.primary }}>{totalUnits}</div>
            <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 800 }}>Units in Stock</div>
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
        {brandGroups.map((g) => (
          <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: g.color }} />
            <span style={{ flex: 1, fontWeight: 700, color: C.text }}>{g.label}</span>
            <b style={{ color: C.primary }}>{g.units}</b>
            <span style={{ fontSize: 10, color: C.muted }}>({Math.round((g.units / totalUnits) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
