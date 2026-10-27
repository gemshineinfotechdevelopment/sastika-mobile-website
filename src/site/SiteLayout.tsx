import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import logoImg from '../assets/logo.png';
import { computeTotals } from './pricing';

const NAV_LINKS: { to: string; label: string; icon: IconName; badge?: string }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/mobiles', label: 'All Mobiles', icon: 'phone', badge: '18 Deals' },
  { to: '/accessories', label: 'Accessories', icon: 'headphones' },
  { to: '/appliances', label: 'Home Appliances', icon: 'tv', badge: 'New' },
  { to: '/services', label: 'Care & Repair', icon: 'tool' },
  { to: '/orders', label: 'Track & Orders', icon: 'truck' },
  { to: '/about', label: 'About Showroom', icon: 'award' },
  { to: '/contact', label: 'Stores & Contact', icon: 'pin' },
];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { cart, cartCount, wishlist, products, logo, user, logoutUser, authPromptModal, closeAuthPrompt } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [q, setQ] = useState('');
  const [bump, setBump] = useState(false);
  const prevCount = useRef(cartCount);

  const totals = computeTotals(cart, products, '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDrawer(false);
    setSearching(false);
    setMobileSearch(false);
  }, [pathname]);

  useEffect(() => {
    if (cartCount !== prevCount.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 450);
      prevCount.current = cartCount;
      return () => window.clearTimeout(t);
    }
  }, [cartCount]);

  const results = q.trim()
    ? products
        .filter((p) => (p.name + p.brand + p.color).toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg, color: C.text, width: '100%' }}>
      {/* -------------------- 1. DESKTOP UTILITY TOP BAR -------------------- */}
      <div
        className="site-desktop-top-bar"
        style={{
          background: '#041e1b',
          color: 'rgba(255,255,255,0.85)',
          fontSize: 12,
          padding: '7px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.accent, fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulseDot 1.6s infinite' }} />
              Open 09:30 AM – 09:30 PM (All 7 Days)
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span>📍 Sithurajapuram &amp; Sivakasi Bus Stand</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span>📞 Helpline: <b style={{ color: '#fff' }}>+91 95434 34344</b></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>📄 GSTIN: <b style={{ color: '#fff' }}>33BQTPJ5275L1Z6</b></span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: C.accent, fontWeight: 700 }}>Hi, {user.name.split(' ')[0]}</span>
                <button
                  onClick={() => nav('/orders')}
                  style={{ color: '#fff', fontSize: 11.5, background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 6, cursor: 'pointer', border: 'none' }}
                >
                  My Orders
                </button>
                <button
                  onClick={logoutUser}
                  style={{ color: '#ff8589', fontSize: 11.5, background: 'transparent', cursor: 'pointer', border: 'none' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => nav('/login')}
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon name="user" size={13} /> Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* -------------------- 2. MOBILE STICKY HEADER (<1024px) -------------------- */}
      <header
        className="site-mobile-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: `linear-gradient(135deg, #072a25 0%, ${C.primaryDark} 50%, #052622 100%)`,
          color: '#fff',
          padding: '10px 14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 3px 14px rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setDrawer(true)}
            style={{ color: '#fff', padding: 4, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label="Open menu"
          >
            <Icon name="menu" size={24} />
          </button>
          <div onClick={() => nav('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <img
              src={logo || logoImg}
              alt="Sastika Mobiles"
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d4af37', background: '#fff', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: 14.5, letterSpacing: 0.3, lineHeight: 1.1, color: '#fff' }}>SASTIKA MOBILES</div>
              <div style={{ fontSize: 8.5, letterSpacing: 1.4, color: C.accent, fontWeight: 800 }}>SALES &amp; SERVICE</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setMobileSearch(!mobileSearch)}
            style={{ color: '#fff', padding: 6, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 10, border: 'none', cursor: 'pointer' }}
            aria-label="Search"
          >
            <Icon name={mobileSearch ? 'x' : 'search'} size={18} color="#fff" />
          </button>

          {/* User Button */}
          <button
            onClick={() => nav(user ? '/orders' : '/login')}
            className="tap"
            aria-label="Account"
            title={user ? user.name : 'Sign In'}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Icon name="user" size={18} color="#1e293b" />
            {user && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '1.5px solid #fff',
                }}
              />
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => {
              if (!user) nav('/login?redirect=/account?tab=wishlist');
              else nav('/account?tab=wishlist');
            }}
            className="tap"
            aria-label="Wishlist"
            title="Wishlist"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Icon name="heart" size={18} color="#1e293b" />
            {wishlist.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: C.danger,
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 800,
                  borderRadius: 99,
                  minWidth: 15,
                  height: 15,
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0 2px',
                  border: '1.5px solid #fff',
                }}
              >
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => nav('/cart')}
            className="tap"
            aria-label="Cart"
            title="Cart"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: C.accent,
              border: 'none',
              boxShadow: '0 2px 8px rgba(246,196,69,0.35)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              animation: bump ? 'pop .45s ease' : undefined,
            }}
          >
            <Icon name="cart" size={18} color={C.primaryDark} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: C.danger,
                  color: '#ffffff',
                  fontSize: 9,
                  fontWeight: 900,
                  borderRadius: 99,
                  minWidth: 15,
                  height: 15,
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0 2px',
                  border: '1.5px solid #fff',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Search Input Overlay */}
      {mobileSearch && (
        <div
          className="site-mobile-header"
          style={{
            padding: '10px 14px',
            background: '#fff',
            borderBottom: `1px solid ${C.border}`,
            position: 'sticky',
            top: 58,
            zIndex: 49,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: C.tint2,
              borderRadius: 12,
              padding: '0 12px',
            }}
          >
            <Icon name="search" size={16} color={C.muted} />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSearching(true);
              }}
              placeholder="Search phone models (Redmi, Vivo, OPPO...)"
              style={{
                width: '100%',
                padding: '10px 8px',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                fontWeight: 500,
              }}
            />
            {q && (
              <button
                onClick={() => {
                  setQ('');
                  setSearching(false);
                }}
                style={{ color: C.muted, padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          {searching && q.trim().length > 0 && (
            <div style={{ marginTop: 8, maxHeight: 240, overflowY: 'auto' }}>
              {results.length === 0 ? (
                <div style={{ padding: '12px 6px', fontSize: 12, color: C.muted, textAlign: 'center' }}>
                  No phones found for "{q}"
                </div>
              ) : (
                results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      nav(`/product/${p.id}`);
                      setMobileSearch(false);
                      setSearching(false);
                      setQ('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 4px',
                      borderBottom: `1px solid ${C.tint2}`,
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, background: C.tint }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>{money(p.price)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------- 3. DESKTOP MAIN STICKY NAVBAR (>=1024px) -------------------- */}
      <header
        className="site-desktop-navbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: `linear-gradient(135deg, #072a25 0%, ${C.primaryDark} 50%, #052622 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          width: '100%',
        }}
      >
        {/* Tier 1: Brand Logo + Search Bar + Actions */}
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          {/* Brand Logo & Name */}
          <div
            onClick={() => nav('/')}
            className="tap"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <img
              src={logo || logoImg}
              alt="Sastika Mobiles Logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #d4af37',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                background: '#fff',
                flexShrink: 0,
              }}
            />
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 0.4, color: '#fff' }}>
                SASTIKA MOBILES
              </div>
              <div style={{ fontSize: 9.5, letterSpacing: 1.8, color: C.accent, fontWeight: 800, marginTop: 2 }}>
                SALES &amp; SERVICE • SIVAKASI
              </div>
            </div>
          </div>

          {/* Live Search Bar with Floating Dropdown */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 500 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 99,
                padding: '3px 18px',
                border: '1px solid rgba(255,255,255,0.16)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <Icon name="search" size={17} color="rgba(255,255,255,0.7)" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSearching(true);
                }}
                onFocus={() => setSearching(true)}
                placeholder="Search phone models, brand, budget (Redmi, Vivo, 5G...)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />
              {q && (
                <button
                  onClick={() => {
                    setQ('');
                    setSearching(false);
                  }}
                  style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Desktop Search Dropdown */}
            {searching && q.trim().length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 50,
                  left: 0,
                  right: 0,
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                  border: `1px solid ${C.border}`,
                  overflow: 'hidden',
                  zIndex: 60,
                  animation: 'fadeUp .2s ease',
                }}
              >
                <div style={{ padding: '10px 16px', background: C.tint, fontSize: 11.5, fontWeight: 800, color: C.primarySoft, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>MATCHING PHONES ({results.length})</span>
                  <button onClick={() => setSearching(false)} style={{ color: C.muted, fontSize: 11, background: 'none', border: 'none', cursor: 'pointer' }}>✕ Close</button>
                </div>
                {results.length === 0 ? (
                  <div style={{ padding: '20px 16px', fontSize: 13, color: C.muted, textAlign: 'center' }}>
                    No products found for "{q}"
                  </div>
                ) : (
                  results.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        nav(`/product/${p.id}`);
                        setSearching(false);
                        setQ('');
                      }}
                      className="row-hover"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${C.tint2}`,
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 8, background: C.tint }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {p.brand} • <b style={{ color: C.primary }}>{money(p.price)}</b> • {p.stock} in stock
                        </div>
                      </div>
                      <Icon name="right" size={14} color={C.muted} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Actions (Warranty Badge, User, Heart/Wishlist, Cart) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Sivakasi Official Brand Warranty Invoices Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: 12,
                background: 'rgba(246, 196, 69, 0.12)',
                border: '1px solid rgba(246, 196, 69, 0.3)',
                color: C.accent,
                fontSize: 12.5,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              <span>⚡</span>
              <span>Sivakasi Official Brand Warranty Invoices</span>
            </div>

            {/* User / Account Button */}
            {user ? (
              <button
                onClick={() => nav('/orders')}
                className="tap"
                title={`Account (${user.name})`}
                aria-label="Account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 14,
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: C.accent,
                    color: C.primaryDark,
                    fontSize: 13,
                    fontWeight: 900,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.primaryDark }}>
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => nav('/login')}
                className="tap"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: C.primaryDark,
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Icon name="user" size={15} color={C.primaryDark} />
                <span>Sign In</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => {
                if (!user) nav('/login?redirect=/account?tab=wishlist');
                else nav('/account?tab=wishlist');
              }}
              className="tap"
              title="Saved / Wishlist"
              aria-label="Wishlist"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Icon name="heart" size={20} color="#1e293b" />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    background: C.danger,
                    color: '#fff',
                    fontSize: 9.5,
                    fontWeight: 800,
                    borderRadius: 99,
                    minWidth: 16,
                    height: 16,
                    display: 'grid',
                    placeItems: 'center',
                    padding: '0 3px',
                    border: '2px solid #fff',
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => nav('/cart')}
              className="tap"
              title="Shopping Cart"
              aria-label="Cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 14,
                background: C.accent,
                color: C.primaryDark,
                fontWeight: 800,
                fontSize: 13.5,
                border: 'none',
                boxShadow: '0 3px 12px rgba(246,196,69,0.35)',
                cursor: 'pointer',
                animation: bump ? 'pop .45s ease' : undefined,
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon name="cart" size={19} color={C.primaryDark} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -10,
                      background: C.danger,
                      color: '#ffffff',
                      fontSize: 9.5,
                      fontWeight: 900,
                      borderRadius: 99,
                      minWidth: 16,
                      height: 16,
                      display: 'grid',
                      placeItems: 'center',
                      padding: '0 3px',
                      border: '2px solid #fff',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
              {totals.payable > 0 && <span>• {money(totals.payable)}</span>}
            </button>
          </div>
        </div>

        {/* Tier 2: Category & Directory Links Bar */}
        <div
          style={{
            background: 'rgba(5, 38, 34, 0.96)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            width: '100%',
          }}
        >
          <div
            style={{
              maxWidth: 1360,
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <nav
              className="hide-scroll"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                  {({ isActive }) => (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 12px',
                        fontSize: 13,
                        fontWeight: 700,
                        color: isActive ? C.accent : 'rgba(255,255,255,0.85)',
                        borderBottom: isActive ? `3px solid ${C.accent}` : '3px solid transparent',
                        transition: 'all .18s ease',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon name={l.icon} size={15} color={isActive ? C.accent : 'rgba(255,255,255,0.7)'} />
                      <span>{l.label}</span>
                      {l.badge && (
                        <span
                          style={{
                            background: C.accent,
                            color: C.primaryDark,
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 99,
                            marginLeft: 2,
                          }}
                        >
                          {l.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content View Container */}
      <main style={{ flex: 1, width: '100%', minHeight: '70vh' }}>
        <Outlet />
      </main>

      {/* Desktop / Mobile Responsive Footer */}
      <footer
        className="desktop-footer"
        style={{
          background: `linear-gradient(170deg, ${C.primaryDark}, #052622)`,
          color: '#fff',
          marginTop: 50,
          borderTop: '3px solid #d4af37',
          padding: '48px 36px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 36,
            paddingBottom: 36,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Column 1: Store info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <img
                src={logo || logoImg}
                alt="Sastika Mobiles"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #d4af37',
                }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>Sastika Mobiles</div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.accent, fontWeight: 800 }}>SALES &amp; SERVICE</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px' }}>
              Leading multi-brand smartphone showroom, genuine accessories, and instant repair service in Sivakasi and Sithurajapuram.
            </p>
            <div style={{ fontSize: 12.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
              <div>📍 <b>Branch:</b> Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189.</div>
              <div>📞 <b>Phone / WhatsApp:</b> +91 95434 34344</div>
              <div>📄 <b>GSTIN:</b> 33BQTPJ5275L1Z6</div>
            </div>
          </div>

          {/* Column 2: Care Services */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, color: C.accent, marginBottom: 14 }}>
              CARE &amp; REPAIR SERVICES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              <div>🔧 Same-day Display Replacement (1-Yr Warranty)</div>
              <div>🔋 Certified Battery Replacement &amp; Fitting</div>
              <div>📲 WhatsApp &amp; Contact Data Migration</div>
              <div>🛡️ 42-Point Motherboard Diagnostics</div>
              <div>⚡ 45W/80W/100W Fast Chargers &amp; Glass</div>
              <button
                onClick={() => nav('/services')}
                style={{
                  marginTop: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  color: C.accent,
                  fontWeight: 700,
                  fontSize: 12.5,
                  alignSelf: 'flex-start',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Book Repair Desk →
              </button>
            </div>
          </div>

          {/* Column 4: Invoice Policy */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, color: C.accent, marginBottom: 14 }}>
              INVOICE WARRANTY POLICY
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
              <div>✓ 1-Year official brand warranty on all new smartphones.</div>
              <div>✓ Complete guidance for quick service at authorized brand centers.</div>
              <div>✓ Official GST Tax Invoice provided with every device purchase.</div>
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(246,196,69,0.12)', border: '1px solid rgba(246,196,69,0.3)' }}>
                <b style={{ color: C.accent }}>Store Timings:</b>
                <div style={{ fontSize: 12, color: '#fff' }}>09:30 AM – 09:30 PM (All 7 Days)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            © 2026 <b>Sastika Mobiles</b>. All Rights Reserved. Sivakasi &amp; Sithurajapuram, Tamil Nadu.
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <span style={{ color: C.accent }}>● 100% Secure Checkout</span>
            <button onClick={() => nav('/about')} style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}>About Us</button>
            <button onClick={() => nav('/contact')} style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}>Contact</button>
          </div>
        </div>
      </footer>

      {/* Slide-out Mobile Drawer */}
      {drawer && (
        <>
          <div
            onClick={() => setDrawer(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(6,51,46,.55)',
              zIndex: 100,
              animation: 'fadeIn .25s ease',
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              width: 300,
              background: `linear-gradient(185deg, #072a25 0%, ${C.primaryDark} 50%, #052622 100%)`,
              color: '#fff',
              zIndex: 101,
              animation: 'slideRight .35s cubic-bezier(.2,.8,.2,1)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div onClick={() => { setDrawer(false); nav('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <img
                  src={logo || logoImg}
                  alt="Sastika Mobiles"
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37' }}
                />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 17, color: '#fff' }}>SASTIKA</div>
                  <div style={{ color: C.accent, fontSize: 9.5, letterSpacing: 2, fontWeight: 800 }}>MOBILES</div>
                </div>
              </div>
              <button onClick={() => setDrawer(false)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close"><Icon name="x" size={22} /></button>
            </div>

            {/* User Profile in Drawer */}
            {user ? (
              <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.accent, color: C.primaryDark, fontWeight: 900, fontSize: 14, display: 'grid', placeItems: 'center' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => { setDrawer(false); nav('/orders'); }}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => { logoutUser(); setDrawer(false); }}
                    style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(229,72,77,0.25)', color: '#ff8589', fontSize: 11.5, fontWeight: 800, border: 'none', cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setDrawer(false); nav('/login'); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 14px',
                  borderRadius: 12,
                  background: C.accent,
                  color: C.primaryDark,
                  fontWeight: 800,
                  fontSize: 13,
                  marginBottom: 14,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon name="user" size={16} /> Sign In
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => { setDrawer(false); nav('/admin'); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 12,
                  background: 'rgba(246,196,69,0.18)',
                  border: '1px solid rgba(246,196,69,0.3)',
                  color: C.accent,
                  fontWeight: 800,
                  fontSize: 12,
                  marginBottom: 12,
                  cursor: 'pointer',
                }}
              >
                <Icon name="zap" size={14} /> Admin Portal ⚡
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_LINKS.map((d) => (
                <NavLink key={d.to} to={d.to} end={d.to === '/'} onClick={() => setDrawer(false)}>
                  {({ isActive }) => (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '11px 14px',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 14,
                        background: isActive ? 'rgba(246,196,69,0.18)' : 'transparent',
                        color: isActive ? C.accent : '#fff',
                      }}
                    >
                      <Icon name={d.icon} size={18} /> {d.label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>

            <div style={{ marginTop: 'auto', padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12.5 }}>
              <div style={{ fontWeight: 800, color: C.accent, marginBottom: 2 }}>Need Help?</div>
              Call / WhatsApp: +91 95434 34344
            </div>
          </aside>
        </>
      )}

      {/* Global Auth Prompt Modal */}
      {authPromptModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(6, 42, 37, 0.65)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn .2s ease',
          }}
          onClick={closeAuthPrompt}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 390,
              background: '#ffffff',
              borderRadius: 20,
              padding: '24px 22px 20px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
              border: `1.5px solid ${C.border}`,
              textAlign: 'center',
              animation: 'pop .25s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: C.tint,
                border: `2px solid ${C.primarySoft}`,
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 14px',
                color: C.primary,
                fontSize: 26,
                boxShadow: '0 4px 14px rgba(11,74,67,0.12)',
              }}
            >
              🔒
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 900, color: C.text }}>
              {authPromptModal.title || 'Sign In Required'}
            </h3>

            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>
              {authPromptModal.message}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <button
                type="button"
                onClick={() => {
                  const target = authPromptModal.redirectUrl ? `?redirect=${encodeURIComponent(authPromptModal.redirectUrl)}` : '';
                  closeAuthPrompt();
                  nav(`/login${target}`);
                }}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(11,74,67,0.25)',
                  transition: 'transform .15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                Sign In to Account →
              </button>

              <button
                type="button"
                onClick={closeAuthPrompt}
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: 'none',
                  color: C.muted,
                  fontSize: 13,
                  fontWeight: 700,
                  border: `1px solid ${C.border}`,
                  cursor: 'pointer',
                }}
              >
                Keep Browsing (View Only)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
