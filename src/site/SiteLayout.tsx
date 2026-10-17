import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import logoImg from '../assets/logo.png';
import { computeTotals } from './pricing';

const NAV_LINKS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/mobiles', label: 'All Mobiles', icon: 'phone' },
  { to: '/accessories', label: 'Accessories', icon: 'headphones' },
  { to: '/services', label: 'Care & Repair', icon: 'tool' },
  { to: '/about', label: 'About Us', icon: 'award' },
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, color: C.text }}>
      {/* Top Announcement Bar */}
      <div
        style={{
          background: C.primaryDark,
          color: 'rgba(255,255,255,0.92)',
          fontSize: 12,
          fontWeight: 600,
          padding: '7px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent, animation: 'pulseDot 1.6s infinite' }} />
              <b>சஷ்டிகா மொபைல்ஸ் (Sastika Mobiles)</b> • Sivakasi & Sithurajapuram
            </span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ color: C.accent, fontWeight: 700 }}>100% Original Sealed Devices • 1-Year Brand Warranty • GST Tax Invoice</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Helpline: <b style={{ color: '#fff' }}>+91 95434 34344</b></span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>GSTIN: <b style={{ color: '#fff' }}>33BQTPJ5275L1Z6</b></span>
            <span style={{ opacity: 0.5 }}>|</span>
            <button
              onClick={() => nav('/admin')}
              style={{
                color: C.accent,
                fontWeight: 800,
                fontSize: 11.5,
                background: 'rgba(246,196,69,0.15)',
                padding: '3px 10px',
                borderRadius: 99,
                border: '1px solid rgba(246,196,69,0.3)',
                cursor: 'pointer',
              }}
            >
              Admin Portal ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Main Desktop Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.border}`,
          boxShadow: '0 4px 20px rgba(11,74,67,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Brand Logo & Title */}
          <div
            onClick={() => nav('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
          >
            <img
              src={logo || logoImg}
              alt="Sastika Mobiles Logo"
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #d4af37',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.4, color: C.primary, lineHeight: 1.1 }}>
                SASTIKA MOBILES
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.2, color: '#b8860b' }}>
                SIVAKASI & SITHURAJAPURAM
              </div>
            </div>
          </div>

          {/* Search Bar with live dropdown */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 440, minWidth: 260 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: C.tint2,
                borderRadius: 14,
                border: `1.5px solid ${C.border}`,
                padding: '0 14px',
                transition: 'border-color .2s ease',
              }}
            >
              <Icon name="search" size={18} color={C.muted} />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSearching(true);
                }}
                onFocus={() => setSearching(true)}
                placeholder="Search Redmi, OPPO, Vivo, Poco, Samsung…"
                style={{
                  width: '100%',
                  padding: '11px 10px',
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

            {/* Live Search Results Popup */}
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
                  MATCHING PHONES & GEAR ({results.length})
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

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                style={({ isActive }) => ({
                  padding: '9px 14px',
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  color: isActive ? C.primary : C.text,
                  background: isActive ? C.tint : 'transparent',
                  transition: 'all .2s ease',
                  textDecoration: 'none',
                })}
              >
                <Icon name={l.icon} size={16} />
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons: Wishlist, Account, Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Wishlist */}
            <button
              className="tap"
              onClick={() => nav('/account')}
              style={{
                position: 'relative',
                width: 40,
                height: 40,
                borderRadius: 12,
                background: C.tint2,
                border: `1px solid ${C.border}`,
                display: 'grid',
                placeItems: 'center',
                color: C.primary,
              }}
              title="Saved Wishlist"
            >
              <Icon name="heart" size={19} />
              {wishlist.length > 0 && <Badge n={wishlist.length} tone="accent" />}
            </button>

            {/* My Orders / Account */}
            <button
              className="tap"
              onClick={() => nav('/account')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: C.tint2,
                border: `1px solid ${C.border}`,
                display: 'grid',
                placeItems: 'center',
                color: C.primary,
              }}
              title="My Account & Orders"
            >
              <Icon name="user" size={19} />
            </button>

            {/* Cart Button */}
            <button
              className="tap"
              onClick={() => nav('/cart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 16px',
                borderRadius: 14,
                background: C.primary,
                color: '#fff',
                fontWeight: 800,
                fontSize: 13.5,
                boxShadow: '0 4px 14px rgba(11,74,67,0.25)',
                animation: bump ? 'pop .45s ease' : undefined,
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
                <Icon name="cart" size={18} color="#fff" />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -10,
                      background: C.accent,
                      color: C.primaryDark,
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 99,
                      minWidth: 17,
                      height: 17,
                      display: 'grid',
                      placeItems: 'center',
                      padding: '0 3px',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart {totals.payable > 0 ? `• ${money(totals.payable)}` : ''}</span>
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              className="tap"
              onClick={() => setDrawer(true)}
              style={{
                display: 'none', // Handled via responsive or media query fallback
                width: 40,
                height: 40,
                borderRadius: 12,
                background: C.tint2,
                placeItems: 'center',
              }}
              aria-label="Toggle menu"
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Body (Expansive Desktop Container) */}
      <main style={{ flex: 1, width: '100%', minHeight: '65vh' }}>
        <Outlet />
      </main>

      {/* Comprehensive Desktop Footer */}
      <footer
        style={{
          background: `linear-gradient(170deg, ${C.primaryDark}, #052622)`,
          color: '#fff',
          marginTop: 60,
          borderTop: '3px solid #d4af37',
          padding: '50px 24px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 40,
            paddingBottom: 40,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Column 1: Store profile */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <img
                src={logo || logoImg}
                alt="Sastika Mobiles"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #d4af37',
                }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>சஷ்டிகா மொபைல்ஸ்</div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.accent, fontWeight: 800 }}>SASTIKA MOBILES</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px' }}>
              சிவகாசி மற்றும் சித்துராஜபுரத்தில் முன்னணி மல்டி-பிராண்ட் ஸ்மார்ட்போன்கள், ஒரிஜினல் உதிரிபாகங்கள் மற்றும் உடனடி பழுதுநீக்கம் (Repair & Service).
            </p>
            <div style={{ fontSize: 12.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
              <div>📍 <b>கிளை 1:</b> ஸ்ரீ ரெங்கா காம்ப்ளக்ஸ், கென்னடி மெடிக்கல் அருகில், சித்துராஜபுரம்.</div>
              <div>📍 <b>கிளை 2:</b> சிவகாசி பஸ் நிலையம், சிவகாசி.</div>
              <div>📞 <b>தொலைபேசி / WhatsApp:</b> +91 95434 34344</div>
              <div>📄 <b>GSTIN:</b> 33BQTPJ5275L1Z6</div>
            </div>
          </div>

          {/* Column 2: In-Stock Smartphone Brands */}
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

          {/* Column 3: Sastika Care & Services */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, color: C.accent, marginBottom: 14 }}>
              CARE & REPAIR SERVICES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              <div>🔧 Same-day Display Replacement (1-Yr Warranty)</div>
              <div>🔋 Certified Battery Replacement & Fitting</div>
              <div>📲 WhatsApp & Contact Data Migration</div>
              <div>🛡️ 42-Point Motherboard Diagnostics</div>
              <div>⚡ 45W/80W/100W Fast Chargers & Glass</div>
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

          {/* Column 4: Invoice Warranty Policy */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, color: C.accent, marginBottom: 14 }}>
              INVOICE WARRANTY POLICY
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
              <div>✓ அனைத்து புதிய மொபைல்களுக்கும் 1 வருடம் கம்பெனி வாரண்டி உண்டு.</div>
              <div>✓ கம்பெனி சர்வீஸ் சென்டரில் விரைவான உதவிக்கு முழு வழிகாட்டுதல்.</div>
              <div>✓ முறையான GST Tax Invoice உடன் மட்டுமே விற்பனை செய்யப்படும்.</div>
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(246,196,69,0.12)', border: '1px solid rgba(246,196,69,0.3)' }}>
                <b style={{ color: C.accent }}>Store Timings:</b>
                <div style={{ fontSize: 12, color: '#fff' }}>09:30 AM – 09:30 PM (All 7 Days)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & admin bar */}
        <div
          style={{
            maxWidth: 1360,
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
            © 2026 <b>Sastika Mobiles</b> (சஷ்டிகா மொபைல்ஸ்). All Rights Reserved. Sivakasi & Sithurajapuram, Tamil Nadu.
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <span style={{ color: C.accent }}>● 100% Secure Checkout</span>
            <button onClick={() => nav('/about')} style={{ color: 'rgba(255,255,255,0.8)' }}>About Us</button>
            <button onClick={() => nav('/contact')} style={{ color: 'rgba(255,255,255,0.8)' }}>Contact</button>
            <button onClick={() => nav('/admin')} style={{ color: C.accent, fontWeight: 700 }}>Admin Login</button>
          </div>
        </div>
      </footer>

      {/* Slide-out Drawer for smaller devices */}
      {drawer && (
        <>
          <div
            onClick={() => setDrawer(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(6,51,46,.5)',
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
              background: '#fff',
              zIndex: 101,
              animation: 'slideRight .35s cubic-bezier(.2,.8,.2,1)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div onClick={() => { setDrawer(false); nav('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <img
                  src={logo || logoImg}
                  alt="Sastika Mobiles Logo"
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37' }}
                />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 17, color: C.primary }}>SASTIKA</div>
                  <div style={{ color: '#b8860b', fontSize: 9.5, letterSpacing: 2, fontWeight: 800 }}>MOBILES</div>
                </div>
              </div>
              <button onClick={() => setDrawer(false)} aria-label="Close"><Icon name="x" size={22} /></button>
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
                      background: isActive ? C.tint : 'transparent',
                      color: isActive ? C.primary : C.text,
                    }}
                  >
                    <Icon name={d.icon} size={18} /> {d.label}
                  </div>
                )}
              </NavLink>
            ))}
            <div style={{ marginTop: 'auto', padding: 14, borderRadius: 16, background: C.primary, color: '#fff', fontSize: 12.5 }}>
              <div style={{ fontWeight: 800, color: C.accent, marginBottom: 2 }}>Need Help?</div>
              Call +91 95434 34344
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function Badge({ n, tone }: { n: number; tone: 'dark' | 'accent' }) {
  return (
    <span
      style={{
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        padding: '0 4px',
        borderRadius: 99,
        background: tone === 'dark' ? C.primary : C.accent,
        color: tone === 'dark' ? '#fff' : C.primaryDark,
        fontSize: 10,
        fontWeight: 800,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {n}
    </span>
  );
}
