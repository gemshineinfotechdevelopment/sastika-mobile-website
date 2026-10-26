import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { Reveal } from '../components/anim';
import { Btn, Pill, SectionHead, Stars, input } from './ui';
import ProductCard from './ProductCard';

const COLORS = ['#2f7d6d', '#1c1f24', '#e8e9ec'];

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { getProduct, products, addToCart, wishlist, toggleWish, user } = useStore();
  const p = getProduct(id ?? '');
  const [color, setColor] = useState<string | null>(null);
  const [storage, setStorage] = useState(0);
  const [tab, setTab] = useState<'specs' | 'overview' | 'reviews'>('specs');
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveImgIdx(0);
  }, [p?.id]);

  if (!p) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Btn onClick={() => nav('/mobiles')}>Back to Mobiles</Btn>
      </div>
    );
  }

  const art = color ?? p.color;
  const off = discount(p.price, p.mrp);
  const emi = p.emi && p.emi > 0 ? p.emi : Math.round(p.price / 12);
  const similar = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const wished = wishlist.includes(p.id);
  const colors = (p.colors && p.colors.length > 0) ? p.colors : [p.color, ...COLORS.filter((c) => c !== p.color)].slice(0, 3);

  const rating = p.rating ?? 4.8;
  const reviews = p.reviews ?? 148;
  const reorderAt = p.reorderAt ?? 2;
  const specs = p.specs && p.specs.length > 0 ? p.specs : [
    'Official Festival Special Deal with authentic manufacturer warranty',
    '100% Original sealed pack with all inbox accessories',
    'Instant billing & warranty registered at Sastika Mobiles',
    'Free same-day doorstep express delivery in Sivakasi',
  ];

  const LOCAL_PINCODES = ['626123', '626124', '626189', '626130'];

  const galleryImages = (
    p.images && p.images.length > 0 ? p.images : [p.image]
  ).filter((img): img is string => Boolean(img && img.trim()));
  const imageList = galleryImages.length > 0 ? galleryImages : [p.image || ''];
  const safeIdx = Math.min(activeImgIdx, Math.max(0, imageList.length - 1));
  const currentImg = imageList[safeIdx] || p.image;

  const nextImg = () => {
    setActiveImgIdx((prev) => (prev + 1) % imageList.length);
  };
  const prevImg = () => {
    setActiveImgIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX > 40) {
      prevImg();
    } else if (deltaX < -40) {
      nextImg();
    }
    setTouchStartX(null);
  };

  const checkPin = () => {
    const clean = pin.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPinResult('Enter a valid 6-digit pincode');
      return;
    }
    if (LOCAL_PINCODES.includes(clean)) {
      setPinResult('Delivery by tomorrow, 2:00 PM · Free express shipping in Sivakasi & Sithurajapuram');
    } else {
      setPinResult('Delivery within 7 working days from order date · Standard delivery');
    }
  };

  const add = () => {
    const ok = addToCart(p.id);
    if (ok) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <div className="site-page-container" style={{ maxWidth: 1240, margin: '0 auto' }}>
      {/* Top back button & breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          className="tap"
          onClick={() => nav(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 12,
            background: '#fff',
            border: `1px solid ${C.border}`,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Icon name="left" size={16} /> Back
        </button>

        <button
          className="tap"
          onClick={() => toggleWish(p.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 12,
            background: '#fff',
            border: `1px solid ${C.border}`,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Icon name="heart" size={17} color={wished ? C.danger : C.muted} fill={wished ? C.danger : 'none'} />
          <span>{wished ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
        </button>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="product-detail-grid">
        {/* Left Column: Image Showcase with Multi-Image Slider */}
        <div>
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              height: 440,
              borderRadius: 24,
              background: `radial-gradient(circle at 50% 40%, #ffffff, ${C.tint})`,
              display: 'grid',
              placeItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: `1.5px solid ${C.border}`,
              boxShadow: '0 8px 30px rgba(11,74,67,0.08)',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                width: 320,
                height: 320,
                borderRadius: '50%',
                background: art,
                opacity: 0.16,
                filter: 'blur(40px)',
                animation: 'orb 9s ease-in-out infinite',
              }}
            />
            <div
              key={`${art}-${currentImg}-${safeIdx}`}
              style={{ animation: 'bounceIn .5s ease both', filter: 'drop-shadow(0 20px 24px rgba(0,0,0,.22))' }}
            >
              <ProductArt
                category={p.category}
                color={art}
                size={p.category === 'phone' ? 290 : 230}
                image={currentImg}
                alt={p.name}
                float={p.category === 'phone'}
              />
            </div>

            {/* Badges */}
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6, zIndex: 4 }}>
              {off > 0 && <Pill tone="accent">{off}% OFF</Pill>}
              <Pill tone="dark">100% BRAND ORIGINAL</Pill>
            </div>

            {/* Multi-Image Next / Prev Controls */}
            {imageList.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={prevImg}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 42,
                    height: 42,
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.94)',
                    border: `1.5px solid ${C.border}`,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 6,
                    fontSize: 22,
                    fontWeight: 900,
                    color: C.primary,
                    transition: 'all .2s ease',
                  }}
                  aria-label="Previous product image"
                >
                  ‹
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={nextImg}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 42,
                    height: 42,
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.94)',
                    border: `1.5px solid ${C.border}`,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 6,
                    fontSize: 22,
                    fontWeight: 900,
                    color: C.primary,
                    transition: 'all .2s ease',
                  }}
                  aria-label="Next product image"
                >
                  ›
                </button>

                {/* Counter indicator */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    right: 14,
                    background: 'rgba(15,23,42,0.8)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    backdropFilter: 'blur(4px)',
                    zIndex: 4,
                  }}
                >
                  {safeIdx + 1} / {imageList.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Strip (2 or 3 images thalli thalli paakura mari) */}
          {imageList.length > 1 && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
              {imageList.map((imgUrl, idx) => {
                const isActive = safeIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: 14,
                      background: '#fff',
                      border: `2px solid ${isActive ? C.primary : C.border}`,
                      padding: 4,
                      cursor: 'pointer',
                      boxShadow: isActive ? `0 0 0 2px ${C.primarySoft}` : '0 2px 6px rgba(0,0,0,0.04)',
                      transform: isActive ? 'scale(1.06)' : 'scale(1)',
                      transition: 'all .2s ease',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* 3 Trust Pillars under photo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
            {[
              { i: 'shield' as const, t: '1-Year Warranty' },
              { i: 'refresh' as const, t: '7-Day Return' },
              { i: 'award' as const, t: '100% Genuine' },
            ].map((b) => (
              <div key={b.t} style={{ textAlign: 'center', padding: '12px 6px', borderRadius: 14, background: '#fff', border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 800, color: C.primary }}>
                <Icon name={b.i} size={18} style={{ margin: '0 auto 4px', display: 'block' }} />
                {b.t}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details, Specs & Buying Actions */}
        <div>
          <Reveal>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.primarySoft, letterSpacing: 1.5 }}>
              {p.brand.toUpperCase()} {p.category === 'appliance' ? 'HOME APPLIANCE' : p.category === 'phone' ? '5G SMARTPHONE' : 'ACCESSORY & AUDIO'}
            </div>
            <h1 style={{ margin: '6px 0 10px', fontSize: 28, lineHeight: 1.2, fontWeight: 900, letterSpacing: -0.6 }}>
              {p.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.muted }}>
              <Stars value={rating} size={15} /> <b style={{ color: C.text }}>{rating}</b> · {reviews.toLocaleString('en-IN')} Sivakasi buyers
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 14 }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: -1 }}>{money(p.price)}</span>
              <span style={{ fontSize: 16, color: C.muted, textDecoration: 'line-through' }}>{money(p.mrp)}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.success }}>{off}% off</span>
            </div>

            <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>
              or <b style={{ color: C.text }}>{money(emi)}/month</b> with no-cost EMI
            </div>

            <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: p.stock > reorderAt ? C.success : p.stock > 0 ? C.danger : C.danger, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9, background: 'currentColor', animation: 'pulseDot 1.6s infinite' }} />
              {p.stock === 0 ? 'Out of stock' : p.stock > reorderAt ? `${p.stock} units in stock · ready for instant dispatch` : `Hurry, only ${p.stock} left in stock!`}
            </div>
          </Reveal>

          {/* Color Chooser */}
          {p.category === 'phone' && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Select Finish Colour</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {colors.map((c) => (
                  <button
                    key={c}
                    aria-label="Colour"
                    onClick={() => setColor(c)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 99,
                      background: c,
                      border: `3px solid ${art === c ? C.primary : '#fff'}`,
                      boxShadow: `0 0 0 1.5px ${C.border}`,
                      transition: 'transform .2s ease',
                      transform: art === c ? 'scale(1.15)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>

              {p.storage && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 800, margin: '16px 0 8px' }}>Storage Variant</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {p.storage.map((s, i) => (
                      <button
                        key={s}
                        className="tap"
                        onClick={() => setStorage(i)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: 13,
                          background: storage === i ? C.primary : '#fff',
                          color: storage === i ? '#fff' : C.text,
                          border: `1.5px solid ${storage === i ? C.primary : C.border}`,
                          cursor: 'pointer',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Pincode Delivery check */}
          <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 16, background: '#fff', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Icon name="truck" size={16} color={C.primary} /> Check Delivery to Your Pincode
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={pin}
                maxLength={6}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (pinResult) setPinResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') checkPin();
                }}
                placeholder="Enter 6-digit Pincode"
                inputMode="numeric"
                style={{ ...input, padding: '10px 12px', fontSize: 13 }}
              />
              <Btn onClick={checkPin} variant="light" style={{ padding: '0 20px', fontSize: 13 }}>Check</Btn>
            </div>
            {pinResult && (
              <div
                key={pinResult}
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: /^Delivery/.test(pinResult) ? C.success : C.danger,
                }}
              >
                <Icon name={/^Delivery/.test(pinResult) ? 'check' : 'alert'} size={14} />
                {pinResult}
              </div>
            )}
          </div>

          {/* Action Buttons: Add to Cart and Buy Now */}
          <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
            <Btn
              variant="light"
              full
              disabled={p.stock === 0}
              onClick={add}
              style={{
                flex: 1,
                padding: '14px 0',
                fontSize: 14,
                fontWeight: 800,
                background: added ? C.successSoft : C.tint,
                color: added ? C.success : C.primary,
              }}
            >
              <Icon name={added ? 'check' : 'cart'} size={18} /> {added ? 'Added to Cart!' : 'Add to Cart'}
            </Btn>
            <Btn
              full
              disabled={p.stock === 0}
              onClick={() => {
                const ok = addToCart(p.id);
                if (ok) {
                  nav('/cart');
                }
              }}
              style={{ flex: 1, padding: '14px 0', fontSize: 14, fontWeight: 800 }}
            >
              Buy Now Express
            </Btn>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Overview, Reviews */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: `1.5px solid ${C.border}`, paddingBottom: 8 }}>
          {(['specs', 'overview', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13.5,
                textTransform: 'capitalize',
                background: tab === t ? C.primary : 'transparent',
                color: tab === t ? '#fff' : C.muted,
                transition: 'all .2s ease',
                cursor: 'pointer',
              }}
            >
              {t === 'specs' ? 'Technical Specs' : t === 'overview' ? 'Device Overview' : 'Customer Reviews'}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, padding: '24px 28px' }}>
          {tab === 'specs' &&
            specs.map((s, i) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '11px 0',
                  borderBottom: i < specs.length - 1 ? `1px solid ${C.tint2}` : 'none',
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                <Icon name="check" size={17} color={C.success} stroke={3} /> {s}
              </div>
            ))}
          {tab === 'overview' && (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: C.text }}>
              {p.description || `${p.name} with official manufacturer warranty and original sealed box from Sastika Mobiles.`}
            </p>
          )}
          {tab === 'reviews' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: C.primary }}>{rating}</div>
                <Stars value={rating} size={15} />
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{reviews.toLocaleString('en-IN')} reviews</div>
              </div>
              <div style={{ flex: 1, maxWidth: 400 }}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 4 }}>
                    <span>{n}★</span>
                    <div style={{ flex: 1, height: 7, background: C.tint, borderRadius: 9, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${[72, 18, 6, 2, 2][5 - n]}%`,
                          background: C.accent,
                          borderRadius: 9,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Mobiles */}
      {similar.length > 0 && (
        <section style={{ paddingTop: 40 }}>
          <SectionHead title="Similar 5G Smartphones in Stock" sub="Explore alternative models from top brands" />
          <div className="product-cards-grid" style={{ paddingTop: 16 }}>
            {similar.map((s, i) => (
              <Reveal key={s.id} dir="up" delay={i * 50} style={{ height: '100%', display: 'flex' }}>
                <ProductCard p={s} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
