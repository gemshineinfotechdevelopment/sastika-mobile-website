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
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>📄 GSTIN: <b style={{ color: '#fff' }}>33BQTPJ5275L1Z6</b></span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <button
              onClick={() => nav('/admin')}
              className="tap"
              style={{
                color: C.accent,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <Icon name="zap" size={13} color={C.accent} /> Admin Portal ⚡
            </button>
          </div>
        </div>
      </div>

      {/* -------------------- 2. DESKTOP MAIN STICKY NAVBAR -------------------- */}
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
                border: '1.5px solid rgba(255,255,255,0.22)',
                padding: '0 16px',
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
                placeholder="Search phone models (Redmi, OPPO, Vivo, Poco, Samsung...)"
                style={{
                  width: '100%',
                  padding: '10px 10px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: '#fff',
                }}
              />
              {q && (
                <button
                  onClick={() => {
                    setQ('');
                    setSearching(false);
                  }}
                  style={{ color: 'rgba(255,255,255,0.7)' }}
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
                  marginTop: 8,
                  background: '#fff',
                  borderRadius: 18,
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
                  overflow: 'hidden',
                  zIndex: 60,
                  animation: 'fadeUp .2s ease',
                }}
              >
                <div style={{ padding: '10px 16px', background: C.tint, fontSize: 11.5, fontWeight: 800, color: C.primarySoft, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>MATCHING PHONES ({results.length})</span>
                  <button onClick={() => setSearching(false)} style={{ color: C.muted, fontSize: 11 }}>✕ Close</button>
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

          {/* Quick Actions (Wishlist, Account, Cart) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Wishlist */}
            <button
              onClick={() => nav('/account')}
              className="tap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
              }}
            >
              <Icon name="heart" size={16} color={wishlist.length > 0 ? C.accent : 'rgba(255,255,255,0.85)'} />
              <span>Wishlist{wishlist.length > 0 ? ` (${wishlist.length})` : ''}</span>
            </button>

            {/* Account / Orders */}
            <button
              onClick={() => nav('/account')}
              className="tap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
              }}
            >
              <Icon name="user" size={16} color="rgba(255,255,255,0.85)" />
              <span>Account</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => nav('/cart')}
              className="tap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 99,
                background: C.accent,
                color: C.primaryDark,
                fontWeight: 900,
                fontSize: 13.5,
                boxShadow: '0 4px 16px rgba(246,196,69,0.3)',
                animation: bump ? 'pop .45s ease' : undefined,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon name="cart" size={17} color={C.primaryDark} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -7,
                      right: -9,
                      background: C.danger,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 99,
                      minWidth: 16,
                      height: 16,
                      display: 'grid',
                      placeItems: 'center',
                      padding: '0 3px',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
              {totals.payable > 0 && <span style={{ opacity: 0.9 }}>• {money(totals.payable)}</span>}
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
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                  {({ isActive }) => (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '11px 14px',
                        fontSize: 13.5,
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
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 7px',
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

            {/* Right side tag in Tier 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.accent, fontWeight: 700 }}>
              <span>⚡ Sivakasi Official Brand Warranty Invoices</span>
            </div>
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
