import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { Order, OrderStatus, Product } from '../types';
import { useInView } from '../components/anim';
import { AButton, AdminTableScroll, Kpi, PageTitle, Tag, panel, td, th } from './ui';
import Icon from '../components/Icon';

export const orderTone = (s: OrderStatus): 'green' | 'red' | 'amber' | 'blue' =>
  s === 'Delivered' ? 'green' : s === 'Cancelled' ? 'red' : s === 'Shipped' ? 'blue' : 'amber';

export default function Dashboard() {
  const nav = useNavigate();
  const { orders, products, tickets, updateOrderStatus, setTicketStatus } = useStore();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // 100% Real-Time Calculations
  const validOrders = useMemo(() => orders.filter((o) => o.status !== 'Cancelled'), [orders]);
  const totalRevenue = useMemo(() => validOrders.reduce((n, o) => n + o.total, 0), [validOrders]);

  const todayOrders = useMemo(() => validOrders.filter((o) => o.date === todayStr), [validOrders, todayStr]);
  const todayRevenue = useMemo(() => todayOrders.reduce((n, o) => n + o.total, 0), [todayOrders]);

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
              {orders.slice(0, 6).map((o) => (
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
              ))}
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
/* DYNAMIC REVENUE LINE & BAR CHART CALCULATED FROM REAL ORDERS               */
/* -------------------------------------------------------------------------- */

function DynamicRevenueChart({ orders }: { orders: Order[] }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);

  // Generate last 7 days dynamically
  const daysData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      // Calculate total from real orders for this date
      const dayTotal = orders
        .filter((o) => o.status !== 'Cancelled' && o.date === dateStr)
        .reduce((sum, o) => sum + o.total, 0);

      return {
        label: dayLabel,
        date: dateStr,
        total: dayTotal,
        isToday: i === 6,
      };
    });
  }, [orders]);

  const maxVal = Math.max(...daysData.map((d) => d.total), 30000);

  const W = 760;
  const H = 220;
  const pad = { l: 60, r: 24, t: 20, b: 32 };

  const pts = daysData.map((d, i) => ({
    x: pad.l + (i * (W - pad.l - pad.r)) / (daysData.length - 1),
    y: pad.t + (1 - d.total / maxVal) * (H - pad.t - pad.b),
    ...d,
  }));

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;

  // Grid steps (3 intervals)
  const steps = [0, Math.round(maxVal / 2), Math.round(maxVal)];

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Dynamic 7-day revenue chart">
        <defs>
          <linearGradient id="realRevenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={C.primarySoft} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {steps.map((v) => {
          const y = pad.t + (1 - v / maxVal) * (H - pad.t - pad.b);
          return (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={C.border} strokeDasharray="4 4" />
              <text x={pad.l - 10} y={y + 4} fontSize="11" fill={C.muted} textAnchor="end" fontWeight="600">
                ₹{(v / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={area} fill="url(#realRevenueGradient)" style={{ opacity: seen ? 1 : 0, transition: 'opacity .8s ease' }} />

        {/* Line stroke */}
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
          style={{ transition: 'stroke-dashoffset 1.4s ease' }}
        />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={p.date} style={{ opacity: seen ? 1 : 0, transition: `opacity .4s ease ${0.4 + i * 0.1}s` }}>
            {/* Pulsing indicator for today */}
            {p.isToday && (
              <circle cx={p.x} cy={p.y} r="12" fill={C.accent} opacity="0.3" style={{ animation: 'pulseRing 2s infinite' }} />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={p.isToday ? 7 : 5.5}
              fill={p.isToday ? C.accent : '#fff'}
              stroke={C.primary}
              strokeWidth="3"
            />
            {/* Amount tooltip text above dot if > 0 */}
            {p.total > 0 && (
              <text x={p.x} y={p.y - 12} fontSize="11" fill={C.primary} textAnchor="middle" fontWeight="800">
                ₹{(p.total / 1000).toFixed(1)}k
              </text>
            )}
            {/* Date label at bottom */}
            <text x={p.x} y={H - 10} fontSize="12" fill={p.isToday ? C.primary : C.muted} textAnchor="middle" fontWeight={p.isToday ? '900' : '700'}>
              {p.label} {p.isToday ? '(Today)' : ''}
            </text>
            <title>{`${p.label} (${p.date}): ${money(p.total)}`}</title>
          </g>
        ))}
      </svg>
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
