import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import logoImg from '../assets/logo.png';



const DRAWER: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/mobiles', label: 'Mobiles', icon: 'phone' },
  { to: '/accessories', label: 'Accessories & Audio', icon: 'headphones' },
  { to: '/services', label: 'Care & Repair', icon: 'tool' },
  { to: '/account', label: 'My Orders', icon: 'box' },
  { to: '/about', label: 'About Us', icon: 'award' },
  { to: '/contact', label: 'Contact & Stores', icon: 'pin' },
];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { cartCount, wishlist, products, logo } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const [progress, setProgress] = useState(0);
  const [bump, setBump] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
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

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
  };

  const results = q.trim()
    ? products.filter((p) => (p.name + p.brand).toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#d7ebe6,#eef7f5)', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          height: '100vh',
          maxHeight: 932,
          alignSelf: 'center',
          background: C.bg,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 80px rgba(6,51,46,.25)',
        }}
      >
        {/* header */}
        <header style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 20, flexShrink: 0 }}>
          <div style={{ background: C.primary, color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '6px 14px', display: 'flex', justifyContent: 'space-between', letterSpacing: 0.3 }}>
            <span>Genuine • Warrantied • Trusted Service</span>
            <span style={{ color: C.accent }}>FREE EXPRESS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px' }}>
            <button className="tap" onClick={() => setDrawer(true)} style={{ width: 38, height: 38, display: 'grid', placeItems: 'center' }} aria-label="Menu">
              <Icon name="menu" size={22} />
            </button>
            <div onClick={() => nav('/')} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
              <img
                src={logo || logoImg}
                alt="Sastika Mobiles Logo"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  border: '1.5px solid #d4af37',
                  flexShrink: 0,
                }}
              />
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: -0.2, color: C.primary }}>SASTIKA</div>
                <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 2.2, color: '#b8860b' }}>MOBILES</div>
              </div>
            </div>
            <button className="tap" onClick={() => setSearching((s) => !s)} style={{ width: 38, height: 38, display: 'grid', placeItems: 'center' }} aria-label="Search">
              <Icon name={searching ? 'x' : 'search'} size={20} />
            </button>
            <button className="tap" onClick={() => nav('/account')} style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', position: 'relative' }} aria-label="Wishlist">
              <Icon name="heart" size={20} />
              {wishlist.length > 0 && <Badge n={wishlist.length} tone="accent" />}
            </button>
            <button className="tap" onClick={() => nav('/cart')} style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', position: 'relative', animation: bump ? 'pop .45s ease' : undefined }} aria-label="Cart">
              <Icon name="cart" size={20} />
              {cartCount > 0 && <Badge n={cartCount} tone="dark" />}
            </button>
          </div>
          <div style={{ maxHeight: searching ? 340 : 0, overflow: 'hidden', transition: 'max-height .4s ease', padding: searching ? '0 14px 12px' : '0 14px' }}>
            <input
              autoFocus={searching}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, accessories, brands…"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.tint2 }}
            />
            {results.map((p) => (
              <div key={p.id} onClick={() => nav(`/product/${p.id}`)} className="row-hover" style={{ padding: '10px 6px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <Icon name="right" size={14} color={C.muted} />
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', left: 0, bottom: -1, height: 3, width: `${progress}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.primarySoft})`, transition: 'width .1s linear' }} />
        </header>

        {/* routed page */}
        <div ref={scroller} onScroll={onScroll} className="hide-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 0 }}>
          <div key={pathname} style={{ animation: 'fadeUp .5s ease both' }}>
            <Outlet />
          </div>
        </div>

        {/* drawer */}
        {drawer && (
          <>
            <div onClick={() => setDrawer(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,51,46,.5)', zIndex: 40, animation: 'fadeIn .25s ease' }} />
            <aside style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '78%', background: '#fff', zIndex: 41, animation: 'slideRight .35s cubic-bezier(.2,.8,.2,1)', padding: '22px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <div onClick={() => { setDrawer(false); nav('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <img
                    src={logo || logoImg}
                    alt="Sastika Mobiles Logo"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #d4af37',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: C.primary, letterSpacing: -0.2 }}>SASTIKA</div>
                    <div style={{ color: '#b8860b', fontSize: 10, letterSpacing: 2, fontWeight: 800 }}>MOBILES</div>
                  </div>
                </div>
                <button onClick={() => setDrawer(false)} aria-label="Close"><Icon name="x" size={22} /></button>
              </div>
              {DRAWER.map((d, i) => (
                <NavLink key={d.to} to={d.to} end={d.to === '/'} style={{ animation: `fadeUp .4s ease ${80 + i * 50}ms both` }}>
                  {({ isActive }) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 12px', borderRadius: 14, fontWeight: 700, fontSize: 14.5, background: isActive ? C.tint : 'transparent', color: isActive ? C.primary : C.text }}>
                      <Icon name={d.icon} size={19} /> {d.label}
                    </div>
                  )}
                </NavLink>
              ))}
              <div style={{ marginTop: 'auto', padding: 14, borderRadius: 16, background: C.primary, color: '#fff', fontSize: 12.5 }}>
                <div style={{ fontWeight: 800, color: C.accent, marginBottom: 2 }}>Need help?</div>
                Call +91 98765 43210
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

function Badge({ n, tone, small }: { n: number; tone: 'dark' | 'accent'; small?: boolean }) {
  return (
    <span
      style={{
        position: 'absolute',
        top: small ? -2 : 2,
        right: small ? 2 : 0,
        minWidth: 16,
        height: 16,
        padding: '0 4px',
        borderRadius: 99,
        background: tone === 'dark' ? C.primary : C.accent,
        color: tone === 'dark' ? '#fff' : C.primaryDark,
        fontSize: 9.5,
        fontWeight: 800,
        display: 'grid',
        placeItems: 'center',
        animation: 'bounceIn .4s ease',
      }}
    >
      {n}
    </span>
  );
}
