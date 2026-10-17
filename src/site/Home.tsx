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
import type { FlashDealConfig } from '../types';
import heroBannerImg from '../assets/hero-banner.png';

export default function Home() {
  const nav = useNavigate();
  const { products, addToCart, flashDeal } = useStore();
  const phones = products.filter((p) => p.category === 'phone');
  const gear = products.filter((p) => p.category !== 'phone');
  const hero = products.find((p) => p.id === 'p1') ?? phones[0];

  return (
    <div style={{ paddingBottom: 30 }}>
      {/* Full Width Desktop Hero */}
      <Hero onShop={() => nav('/mobiles')} onGear={() => nav('/services')} color={hero?.color ?? C.primarySoft} />

      {/* Main Container */}
      <div className="site-page-container" style={{ maxWidth: 1360, margin: '0 auto' }}>
        {/* Certified Brands Ticker */}
        <section style={{ padding: '20px 0 10px' }}>
          <div className="brand-ticker-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 13, fontWeight: 800, color: C.muted, letterSpacing: 0.6 }}>
            <span>TOP CERTIFIED 5G BRANDS IN STOCK</span>
            <span style={{ color: C.success }}>100% ORIGINAL &amp; SEALED WITH WARRANTY</span>
          </div>
          <Marquee>
            {BRANDS.map((b) => (
              <div
                key={b}
                onClick={() => nav('/mobiles')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 99,
                  background: '#fff',
                  border: `1px solid ${C.border}`,
                  fontWeight: 800,
                  fontSize: 14,
                  color: C.primary,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {b}
              </div>
            ))}
          </Marquee>
        </section>

        {/* Flash Deals */}
        {flashDeal.isActive && flashDeal.items && flashDeal.items.length > 0 && (
          <FlashDeal deal={flashDeal} onAdd={addToCart} />
        )}

        {/* Featured 5G Phones (Responsive Multi-Column Grid) */}
        <section style={{ padding: '36px 0 0' }}>
          <Reveal>
            <SectionHead
              title="Featured 5G Smartphones"
              sub="Factory sealed with official brand warranty & Sivakasi tax bill"
              action="View All (18 Mobiles)"
              onAction={() => nav('/mobiles')}
            />
          </Reveal>
          <div className="product-cards-grid" style={{ padding: '16px 0 0' }}>
            {phones.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} dir="up" delay={i * 50}>
                <ProductCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stats Band */}
        <StatsBand />

        {/* Categories Grid */}
        <Categories />

        {/* Spotlight Showcase Banner */}
        <Spotlight onBuy={(id) => nav(`/product/${id}`)} />

        {/* Secondary Popular Mobiles / Accessories Grid */}
        <section style={{ padding: '40px 0 0' }}>
          <Reveal>
            <SectionHead
              title={gear.length > 0 ? 'Original Accessories & Audio' : 'More In-Stock Mobiles'}
              sub={gear.length > 0 ? 'Essential companions for your smartphone' : 'Poco, Vivo, OPPO & Redmi models available for instant delivery'}
              action="Explore All"
              onAction={() => nav(gear.length > 0 ? '/accessories' : '/mobiles')}
            />
          </Reveal>
          <div className="product-cards-grid" style={{ padding: '16px 0 0' }}>
            {(gear.length > 0 ? gear : phones.slice(8, 18)).map((p, i) => (
              <Reveal key={p.id} dir="up" delay={i * 50}>
                <ProductCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Sastika Care & Repair Services */}
        <CareServices onOpen={() => nav('/services')} />

        {/* Trust & Guarantee Shield */}
        <TrustShield />

        {/* Customer Testimonials */}
        <Testimonials />

        {/* Newsletter / Offers */}
        <Newsletter />
      </div>
    </div>
  );
}

/* ---------------------------------- HERO ---------------------------------- */

function Hero({ onShop, onGear }: { onShop: () => void; onGear: () => void; color: string }) {
  const orbs = [
    { s: 220, t: '-5%', l: '-4%', d: 0, c: 'rgba(246,196,69,.22)' },
    { s: 180, t: '60%', l: '78%', d: 1.4, c: 'rgba(255,255,255,.12)' },
    { s: 140, t: '15%', l: '65%', d: 0.7, c: 'rgba(246,196,69,.25)' },
    { s: 90, t: '75%', l: '25%', d: 2, c: 'rgba(255,255,255,.14)' },
  ];
  return (
    <section
      className="hero-wrapper"
      style={{
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary}, ${C.primarySoft})`,
        boxShadow: '0 12px 36px rgba(11,74,67,0.18)',
      }}
    >
      {orbs.map((o, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: o.s,
            height: o.s,
            top: o.t,
            left: o.l,
            borderRadius: '50%',
            background: o.c,
            filter: 'blur(30px)',
            animation: `orb ${8 + i * 2}s ease-in-out ${o.d}s infinite`,
          }}
        />
      ))}

      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Store Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 99,
            background: 'rgba(255,255,255,.14)',
            backdropFilter: 'blur(10px)',
            fontSize: 11.5,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent, animation: 'pulseDot 1.6s infinite' }} />
          Authorized Multi-Brand Store • Sivakasi &amp; Sithurajapuram
        </div>

        {/* Side-by-Side: Heading on Left + Compact Phones Image on Right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {/* Heading */}
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(18px, 3.6vw, 36px)',
              lineHeight: 1.2,
              fontWeight: 900,
              flex: 1,
              letterSpacing: -0.4,
            }}
          >
            Upgrade to Your Next
            <br />
            <span style={{ color: C.accent }}>
              <Typewriter words={['5G Smartphone', 'Flagship Killer', 'Portrait Master']} />
            </span>
            <br />
            With Trust &amp; GST Bill.
          </h1>

          {/* Compact Phones Image beside heading */}
          <div
            style={{
              flexShrink: 0,
              width: 'clamp(95px, 24vw, 240px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              filter: 'drop-shadow(0 14px 28px rgba(0,0,0,.45))',
              animation: 'float 6s ease-in-out infinite',
            }}
          >
            <img
              src={heroBannerImg}
              alt="Premium Smartphones"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="hero-actions-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button
            className="tap hero-btn"
            onClick={onShop}
            style={{
              padding: '11px 18px',
              borderRadius: 14,
              background: C.accent,
              color: C.primaryDark,
              fontWeight: 900,
              fontSize: 13,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Explore Mobiles (78 In Stock)
          </button>
          <button
            className="tap hero-btn"
            onClick={onGear}
            style={{
              padding: '11px 16px',
              borderRadius: 14,
              background: 'rgba(255,255,255,.14)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              border: '1.5px solid rgba(255,255,255,.3)',
              cursor: 'pointer',
            }}
          >
            Care &amp; Service Desk
          </button>
        </div>

        {/* Feature Badges Row */}
        <div
          className="hero-badges-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 16,
            color: 'rgba(255,255,255,0.85)',
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          <span>✓ GSTIN Tax Invoice</span>
          <span>✓ Same-Day Sivakasi Pickup</span>
          <span>✓ Free Data Migration</span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- FLASH DEAL ------------------------------- */

function FlashDeal({ deal, onAdd }: { deal: FlashDealConfig; onAdd: (id: string) => void }) {
  const { d, h, hh, m, s, days, isExpired } = useCountdown(deal.endTime || 5);
  const nav = useNavigate();
  return (
    <section
      className="flash-deal-box"
      style={{
        margin: '30px 0 0',
        padding: '24px 28px',
        borderRadius: 26,
        background: `linear-gradient(160deg, ${C.tint}, #fff)`,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 8px 30px rgba(11,74,67,0.06)',
      }}
    >
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: C.danger, display: 'grid', placeItems: 'center', animation: 'wiggle 1.6s ease-in-out infinite' }}>
              <Icon name="zap" size={22} color="#fff" fill="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20 }}>{deal.title || 'Flash Deal Drop'}</div>
              <div style={{ fontSize: 12, color: C.danger, fontWeight: 800 }}>
                {deal.festivalName ? `${deal.festivalName.toUpperCase()} • ` : ''}
                {deal.subtitle || 'LIMITED INVOICE STOCK'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginRight: 4 }}>ENDS IN:</span>
            {days > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ background: C.primary, color: '#fff', fontWeight: 800, fontSize: 13, padding: '6px 8px', borderRadius: 8, minWidth: 32, textAlign: 'center' }}>
                  {d}d
                </span>
                <span style={{ fontWeight: 800, color: C.primary }}>:</span>
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ background: C.primary, color: '#fff', fontWeight: 800, fontSize: 13, padding: '6px 8px', borderRadius: 8, minWidth: 32, textAlign: 'center' }}>
                {days > 0 ? hh : h}
              </span>
              <span style={{ fontWeight: 800, color: C.primary }}>:</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ background: C.primary, color: '#fff', fontWeight: 800, fontSize: 13, padding: '6px 8px', borderRadius: 8, minWidth: 32, textAlign: 'center' }}>
                {m}
              </span>
              <span style={{ fontWeight: 800, color: C.primary }}>:</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ background: isExpired ? '#dc2626' : C.danger, color: '#fff', fontWeight: 800, fontSize: 13, padding: '6px 8px', borderRadius: 8, minWidth: 32, textAlign: 'center' }}>
                {s}
              </span>
            </span>
          </div>
        </div>
      </Reveal>

      {/* Grid for flash deal items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
        {deal.items.map((p, i) => (
          <Reveal key={p.id} delay={i * 100} dir="zoom">
            <div
              className="lift"
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 16,
                border: `1px solid ${C.border}`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {p.badge && (
                <span style={{ position: 'absolute', top: 16, left: 16, background: C.danger, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 99, zIndex: 2 }}>
                  {p.badge}
                </span>
              )}
              <div
                onClick={() => nav(`/product/${p.id}`)}
                style={{ cursor: 'pointer', height: 160, borderRadius: 14, background: C.tint2, display: 'grid', placeItems: 'center', overflow: 'hidden' }}
              >
                <ProductArt category={p.category} color={p.color} size={130} image={p.image} alt={p.name} float />
              </div>
              <div
                onClick={() => nav(`/product/${p.id}`)}
                style={{ fontSize: 14, fontWeight: 800, margin: '12px 0 4px', minHeight: 38, lineHeight: 1.3, cursor: 'pointer' }}
              >
                {p.name}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <b style={{ fontSize: 18 }}>{money(p.price)}</b>
                <span style={{ fontSize: 12, color: C.success, fontWeight: 800 }}>{discount(p.price, p.mrp)}% off</span>
                <span style={{ fontSize: 11, color: C.muted, textDecoration: 'line-through' }}>{money(p.mrp)}</span>
              </div>
              <div style={{ margin: '10px 0 6px', fontSize: 11, color: C.muted, fontWeight: 700 }}>
                {p.claimedPct || 65}% claimed • {p.stock} units left in stock
              </div>
              <FillBar pct={p.claimedPct || 65} color={`linear-gradient(90deg, ${C.accent}, ${C.danger})`} bg={C.tint} />
              <Btn
                full
                variant="primary"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onAdd(p.id);
                }}
                style={{ marginTop: 12, padding: '11px 0', fontSize: 13 }}
              >
                Claim Flash Offer
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
    { v: 12, suf: '+', label: 'Years of trust in Sivakasi' },
    { v: 78, suf: ' Nos', label: 'Verified inventory in stock' },
    { v: 4.9, suf: ' / 5', label: 'Customer satisfaction rating', dec: 1 },
    { v: 100, suf: '%', label: 'Official brand tax invoices' },
  ];
  return (
    <section
      className="stats-band-box"
      style={{
        margin: '40px 0 0',
        padding: '34px 28px',
        borderRadius: 28,
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
        color: '#fff',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        boxShadow: '0 12px 36px rgba(11,74,67,0.18)',
      }}
    >
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 100} dir="zoom">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.accent, letterSpacing: -1 }}>
              <CountUp to={s.v} suffix={s.suf} decimals={s.dec ?? 0} />
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
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
    { icon: 'phone', title: '5G Smartphones', sub: 'Redmi, OPPO, Vivo, Nothing', to: '/mobiles' },
    { icon: 'tag', title: 'Budget Under ₹12K', sub: 'Poco & Redmi 5G', to: '/mobiles' },
    { icon: 'cpu', title: 'High Performance', sub: 'Snapdragon & Dimensity', to: '/mobiles' },
    { icon: 'zap', title: 'Fast Chargers', sub: '45W, 80W, 100W GaN', to: '/accessories' },
    { icon: 'headphones', title: 'ANC Audio', sub: 'TWS Earbuds & Neckbands', to: '/accessories' },
    { icon: 'tool', title: 'Care & Repair', sub: 'Display & Battery service', to: '/services' },
  ];
  return (
    <section style={{ padding: '40px 0 0' }}>
      <Reveal>
        <SectionHead title="Explore by Category" sub="Find your preferred phone range and expert services" />
      </Reveal>
      <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        {cats.map((c, i) => (
          <Reveal key={c.title} delay={i * 50} dir="up">
            <div
              className="lift"
              onClick={() => nav(c.to)}
              style={{
                background: '#fff',
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                padding: '20px 18px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: C.tint,
                  color: C.primary,
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Icon name={c.icon} size={24} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.primary }}>{c.title}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{c.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- SPOTLIGHT -------------------------------- */

function Spotlight({ onBuy }: { onBuy: (id: string) => void }) {
  const { getProduct, products } = useStore();
  const p = getProduct('p3') || products[0];
  if (!p) return null;
  const highlightSpecs = p.specs?.slice(0, 4) || ['5G Enabled', '50MP Dual Camera', '45W Fast Charging', '120Hz Display'];
  return (
    <section style={{ padding: '40px 0 0' }}>
      <Reveal>
        <div
          className="spotlight-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 30,
            background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`,
            color: '#fff',
            padding: '36px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: 30,
            boxShadow: '0 16px 40px rgba(6,51,46,0.22)',
          }}
        >
          <span style={{ position: 'absolute', width: 280, height: 280, right: -60, top: -60, borderRadius: '50%', background: 'rgba(246,196,69,.15)', animation: 'orb 9s ease-in-out infinite' }} />

          <div>
            <Pill tone="accent">★ TOP RECOMMENDATION IN STORE</Pill>
            <h3 style={{ margin: '14px 0 10px', fontSize: 32, fontWeight: 900, letterSpacing: -0.8 }}>
              {p.name}
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
              {p.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {highlightSpecs.map((t) => (
                <span key={t} style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,.16)' }}>
                  ✓ {t}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 22 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.accent }}>{money(p.price)}</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through' }}>{money(p.mrp)}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>Only {p.stock} units in stock</div>
            </div>
            <Btn variant="accent" onClick={() => onBuy(p.id)} style={{ padding: '14px 32px', fontSize: 15, fontWeight: 800 }}>
              Buy Now • Instant Sivakasi Delivery <Icon name="right" size={16} />
            </Btn>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ animation: 'tilt3d 7s ease-in-out infinite', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,.45))' }}>
              <ProductArt category="phone" color={p.color} size={250} image={p.image} alt={p.name} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------- CARE SERVICES ------------------------------ */

function CareServices({ onOpen }: { onOpen: () => void }) {
  const items: { icon: IconName; title: string; sub: string }[] = [
    { icon: 'phone', title: 'Same-day Screen Repair', sub: 'Original OEM display with 1-year Sastika warranty card' },
    { icon: 'refresh', title: 'Safe Data Transfer', sub: 'WhatsApp chats, photos and contacts safely migrated' },
    { icon: 'shield', title: 'Brand Warranty Guidance', sub: 'Full assistance at authorized brand service centers' },
    { icon: 'truck', title: 'Doorstep Service Pickup', sub: 'Express collection across Sivakasi and Sithurajapuram' },
  ];
  return (
    <section style={{ padding: '40px 0 0' }}>
      <Reveal>
        <SectionHead title="Sastika Care & Repair Desk" sub="Certified technician support beyond mobile sales" action="Book Service" onAction={onOpen} />
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 80} dir="up">
            <div
              className="lift"
              style={{
                background: '#fff',
                borderRadius: 22,
                border: `1px solid ${C.border}`,
                padding: '24px 20px',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: C.tint,
                  color: C.primary,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={it.icon} size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>{it.title}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{it.sub}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- TRUST SHIELD ------------------------------- */

function TrustShield() {
  const points = [
    { icon: 'shield', t: '100% Brand Sealed', s: 'Every smartphone is genuine with unopened manufacturer seal and barcode.' },
    { icon: 'award', t: 'Tax Invoice with GST', s: 'Official bill with GSTIN: 33BQTPJ5275L1Z6 for company warranty claim.' },
    { icon: 'lock', t: 'Safe & Secure Pay', s: 'UPI, Credit Cards, Net Banking & Cash on Delivery supported.' },
    { icon: 'check', t: 'Local Shop Support', s: 'Walk into our Sithurajapuram or Sivakasi branches for any support.' },
  ];
  return (
    <section
      className="trust-shield-card"
      style={{
        margin: '40px 0 0',
        padding: '36px 32px',
        borderRadius: 28,
        background: '#fff',
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 30px' }}>
        <Pill tone="accent">PEACE OF MIND</Pill>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: '8px 0 6px', color: C.primary }}>
          Why Sivakasi Chooses Sastika Mobiles
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: C.muted }}>
          Our commitment to authentic technology, honest pricing, and friendly after-sales care.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {points.map((p, i) => (
          <Reveal key={p.t} delay={i * 80} dir="zoom">
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.tint, color: C.primary, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={p.icon as IconName} size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.primary }}>{p.t}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 1.55 }}>{p.s}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- TESTIMONIALS ------------------------------- */

function Testimonials() {
  return (
    <section style={{ padding: '40px 0 0' }}>
      <Reveal>
        <SectionHead title="Verified Customer Feedback" sub="Real experiences from buyers across Sivakasi and Sithurajapuram" />
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 80} dir="up">
            <div
              className="lift"
              style={{
                background: '#fff',
                borderRadius: 22,
                border: `1px solid ${C.border}`,
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Stars value={5} size={13} />
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: C.text, margin: '12px 0 16px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
              </div>
              <div style={{ borderTop: `1px solid ${C.tint2}`, paddingTop: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.primary }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{t.meta}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- NEWSLETTER -------------------------------- */

function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setDone(true);
      setEmail('');
    }
  };
  return (
    <section style={{ padding: '40px 0 10px' }}>
      <Reveal>
        <div
          className="newsletter-card"
          style={{
            borderRadius: 28,
            padding: '36px 32px',
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <Pill tone="accent">VIP SPECIAL OFFERS</Pill>
            <h3 style={{ fontSize: 24, fontWeight: 900, margin: '10px 0 6px' }}>
              Get Special Festival Mobile Deals via WhatsApp
            </h3>
            <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.8)' }}>
              Subscribe to get exclusive price drops on Redmi, OPPO, Vivo, Poco and festive accessories.
            </p>
          </div>
          <form onSubmit={submit} style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 420 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your phone or email…"
              style={{
                flex: 1,
                padding: '13px 16px',
                borderRadius: 14,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                background: '#fff',
                color: C.text,
              }}
            />
            <Btn type="submit" variant="accent" style={{ padding: '13px 24px', fontWeight: 800 }}>
              {done ? 'Subscribed!' : 'Get Alerts'}
            </Btn>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
