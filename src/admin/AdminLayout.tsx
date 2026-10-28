import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import logoImg from '../assets/logo.png';

const LINKS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Overview', icon: 'chart', end: true },
  { to: '/admin/flash-deals', label: 'Flash Deal Drop', icon: 'zap' },
  { to: '/admin/products', label: 'Products', icon: 'phone' },
  { to: '/admin/appliances', label: 'Home Appliances', icon: 'tv' },
  { to: '/admin/orders', label: 'Orders', icon: 'box' },
  { to: '/admin/inventory', label: 'Inventory & Stock', icon: 'grid' },
  { to: '/admin/service', label: 'Service Desk', icon: 'tool' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function AdminLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { products, orders, tickets, logo } = useStore();
  const [q, setQ] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const mainEl = document.querySelector('.admin-main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const adminToken = localStorage.getItem('sastika_admin_token') || sessionStorage.getItem('sastika_admin_token');
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('sastika_admin_token');
    localStorage.removeItem('sastika_admin_user');
    sessionStorage.removeItem('sastika_admin_token');
    nav('/admin/login', { replace: true });
  };

  const low = products.filter((p) => p.stock <= p.reorderAt).length;
  const openOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Packed').length;
  const openTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const badge: Record<string, number> = { '/admin/inventory': low, '/admin/orders': openOrders, '/admin/service': openTickets };

  const search = () => {
    if (!q.trim()) return;
    nav(`/admin/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="admin-root-container">
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            background: 'rgba(6, 42, 37, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn .2s ease',
          }}
        />
      )}

      {/* Sidebar Navigation (Desktop persistent / Mobile slide-over drawer) */}
      <aside className={`admin-sidebar ${mobileNavOpen ? 'admin-sidebar-open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 18px', borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <img
              src={logo || logoImg}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = logoImg; }}
              alt="Sastikaa Mobiles Logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #d4af37',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 0.3 }}>SASTIKAA</div>
              <div style={{ fontSize: 9.5, letterSpacing: 1.5, color: C.accent, fontWeight: 800 }}>ADMIN PORTAL</div>
            </div>
          </div>
          {/* Close button inside mobile drawer */}
          <button
            type="button"
            className="admin-mobile-only"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            style={{
              background: 'rgba(255,255,255,.14)',
              color: '#fff',
              width: 32,
              height: 32,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 800,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, opacity: 0.55, padding: '0 10px 8px' }}>MANAGEMENT</div>
        {LINKS.map((l, i) => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMobileNavOpen(false)} style={{ animation: `fadeUp .4s ease ${i * 40}ms both` }}>
            {({ isActive }) => (
              <div
                className="row-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 12px',
                  borderRadius: 12,
                  marginBottom: 3,
                  fontWeight: 700,
                  fontSize: 13.5,
                  background: isActive ? 'rgba(255,255,255,.15)' : 'transparent',
                  color: isActive ? C.accent : 'rgba(255,255,255,.88)',
                  position: 'relative',
                }}
              >
                {isActive && <span style={{ position: 'absolute', left: -14, top: 10, bottom: 10, width: 4, borderRadius: 4, background: C.accent }} />}
                <Icon name={l.icon} size={18} />
                <span style={{ flex: 1 }}>{l.label}</span>
                {badge[l.to] > 0 && (
                  <span style={{ background: l.to === '/admin/inventory' ? C.danger : C.accent, color: l.to === '/admin/inventory' ? '#fff' : C.primaryDark, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>
                    {badge[l.to]}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 18 }}>
          <button className="tap" onClick={() => { setMobileNavOpen(false); nav('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.08)', color: '#fff', fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>
            <Icon name="external" size={15} /> View Storefront
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(0,0,0,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: 99, background: C.accent, color: C.primaryDark, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 13 }}>A</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 800, fontSize: 12.5 }}>Super Admin</div>
                <div style={{ fontSize: 10.5, opacity: 0.75 }}>Store Manager</div>
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              className="tap"
              title="Sign Out from Admin"
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#fca5a5',
                padding: '6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon name="logout" size={13} color="#fca5a5" /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-header">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            className="admin-mobile-only tap"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Toggle navigation menu"
            style={{
              background: C.primary,
              color: '#fff',
              padding: '7px 11px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 6px rgba(11,74,67,.2)',
            }}
          >
            <span style={{ fontSize: 16 }}>☰</span>
            <span style={{ fontSize: 11, letterSpacing: 0.5 }}>MENU</span>
            {(low > 0 || openOrders > 0 || openTickets > 0) && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent }} />
            )}
          </button>

          {/* Mobile Brand Title */}
          <div className="admin-mobile-only" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900, fontSize: 13, color: C.primary }}>
            <span>SASTIKAA</span>
            <span style={{ fontSize: 8.5, background: C.accent, color: C.primaryDark, padding: '1px 5px', borderRadius: 4, fontWeight: 900 }}>ADMIN</span>
          </div>

          {/* Desktop Search Box */}
          <div className="admin-desktop-only" style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <span style={{ position: 'absolute', left: 12, top: 11, color: C.muted }}><Icon name="search" size={17} /></span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search IMEI, SKU, products…  (Enter)"
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.tint2, fontSize: 13.5 }}
            />
          </div>

          {/* Desktop Location Pin */}
          <div className="admin-desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 12, background: C.tint, color: C.primary, fontSize: 12.5, fontWeight: 700, border: `1px solid ${C.border}` }}>
            <Icon name="pin" size={14} color={C.primary} />
            <span>Sithurajapuram, Sivakasi</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Action Buttons */}
          <button
            onClick={() => nav('/admin/products?new=1')}
            className="tap"
            title="Add New Product"
            aria-label="Add New Product"
            style={{
              background: C.primary,
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              padding: '7px 11px',
              borderRadius: 9,
              display: 'flex',
              gap: 5,
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon name="plus" size={14} />
            <span style={{ fontWeight: 700, fontSize: 11.5 }}>Product</span>
          </button>

          <button onClick={() => nav('/admin/service')} className="tap admin-desktop-only" style={{ background: C.accent, color: C.primaryDark, fontWeight: 700, fontSize: 12.5, padding: '8px 12px', borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="tool" size={14} /> Service Ticket
          </button>

          <div className="admin-desktop-only" style={{ position: 'relative' }}>
            <Icon name="bell" size={19} />
            {low > 0 && <span style={{ position: 'absolute', top: -4, right: -5, width: 9, height: 9, borderRadius: 9, background: C.danger, animation: 'pulseDot 1.4s infinite' }} />}
          </div>

          <button
            onClick={handleAdminLogout}
            className="tap"
            style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '7px 10px',
              borderRadius: 9,
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
            }}
          >
            <Icon name="logout" size={13} color="#dc2626" /> <span className="admin-desktop-only">Logout</span>
          </button>
        </header>

        {/* Dynamic Page Outlet with responsive padding */}
        <div key={pathname} className="admin-page-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
