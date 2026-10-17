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
  { to: '/services', label: 'Care & Repair', icon: 'tool' },
  { to: '/track', label: 'Track Device', icon: 'search' },
  { to: '/about', label: 'About Showroom', icon: 'award' },
  { to: '/contact', label: 'Stores & Contact', icon: 'pin' },
];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { cart, cartCount, wishlist, products, logo } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const [bump, setBump] = useState(false);
  const prevCount = useRef(cartCount);

  const totals = computeTotals(cart, products, '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDrawer(false);
    setSearching(false);
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
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
      {/* -------------------- DESKTOP SIDEBAR -------------------- */}
      <aside
        className="site-desktop-sidebar hide-scroll"
        style={{
          width: 270,
          background: `linear-gradient(185deg, #072a25 0%, ${C.primaryDark} 50%, #052622 100%)`,
          color: '#fff',
          padding: '22px 16px 20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexDirection: 'column',
          flexShrink: 0,
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 40,
          overflowY: 'auto',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Brand Header */}
        <div
          onClick={() => nav('/')}
          className="tap"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '4px 8px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 16,
          }}
        >
          <img
            src={logo || logoImg}
            alt="Sastika Mobiles Logo"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #d4af37',
              boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
              background: '#fff',
              flexShrink: 0,
            }}
          />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: 0.3, color: '#fff' }}>
              SASTIKA MOBILES
            </div>
            <div style={{ fontSize: 9.5, letterSpacing: 1.8, color: C.accent, fontWeight: 800, marginTop: 3 }}>
              SALES &amp; SERVICE
            </div>
          </div>
        </div>

        {/* Live Store Timings & Location Chip */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 16,
            fontSize: 11.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.accent, fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulseDot 1.6s infinite' }} />
            Open 09:30 AM – 09:30 PM
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4 }}>
            📍 Sithurajapuram &amp; Sivakasi Bus Stand
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, opacity: 0.6, padding: '0 10px 8px', color: '#fff' }}>
          STORE DIRECTORY
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}>
              {({ isActive }) => (
                <div
                  className="row-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13.5,
                    background: isActive ? 'rgba(246,196,69,0.16)' : 'transparent',
                    color: isActive ? C.accent : 'rgba(255,255,255,0.85)',
                    border: isActive ? '1px solid rgba(246,196,69,0.3)' : '1px solid transparent',
                    position: 'relative',
                    transition: 'all .2s ease',
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: -16,
                        top: 8,
                        bottom: 8,
                        width: 4,
                        borderRadius: 4,
                        background: C.accent,
                      }}
                    />
                  )}
                  <Icon name={l.icon} size={17} color={isActive ? C.accent : 'rgba(255,255,255,0.8)'} />
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {l.badge && (
                    <span
                      style={{
                        background: C.accent,
                        color: C.primaryDark,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 99,
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

        {/* Quick Cart & Shopping Action Card */}
        <div style={{ marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, opacity: 0.6, padding: '0 10px 8px', color: '#fff' }}>
            MY SHOPPING
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            {/* Cart Button */}
            <button
              onClick={() => nav('/cart')}
              className="tap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: cartCount > 0 ? C.accent : 'rgba(255,255,255,0.08)',
                color: cartCount > 0 ? C.primaryDark : '#fff',
                fontWeight: 800,
                fontSize: 13,
                animation: bump ? 'pop .45s ease' : undefined,
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon name="cart" size={17} color={cartCount > 0 ? C.primaryDark : '#fff'} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -8,
                      background: C.danger,
                      color: '#fff',
                      fontSize: 9.5,
                      fontWeight: 800,
                      borderRadius: 99,
                      minWidth: 15,
                      height: 15,
                      display: 'grid',
                      placeItems: 'center',
                      padding: '0 3px',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span style={{ flex: 1, textAlign: 'left' }}>Cart</span>
              <span>{totals.payable > 0 ? money(totals.payable) : '0 Items'}</span>
            </button>

            {/* Wishlist & Account */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                onClick={() => nav('/account')}
                className="tap"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 8px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Icon name="heart" size={15} color={wishlist.length > 0 ? C.accent : '#fff'} />
                <span>Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ''}</span>
              </button>

              <button
                onClick={() => nav('/account')}
                className="tap"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 8px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Icon name="user" size={15} />
                <span>Orders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <button
            onClick={() => nav('/admin')}
            className="tap"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(246,196,69,0.15)',
              border: '1px solid rgba(246,196,69,0.3)',
              color: C.accent,
              fontWeight: 800,
              fontSize: 12.5,
              marginBottom: 10,
              cursor: 'pointer',
            }}
          >
            <Icon name="zap" size={15} /> Admin Portal ⚡
          </button>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.25)',
              fontSize: 11,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <div>📞 Helpline: <b style={{ color: '#fff' }}>+91 95434 34344</b></div>
            <div>📄 GSTIN: <b style={{ color: '#fff' }}>33BQTPJ5275L1Z6</b></div>
          </div>
        </div>
      </aside>

      {/* -------------------- RIGHT MAIN AREA -------------------- */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header (Shows on screens < 1024px) */}
        <header
          className="site-mobile-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: `linear-gradient(90deg, ${C.primaryDark}, ${C.primary})`,
            color: '#fff',
            padding: '12px 16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setDrawer(true)}
              style={{ color: '#fff', padding: 4 }}
              aria-label="Open menu"
            >
              <Icon name="menu" size={24} />
            </button>
            <div onClick={() => nav('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <img src={logo || logoImg} alt="Sastika Mobiles" style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #d4af37' }} />
              <div style={{ fontWeight: 900, fontSize: 16 }}>SASTIKA MOBILES</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => nav('/cart')}
              style={{
                position: 'relative',
                background: C.accent,
                color: C.primaryDark,
                padding: '6px 12px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="cart" size={15} />
              <span>{cartCount}</span>
            </button>
          </div>
        </header>

        {/* Desktop Sticky Top Utility Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 35,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${C.border}`,
            padding: '12px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Live Search Bar */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 500 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: C.tint2,
                borderRadius: 14,
                border: `1.5px solid ${C.border}`,
                padding: '0 14px',
              }}
            >
              <Icon name="search" size={17} color={C.muted} />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSearching(true);
                }}
                onFocus={() => setSearching(true)}
                placeholder="Search phone models (Redmi, OPPO, Vivo, Poco, Samsung...)"
                style={{
                  width: '100%',
                  padding: '10px 10px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              />
              {q && (
                <button
                  onClick={() => {
                    setQ('');
                    setSearching(false);
                  }}
                  style={{ color: C.muted }}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>

            {/* Search Dropdown Popup */}
            {searching && q.trim().length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  background: '#fff',
                  borderRadius: 16,
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 16px 36px rgba(11,74,67,0.18)',
                  overflow: 'hidden',
                  zIndex: 50,
                  animation: 'fadeUp .2s ease',
                }}
              >
                <div style={{ padding: '10px 14px', background: C.tint, fontSize: 11.5, fontWeight: 800, color: C.primarySoft }}>
                  MATCHING PHONES ({results.length})
                </div>
                {results.length === 0 ? (
                  <div style={{ padding: '18px 14px', fontSize: 13, color: C.muted, textAlign: 'center' }}>
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
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${C.tint2}`,
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: C.tint }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
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

          {/* Location & Guarantee info badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 12, background: C.tint, border: `1px solid ${C.border}`, fontSize: 12.5, fontWeight: 700, color: C.primary }}>
            <Icon name="pin" size={14} color={C.primary} />
            <span>Sithurajapuram &amp; Sivakasi</span>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => nav('/cart')}
              className="tap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 14,
                background: C.primary,
                color: '#fff',
                fontWeight: 800,
                fontSize: 13.5,
                boxShadow: '0 4px 14px rgba(11,74,67,0.22)',
                cursor: 'pointer',
              }}
            >
              <Icon name="cart" size={17} color="#fff" />
              <span>Cart ({cartCount})</span>
              {totals.payable > 0 && <span style={{ color: C.accent }}>• {money(totals.payable)}</span>}
            </button>
          </div>
        </header>

        {/* Main Content View Container */}
        <main style={{ flex: 1, width: '100%', minHeight: '70vh' }}>
          <Outlet />
        </main>

        {/* Desktop Footer */}
        <footer
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
                <div>📍 <b>Branch 1:</b> Sri Renga Complex, Near Kennedy Medical, Sithurajapuram.</div>
                <div>📍 <b>Branch 2:</b> Sivakasi Bus Stand, Sivakasi.</div>
                <div>📞 <b>Phone / WhatsApp:</b> +91 95434 34344</div>
                <div>📄 <b>GSTIN:</b> 33BQTPJ5275L1Z6</div>
              </div>
            </div>

            {/* Column 2: 5G Smartphone Brands */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, color: C.accent, marginBottom: 14 }}>
                POPULAR 5G BRANDS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                {['Redmi 5G', 'OPPO 5G', 'Vivo 5G', 'Nothing 5G', 'Samsung Galaxy', 'Poco 5G', 'Fast Chargers', 'ANC Audio'].map((b) => (
                  <button
                    key={b}
                    onClick={() => nav('/mobiles')}
                    style={{
                      textAlign: 'left',
                      color: 'rgba(255,255,255,0.8)',
                      padding: '6px 0',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'color .2s ease',
                    }}
                  >
                    › {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Care Services */}
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
              <button onClick={() => nav('/about')} style={{ color: 'rgba(255,255,255,0.8)' }}>About Us</button>
              <button onClick={() => nav('/contact')} style={{ color: 'rgba(255,255,255,0.8)' }}>Contact</button>
              <button onClick={() => nav('/admin')} style={{ color: C.accent, fontWeight: 700 }}>Admin Login</button>
            </div>
          </div>
        </footer>
      </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
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
              <button onClick={() => setDrawer(false)} style={{ color: '#fff' }} aria-label="Close"><Icon name="x" size={22} /></button>
            </div>
            {NAV_LINKS.map((d) => (
              <NavLink key={d.to} to={d.to} end={d.to === '/'} onClick={() => setDrawer(false)}>
                {({ isActive }) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '13px 14px',
                      borderRadius: 14,
                      fontWeight: 700,
                      fontSize: 14.5,
                      background: isActive ? 'rgba(246,196,69,0.18)' : 'transparent',
                      color: isActive ? C.accent : '#fff',
                    }}
                  >
                    <Icon name={d.icon} size={18} /> {d.label}
                  </div>
                )}
              </NavLink>
            ))}
            <div style={{ marginTop: 'auto', padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12.5 }}>
              <div style={{ fontWeight: 800, color: C.accent, marginBottom: 2 }}>Need Help?</div>
              Call / WhatsApp: +91 95434 34344
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
