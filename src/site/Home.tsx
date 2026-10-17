import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRANDS, SERVICES, TESTIMONIALS } from '../data';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { CountUp, FillBar, Marquee, Reveal, Typewriter, useCountdown } from '../components/anim';
import { Btn, Pill, SectionHead, Stars } from './ui';
import ProductCard from './ProductCard';
import heroBannerImg from '../assets/hero-banner.png';
import logoImg from '../assets/logo.png';

export default function Home() {
  const nav = useNavigate();
  const { products, addToCart } = useStore();
  const phones = products.filter((p) => p.category === 'phone');
  const gear = products.filter((p) => p.category !== 'phone');
  const hero = products.find((p) => p.id === 'p1') ?? phones[0];

  return (
    <div style={{ paddingBottom: 8 }}>
      <Hero onShop={() => nav('/mobiles')} onGear={() => nav('/accessories')} color={hero?.color ?? C.primarySoft} />

      {/* brand ticker */}
      <section style={{ padding: '22px 0 6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 18px 10px', fontSize: 12, fontWeight: 800, color: C.muted, letterSpacing: 0.4 }}>
          <span>TOP CERTIFIED BRANDS</span>
          <span style={{ color: C.success }}>100% GENUINE</span>
        </div>
        <Marquee>
          {BRANDS.map((b) => (
            <div key={b} style={{ padding: '10px 22px', borderRadius: 99, background: '#fff', border: `1px solid ${C.border}`, fontWeight: 800, fontSize: 13.5, color: C.primary }}>
              {b}
            </div>
          ))}
        </Marquee>
      </section>

      <FlashDeal items={phones.slice(3, 5)} onAdd={addToCart} />

      <section style={{ padding: '26px 0 0' }}>
        <Reveal>
          <SectionHead title="Featured Phones" sub="Factory sealed with Sastika warranty" action="View all" onAction={() => nav('/mobiles')} />
        </Reveal>
        <div className="hide-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 18px 14px' }}>
          {phones.slice(0, 6).map((p, i) => (
            <Reveal key={p.id} dir="right" delay={i * 90} style={{ flexShrink: 0 }}>
              <ProductCard p={p} width={168} />
            </Reveal>
          ))}
        </div>
      </section>

      <StatsBand />

      <Categories />

      <Spotlight onBuy={(id) => nav(`/product/${id}`)} />

      <section style={{ padding: '28px 0 0' }}>
        <Reveal>
          <SectionHead title="Original Accessories" sub="Essential companions for your smartphone" action="All" onAction={() => nav('/accessories')} />
        </Reveal>
        <div className="hide-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 18px 14px' }}>
          {gear.slice(0, 6).map((p, i) => (
            <Reveal key={p.id} dir="zoom" delay={i * 80} style={{ flexShrink: 0 }}>
              <ProductCard p={p} width={160} compact />
            </Reveal>
          ))}
        </div>
      </section>

      <CareServices onOpen={() => nav('/services')} />

      <TrustShield />

      <Testimonials />

      <Newsletter />

      <Footer />
    </div>
  );
}

/* ---------------------------------- HERO ---------------------------------- */

function Hero({ onShop, onGear, color }: { onShop: () => void; onGear: () => void; color: string }) {
  const orbs = [
    { s: 120, t: '8%', l: '-6%', d: 0, c: 'rgba(246,196,69,.22)' },
    { s: 80, t: '60%', l: '78%', d: 1.4, c: 'rgba(255,255,255,.12)' },
    { s: 54, t: '20%', l: '70%', d: 0.7, c: 'rgba(246,196,69,.3)' },
    { s: 36, t: '75%', l: '12%', d: 2, c: 'rgba(255,255,255,.14)' },
  ];
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        padding: '28px 20px 30px',
        background: `linear-gradient(120deg, ${C.primaryDark}, ${C.primary}, ${C.primarySoft}, ${C.primaryDark})`,
        backgroundSize: '300% 300%',
        animation: 'gradientShift 12s ease infinite',
        borderRadius: '0 0 32px 32px',
      }}
    >
      {orbs.map((o, i) => (
        <span key={i} style={{ position: 'absolute', width: o.s, height: o.s, top: o.t, left: o.l, borderRadius: '50%', background: o.c, filter: 'blur(2px)', animation: `orb ${8 + i * 2}s ease-in-out ${o.d}s infinite` }} />
      ))}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: 'rgba(255,255,255,.12)', fontSize: 11.5, fontWeight: 700, animation: 'fadeUp .6s ease both' }}>
          <span style={{ width: 7, height: 7, borderRadius: 9, background: C.accent, animation: 'pulseDot 1.6s infinite' }} />
          Certified Store • Sivakasi & Sithurajapuram
        </div>

        <h1 style={{ margin: '14px 0 10px', fontSize: 38, lineHeight: 1.05, fontWeight: 800, letterSpacing: -1.2, animation: 'fadeUp .7s ease .1s both' }}>
          Your Next
          <br />
          <span style={{ color: C.accent }}>
            <Typewriter words={['Smartphone', 'Flagship', 'Upgrade']} />
          </span>
          <br />
          Starts Here.
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'rgba(255,255,255,.82)', maxWidth: 230, animation: 'fadeUp .7s ease .25s both' }}>
          Genuine devices with warranty and certified after-sales care.
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, animation: 'fadeUp .7s ease .4s both' }}>
          <button
            className="tap"
            onClick={onShop}
            style={{ padding: '13px 20px', borderRadius: 14, background: C.accent, color: C.primaryDark, fontWeight: 800, fontSize: 14, animation: 'pulseRing 2.4s infinite', position: 'relative', overflow: 'hidden' }}
          >
            Shop Mobiles
            <span style={{ position: 'absolute', top: 0, bottom: 0, width: 40, background: 'rgba(255,255,255,.55)', animation: 'sheen 3.2s ease-in-out infinite' }} />
          </button>
          <button className="tap" onClick={onGear} style={{ padding: '13px 18px', borderRadius: 14, background: 'rgba(255,255,255,.14)', color: '#fff', fontWeight: 700, fontSize: 14, border: '1px solid rgba(255,255,255,.3)' }}>
            Explore Gear
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: -12,
          top: 36,
          zIndex: 1,
          width: 195,
          maxWidth: '52%',
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.45))',
          pointerEvents: 'none',
        }}
      >
        <img
          src={heroBannerImg}
          alt="Premium Smartphones"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 2, marginTop: 34, padding: '11px 14px', borderRadius: 14, background: 'rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, animation: 'fadeUp .7s ease .6s both' }}>
        <Icon name="gift" size={18} color={C.accent} />
        <span>
          <b style={{ color: C.accent }}>FESTIVE DROP</b> · up to 46% off + ₹2,000 instant bank offer
        </span>
      </div>
    </section>
  );
}

/* -------------------------------- FLASH DEAL ------------------------------- */

function FlashDeal({ items, onAdd }: { items: ReturnType<typeof useStore>['products']; onAdd: (id: string) => void }) {
  const { h, m, s } = useCountdown(5);
  const nav = useNavigate();
  const claimed = [72, 58];
  return (
    <section style={{ margin: '20px 14px 0', padding: 16, borderRadius: 26, background: `linear-gradient(160deg, ${C.tint}, #fff)`, border: `1px solid ${C.border}` }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: C.danger, display: 'grid', placeItems: 'center', animation: 'wiggle 1.6s ease-in-out infinite' }}>
              <Icon name="zap" size={18} color="#fff" fill="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Flash Deal Drop</div>
              <div style={{ fontSize: 11, color: C.danger, fontWeight: 700 }}>LIMITED STOCK LEFT</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[h, m, s].map((v, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ background: C.primary, color: '#fff', fontWeight: 800, fontSize: 13, padding: '6px 7px', borderRadius: 8, minWidth: 30, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                {i < 2 && <span style={{ fontWeight: 800, color: C.primary }}>:</span>}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 120} dir="zoom">
            <div style={{ background: '#fff', borderRadius: 18, padding: 10, border: `1px solid ${C.border}` }}>
              <div onClick={() => nav(`/product/${p.id}`)} style={{ cursor: 'pointer', height: 96, borderRadius: 12, background: C.tint2, display: 'grid', placeItems: 'center' }}>
                <ProductArt category={p.category} color={p.color} size={84} float />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, margin: '8px 0 2px', minHeight: 32, lineHeight: 1.25 }}>{p.name}</div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}>
                <b style={{ fontSize: 15 }}>{money(p.price)}</b>
                <span style={{ fontSize: 10.5, color: C.success, fontWeight: 800 }}>{discount(p.price, p.mrp)}% off</span>
              </div>
              <div style={{ margin: '8px 0 4px', fontSize: 10.5, color: C.muted, fontWeight: 700 }}>{claimed[i % 2]}% claimed</div>
              <FillBar pct={claimed[i % 2]} color={`linear-gradient(90deg, ${C.accent}, ${C.danger})`} bg={C.tint} />
              <Btn full variant="primary" onClick={() => onAdd(p.id)} style={{ marginTop: 9, padding: '9px 0', fontSize: 12 }}>
                Claim Now
              </Btn>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- STATS ---------------------------------- */

function StatsBand() {
  const stats: { v: number; suf: string; label: string; dec?: number }[] = [
    { v: 12, suf: '+', label: 'Years of trust' },
    { v: 250, suf: 'K+', label: 'Happy customers' },
    { v: 4.9, suf: '', label: 'Google rating', dec: 1 },
    { v: 98.6, suf: '%', label: 'Same-day repairs', dec: 1 },
  ];
  return (
    <section style={{ margin: '26px 14px 0', padding: '22px 14px', borderRadius: 26, background: C.primary, color: '#fff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 110} dir="zoom">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.accent, letterSpacing: -1 }}>
              <CountUp to={s.v} suffix={s.suf} decimals={s.dec ?? 0} />
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>{s.label}</div>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

/* ------------------------------- CATEGORIES -------------------------------- */

function Categories() {
  const nav = useNavigate();
  const cats: { icon: IconName; title: string; sub: string; to: string }[] = [
    { icon: 'phone', title: 'Flagship 5G', sub: 'Premium range', to: '/mobiles' },
    { icon: 'tag', title: 'Budget Friendly', sub: 'Under ₹25,000', to: '/mobiles' },
    { icon: 'zap', title: 'Fast Chargers', sub: 'GaN & wireless', to: '/accessories' },
    { icon: 'headphones', title: 'Wireless Audio', sub: 'ANC earbuds', to: '/accessories' },
    { icon: 'shield', title: 'Cases & Glass', sub: 'Drop protection', to: '/accessories' },
    { icon: 'cpu', title: 'Gaming Phones', sub: '144Hz displays', to: '/mobiles' },
  ];
  return (
    <section style={{ padding: '28px 0 0' }}>
      <Reveal>
        <SectionHead title="Explore Categories" sub="Carefully curated device collections" />
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 18px' }}>
        {cats.map((c, i) => (
          <Reveal key={c.title} delay={(i % 2) * 90 + Math.floor(i / 2) * 70} dir={i % 2 ? 'right' : 'left'}>
            <button
              className="lift tap"
              onClick={() => nav(c.to)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: 12, background: '#fff', borderRadius: 16, border: `1px solid ${C.border}` }}
            >
              <span style={{ width: 40, height: 40, borderRadius: 12, background: C.primary, display: 'grid', placeItems: 'center' }}>
                <Icon name={c.icon} size={19} color={C.accent} />
              </span>
              <span>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{c.sub}</div>
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- SPOTLIGHT -------------------------------- */

function Spotlight({ onBuy }: { onBuy: (id: string) => void }) {
  const { getProduct } = useStore();
  const p = getProduct('p4');
  if (!p) return null;
  return (
    <section style={{ padding: '28px 18px 0' }}>
      <Reveal>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 26, background: `linear-gradient(150deg, ${C.primaryDark}, ${C.primarySoft})`, color: '#fff', padding: 20 }}>
          <span style={{ position: 'absolute', width: 180, height: 180, right: -50, top: -50, borderRadius: '50%', background: 'rgba(246,196,69,.18)', animation: 'orb 9s ease-in-out infinite' }} />
          <Pill tone="accent">TRENDING #1</Pill>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            <div style={{ flex: 1, paddingRight: 8 }}>
              <h3 style={{ margin: '4px 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{p.name}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['120Hz AMOLED', '5500mAh', '100W'].map((t, i) => (
                  <span key={t} style={{ fontSize: 10.5, fontWeight: 700, padding: '4px 9px', borderRadius: 99, background: 'rgba(255,255,255,.14)', animation: `bounceIn .5s ease ${0.3 + i * 0.12}s both` }}>{t}</span>
                ))}
              </div>
              <div style={{ margin: '14px 0 4px', fontSize: 11, opacity: 0.75 }}>Special price</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{money(p.price)}</div>
            </div>
            <div style={{ animation: 'tilt3d 7s ease-in-out infinite', filter: 'drop-shadow(0 20px 24px rgba(0,0,0,.4))' }}>
              <ProductArt category="phone" color={p.color} size={170} />
            </div>
          </div>
          <Btn variant="accent" full onClick={() => onBuy(p.id)} style={{ marginTop: 14 }}>
            Buy Now <Icon name="right" size={16} />
          </Btn>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------- CARE SERVICES ------------------------------ */

function CareServices({ onOpen }: { onOpen: () => void }) {
  const items: { icon: IconName; title: string; sub: string }[] = [
    { icon: 'phone', title: 'Same-day Screen Repair', sub: 'Original OEM display, 1-year warranty' },
    { icon: 'refresh', title: 'Instant Trade-In', sub: 'Automated valuation for your old device' },
    { icon: 'shield', title: 'Brand Warranty Assured', sub: 'Official manufacturer invoices on all devices' },
    { icon: 'truck', title: 'Doorstep Pickup / Drop', sub: 'Express 2-hour collection across metro areas' },
  ];
  return (
    <section style={{ padding: '28px 0 0' }}>
      <Reveal>
        <SectionHead title="Sastika Care Services" sub="Beyond sales, comprehensive lifecycle support" action="Book" onAction={onOpen} />
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 18px' }}>
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 100}>
            <div className="lift" style={{ background: '#fff', borderRadius: 18, padding: 14, border: `1px solid ${C.border}`, height: '100%' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: i % 2 ? C.primary : C.accent, display: 'grid', placeItems: 'center', marginBottom: 10 }}>
                <Icon name={it.icon} size={19} color={i % 2 ? C.accent : C.primaryDark} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.25 }}>{it.title}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{it.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <div style={{ padding: '10px 18px 0', fontSize: 11, color: C.muted }}>{SERVICES.length} services available at every store</div>
    </section>
  );
}

/* ------------------------------- TRUST SHIELD ------------------------------- */

function TrustShield() {
  const rows = [
    { t: '100% Genuine Sealed Products', s: 'Sourced only from authorised distributors' },
    { t: '7-Day Hassle-Free Replacement', s: 'Defective on arrival? Replaced from our stock' },
    { t: 'Up to 24 Months No-Cost EMI', s: 'Zero processing fees on major cards' },
    { t: 'Free In-Store Data Migration', s: 'Our technicians transfer everything safely' },
  ];
  return (
    <section style={{ margin: '28px 14px 0', padding: 18, borderRadius: 26, background: C.tint, border: `1px solid ${C.border}` }}>
      <Reveal>
        <h2 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="shield" size={22} color={C.primary} /> The Sastika Trust Shield
        </h2>
      </Reveal>
      {rows.map((r, i) => (
        <Reveal key={r.t} delay={i * 130} dir="left">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', padding: 12, borderRadius: 16, marginBottom: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 99, background: C.success, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="check" size={16} color="#fff" stroke={3} />
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{r.t}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{r.s}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

/* -------------------------------- TESTIMONIALS ------------------------------- */

function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % TESTIMONIALS.length), 4200);
    return () => window.clearInterval(t);
  }, []);
  const t = TESTIMONIALS[i];
  return (
    <section style={{ padding: '28px 18px 0' }}>
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Loved by Shoppers</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800 }}>
            <Icon name="star" size={14} color={C.accentDark} fill={C.accent} /> 4.9/5
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, border: `1px solid ${C.border}`, minHeight: 168 }}>
          <div key={i} style={{ animation: 'fadeUp .5s ease both' }}>
            <Stars value={5} size={14} />
            <p style={{ margin: '10px 0 14px', fontSize: 13.5, lineHeight: 1.6 }}>“{t.text}”</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 99, background: C.primary, color: C.accent, display: 'grid', placeItems: 'center', fontWeight: 800 }}>{t.name[0]}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.meta}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          {TESTIMONIALS.map((_, n) => (
            <button key={n} onClick={() => setI(n)} aria-label={`Review ${n + 1}`} style={{ height: 6, width: n === i ? 22 : 6, borderRadius: 9, background: n === i ? C.primary : C.border, transition: 'all .35s ease' }} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------- NEWSLETTER -------------------------------- */

function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) setDone(true);
  };
  return (
    <section style={{ margin: '28px 14px 0' }}>
      <Reveal dir="zoom">
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 26, padding: 22, color: '#fff', background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})` }}>
          <span style={{ position: 'absolute', right: -30, bottom: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(246,196,69,.2)', animation: 'orb 8s ease-in-out infinite' }} />
          <Pill tone="accent">VIP CLUB</Pill>
          <h3 style={{ margin: '10px 0 6px', fontSize: 22, fontWeight: 800 }}>Get ₹500 off your first order</h3>
          {done ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, animation: 'bounceIn .5s ease' }}>
              <span style={{ width: 34, height: 34, borderRadius: 99, background: C.accent, display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={18} color={C.primaryDark} stroke={3} />
              </span>
              <div style={{ fontWeight: 700 }}>You're in. Check your inbox for the code.</div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ position: 'relative', zIndex: 1, marginTop: 14 }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: 'none', marginBottom: 10, color: C.text }}
              />
              <Btn type="submit" variant="accent" full>Subscribe Now</Btn>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ----------------------------------- FOOTER ---------------------------------- */

function Footer() {
  const nav = useNavigate();
  const link = (label: string, to: string) => (
    <button key={label} onClick={() => nav(to)} style={{ display: 'block', fontSize: 12.5, color: C.muted, padding: '5px 0', textAlign: 'left' }}>
      {label}
    </button>
  );
  return (
    <footer style={{ margin: '28px 14px 10px', padding: 20, background: '#fff', borderRadius: 24, border: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <img
          src={logoImg}
          alt="Sastika Mobiles Logo"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1.5px solid #d4af37',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          }}
        />
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, color: C.primary, letterSpacing: -0.2 }}>SASTIKA</div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: '#b8860b' }}>MOBILES</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: '6px 0 14px' }}>Tamil Nadu's trusted destination for certified smartphones, genuine accessories and expert repairs.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>QUICK LINKS</div>
          {link('Mobiles', '/mobiles')}
          {link('Accessories', '/accessories')}
          {link('Repair Services', '/services')}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>HELP</div>
          {link('About Us', '/about')}
          {link('Store Locator', '/contact')}
          {link('My Orders', '/account')}
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.muted, display: 'flex', justifyContent: 'space-between' }}>
        <span>© 2026 Sastika Mobiles</span>
        <button onClick={() => nav('/admin')} style={{ color: C.primary, fontWeight: 700 }}>Admin</button>
      </div>
    </footer>
  );
}
