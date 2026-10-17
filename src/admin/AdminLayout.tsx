import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import logoImg from '../assets/logo.png';

const LINKS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Overview', icon: 'chart', end: true },
  { to: '/admin/products', label: 'Products', icon: 'phone' },
  { to: '/admin/orders', label: 'Orders', icon: 'box' },
  { to: '/admin/inventory', label: 'Inventory & Stock', icon: 'grid' },
  { to: '/admin/service', label: 'Service Desk', icon: 'tool' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function AdminLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { products, orders, tickets } = useStore();
  const [q, setQ] = useState('');
  const [branch, setBranch] = useState('Chennai · T. Nagar Flagship');

  const low = products.filter((p) => p.stock <= p.reorderAt).length;
  const openOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Packed').length;
  const openTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const badge: Record<string, number> = { '/admin/inventory': low, '/admin/orders': openOrders, '/admin/service': openTickets };

  const search = () => {
    if (!q.trim()) return;
    nav(`/admin/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, minWidth: 1100 }}>
      <aside style={{ width: 252, background: C.primary, color: '#fff', padding: '22px 14px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 8px 22px' }}>
          <img
            src={logoImg}
            alt="Sastika Mobiles Logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #d4af37',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.2 }}>SASTIKA</div>
            <div style={{ fontSize: 9.5, letterSpacing: 2, color: C.accent, fontWeight: 800 }}>ADMIN PORTAL</div>
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, opacity: 0.55, padding: '0 10px 8px' }}>MANAGEMENT</div>
        {LINKS.map((l, i) => (
          <NavLink key={l.to} to={l.to} end={l.end} style={{ animation: `fadeUp .4s ease ${i * 50}ms both` }}>
            {({ isActive }) => (
              <div
                className="row-hover"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 12, marginBottom: 3, fontWeight: 700, fontSize: 14, background: isActive ? 'rgba(255,255,255,.14)' : 'transparent', color: isActive ? C.accent : 'rgba(255,255,255,.85)', position: 'relative' }}
              >
                {isActive && <span style={{ position: 'absolute', left: -14, top: 10, bottom: 10, width: 4, borderRadius: 4, background: C.accent }} />}
                <Icon name={l.icon} size={18} />
                <span style={{ flex: 1 }}>{l.label}</span>
                {badge[l.to] > 0 && (
                  <span style={{ background: l.to === '/admin/inventory' ? C.danger : C.accent, color: l.to === '/admin/inventory' ? '#fff' : C.primaryDark, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>{badge[l.to]}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <button className="tap" onClick={() => nav('/')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, background: 'rgba(255,255,255,.08)', color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
            <Icon name="external" size={16} /> View Storefront
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, background: 'rgba(0,0,0,.2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: C.accent, color: C.primaryDark, display: 'grid', placeItems: 'center', fontWeight: 800 }}>A</div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Super Admin</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Store Manager</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.border}`, padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <span style={{ position: 'absolute', left: 12, top: 11, color: C.muted }}><Icon name="search" size={17} /></span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search IMEI, SKU, products…  (Enter)"
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.tint2, fontSize: 13.5 }}
            />
          </div>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: '#fff', fontWeight: 700, fontSize: 13 }}>
            <option>Chennai · T. Nagar Flagship</option>
            <option>Chennai · OMR Tech Hub</option>
            <option>Chennai · Anna Nagar</option>
          </select>
          <div style={{ flex: 1 }} />
          <button onClick={() => nav('/admin/products?new=1')} className="tap" style={{ background: C.primary, color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 14px', borderRadius: 11, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="plus" size={15} /> Product
          </button>
          <button onClick={() => nav('/admin/service')} className="tap" style={{ background: C.accent, color: C.primaryDark, fontWeight: 700, fontSize: 13, padding: '10px 14px', borderRadius: 11, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="tool" size={15} /> Service Ticket
          </button>
          <div style={{ position: 'relative' }}>
            <Icon name="bell" size={20} />
            {low > 0 && <span style={{ position: 'absolute', top: -4, right: -5, width: 9, height: 9, borderRadius: 9, background: C.danger, animation: 'pulseDot 1.4s infinite' }} />}
          </div>
        </header>

        <div key={pathname} style={{ padding: '26px 28px 40px', maxWidth: 1500 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
