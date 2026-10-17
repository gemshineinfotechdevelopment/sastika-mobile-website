import { useNavigate } from 'react-router-dom';
import { REVENUE_SERIES } from '../data';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { OrderStatus } from '../types';
import { useInView } from '../components/anim';
import { AButton, Kpi, PageTitle, Tag, panel, td, th } from './ui';

export const orderTone = (s: OrderStatus): 'green' | 'red' | 'amber' | 'blue' => (s === 'Delivered' ? 'green' : s === 'Cancelled' ? 'red' : s === 'Shipped' ? 'blue' : 'amber');

export default function Dashboard() {
  const nav = useNavigate();
  const { orders, products, tickets, updateOrderStatus, setTicketStatus } = useStore();

  const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((n, o) => n + o.total, 0);
  const pending = orders.filter((o) => o.status === 'Placed' || o.status === 'Packed').length;
  const low = products.filter((p) => p.stock <= p.reorderAt);
  const stockValue = products.reduce((n, p) => n + p.price * p.stock, 0);
  const openTickets = tickets.filter((t) => t.status !== 'Closed');

  return (
    <div>
      <PageTitle
        title="Welcome back, Admin"
        sub="All systems are operational. Here is how the store is performing."
        actions={
          <>
            <AButton variant="ghost" onClick={() => nav('/admin/inventory')}>Stock Audit</AButton>
            <AButton onClick={() => nav('/admin/products?new=1')}>Add Product</AButton>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        <Kpi icon="chart" label="Total revenue (orders)" value={revenue} prefix="₹" delta="+12.4%" delay={0} />
        <Kpi icon="box" label="Orders to fulfil" value={pending} delta={`${orders.length} total`} tone="amber" delay={80} />
        <Kpi icon="grid" label="Inventory value" value={stockValue} prefix="₹" delta={`${products.length} SKUs`} delay={160} />
        <Kpi icon="alert" label="Critical stock alerts" value={low.length} delta={low.length ? 'Action needed' : 'All good'} tone={low.length ? 'red' : 'green'} delay={240} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        <div style={{ ...panel, animation: 'fadeUp .5s ease .2s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Sales & Revenue Trend</div>
              <div style={{ fontSize: 12, color: C.muted }}>Daily revenue this week (₹ thousands)</div>
            </div>
            <Tag tone="green">Live</Tag>
          </div>
          <LineChart />
        </div>
        <div style={{ ...panel, animation: 'fadeUp .5s ease .3s both' }}>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Category Share</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>By units in catalogue</div>
          <Donut />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .35s both' }}>
          <div style={{ padding: '18px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Recent Orders & Fulfilment Queue</div>
              <div style={{ fontSize: 12, color: C.muted }}>Live Tamil Nadu retail orders</div>
            </div>
            <AButton small variant="soft" onClick={() => nav('/admin/orders')}>View all</AButton>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['ORDER', 'CUSTOMER', 'ITEMS', 'AMOUNT', 'STATUS', ''].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="row-hover">
                  <td style={{ ...td, fontWeight: 800 }}>{o.id}</td>
                  <td style={td}>{o.customer}<div style={{ fontSize: 11, color: C.muted }}>{o.city}</div></td>
                  <td style={{ ...td, maxWidth: 190, color: C.muted, fontSize: 12.5 }}>{o.items.map((i) => i.name).join(', ')}</td>
                  <td style={{ ...td, fontWeight: 800 }}>{money(o.total)}</td>
                  <td style={td}><Tag tone={orderTone(o.status)}>{o.status}</Tag></td>
                  <td style={td}>
                    {o.status === 'Placed' && <AButton small variant="soft" onClick={() => updateOrderStatus(o.id, 'Packed')}>Pack</AButton>}
                    {o.status === 'Packed' && <AButton small variant="accent" onClick={() => updateOrderStatus(o.id, 'Shipped')}>Ship</AButton>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div style={{ ...panel, animation: 'fadeUp .5s ease .4s both' }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              Critical Stock Alerts <Tag tone={low.length ? 'red' : 'green'}>{low.length}</Tag>
            </div>
            {low.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Nothing below reorder level.</div>}
            {low.slice(0, 4).map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 9, background: C.danger, animation: 'pulseDot 1.4s infinite' }} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>{p.name}<div style={{ fontSize: 11, color: C.danger }}>{p.stock} left · reorder at {p.reorderAt}</div></div>
                <AButton small variant="danger" onClick={() => nav('/admin/inventory')}>Restock</AButton>
              </div>
            ))}
          </div>

          <div style={{ ...panel, animation: 'fadeUp .5s ease .45s both' }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              Care Lab Repair Desk <Tag tone="amber">{openTickets.length} active</Tag>
            </div>
            {openTickets.slice(0, 3).map((t) => (
              <div key={t.id} style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>#{t.id} · {t.device}<div style={{ fontSize: 11, color: C.muted }}>{t.issue}</div></div>
                {t.status === 'Open' && <AButton small variant="soft" onClick={() => setTicketStatus(t.id, 'In Progress')}>Start</AButton>}
                {t.status === 'In Progress' && <AButton small variant="accent" onClick={() => setTicketStatus(t.id, 'Ready')}>Ready</AButton>}
                {t.status === 'Ready' && <AButton small variant="soft" onClick={() => setTicketStatus(t.id, 'Closed')}>Close</AButton>}
              </div>
            ))}
            {openTickets.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No open tickets.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function LineChart() {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const W = 760;
  const H = 230;
  const pad = { l: 36, r: 16, t: 16, b: 28 };
  const max = 180;
  const pts = REVENUE_SERIES.map((d, i) => ({
    x: pad.l + (i * (W - pad.l - pad.r)) / (REVENUE_SERIES.length - 1),
    y: pad.t + (1 - d.value / max) * (H - pad.t - pad.b),
    ...d,
  }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Weekly revenue line chart">
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.primarySoft} stopOpacity="0.28" />
            <stop offset="1" stopColor={C.primarySoft} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 60, 120, 180].map((v) => {
          const y = pad.t + (1 - v / max) * (H - pad.t - pad.b);
          return (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={C.border} strokeDasharray="4 4" />
              <text x={pad.l - 8} y={y + 4} fontSize="11" fill={C.muted} textAnchor="end">{v}</text>
            </g>
          );
        })}
        <path d={area} fill="url(#area)" style={{ opacity: seen ? 1 : 0, transition: 'opacity 1s ease .8s' }} />
        <path d={line} fill="none" stroke={C.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={seen ? 0 : 1} style={{ transition: 'stroke-dashoffset 1.6s ease' }} />
        {pts.map((p, i) => (
          <g key={p.label} style={{ opacity: seen ? 1 : 0, transition: `opacity .4s ease ${0.8 + i * 0.12}s` }}>
            <circle cx={p.x} cy={p.y} r="5.5" fill="#fff" stroke={C.primary} strokeWidth="3" />
            <text x={p.x} y={H - 8} fontSize="11.5" fill={C.muted} textAnchor="middle" fontWeight="700">{p.label}</text>
            <title>{`${p.label}: ₹${p.value}k`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Donut() {
  const { products } = useStore();
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const groups = [
    { label: 'Smartphones', n: products.filter((p) => p.category === 'phone').length, color: C.primary },
    { label: 'Accessories', n: products.filter((p) => p.category === 'accessory').length, color: C.accent },
    { label: 'Audio', n: products.filter((p) => p.category === 'audio').length, color: C.primarySoft },
  ];
  const total = groups.reduce((n, g) => n + g.n, 0) || 1;
  const R = 62;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div ref={ref}>
      <div style={{ position: 'relative', width: 170, height: 170, margin: '4px auto 14px' }}>
        <svg viewBox="0 0 170 170" width="170" height="170" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="85" cy="85" r={R} fill="none" stroke={C.tint} strokeWidth="22" />
          {groups.map((g) => {
            const len = (g.n / total) * circ;
            const el = (
              <circle key={g.label} cx="85" cy="85" r={R} fill="none" stroke={g.color} strokeWidth="22" strokeDasharray={`${seen ? len : 0} ${circ}`} strokeDashoffset={-offset} style={{ transition: 'stroke-dasharray 1.2s ease .2s' }} />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{total}</div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>Products</div>
          </div>
        </div>
      </div>
      {groups.map((g) => (
        <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 0' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: g.color }} />
          <span style={{ flex: 1, fontWeight: 600 }}>{g.label}</span>
          <b>{Math.round((g.n / total) * 100)}%</b>
        </div>
      ))}
    </div>
  );
}
