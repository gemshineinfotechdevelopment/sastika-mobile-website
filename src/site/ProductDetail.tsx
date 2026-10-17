import { useState } from 'react';
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
  const { getProduct, products, addToCart, wishlist, toggleWish } = useStore();
  const p = getProduct(id ?? '');
  const [color, setColor] = useState<string | null>(null);
  const [storage, setStorage] = useState(0);
  const [tab, setTab] = useState<'specs' | 'overview' | 'reviews'>('specs');
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  if (!p) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Btn onClick={() => nav('/mobiles')}>Back to Mobiles</Btn>
      </div>
    );
  }

  const art = color ?? p.color;
  const off = discount(p.price, p.mrp);
  const emi = Math.round(p.price / 12);
  const similar = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const wished = wishlist.includes(p.id);
  const colors = [p.color, ...COLORS.filter((c) => c !== p.color)].slice(0, 3);

  const checkPin = () => {
    setPinResult(/^\d{6}$/.test(pin) ? 'Delivery by tomorrow, 2:00 PM · Free express shipping' : 'Enter a valid 6-digit pincode');
  };

  const add = () => {
    addToCart(p.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px 4px' }}>
        <button className="tap" onClick={() => nav(-1)} style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }} aria-label="Back">
          <Icon name="left" size={18} />
        </button>
        <button className="tap" onClick={() => toggleWish(p.id)} style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }} aria-label="Wishlist">
          <Icon name="heart" size={18} color={wished ? C.danger : C.muted} fill={wished ? C.danger : 'none'} />
        </button>
      </div>

      {/* gallery */}
      <div style={{ margin: '6px 18px 0', height: 280, borderRadius: 28, background: `radial-gradient(circle at 50% 40%, #fff, ${C.tint})`, display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <span style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: art, opacity: 0.18, filter: 'blur(30px)', transition: 'background .5s ease', animation: 'orb 9s ease-in-out infinite' }} />
        <div key={art} style={{ animation: 'bounceIn .6s ease both', filter: 'drop-shadow(0 22px 22px rgba(0,0,0,.25))' }}>
          <ProductArt category={p.category} color={art} size={p.category === 'phone' ? 230 : 190} image={p.image} alt={p.name} float />
        </div>
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
          {off > 0 && <Pill tone="accent">{off}% OFF</Pill>}
          <Pill tone="dark">OFFICIAL STORE</Pill>
        </div>
      </div>

      <div style={{ padding: '16px 18px 0' }}>
        <Reveal>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.primarySoft, letterSpacing: 1 }}>{p.brand.toUpperCase()}</div>
          <h1 style={{ margin: '4px 0 8px', fontSize: 23, lineHeight: 1.2, fontWeight: 800, letterSpacing: -0.5 }}>{p.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.muted }}>
            <Stars value={p.rating} size={13} /> <b style={{ color: C.text }}>{p.rating}</b> · {p.reviews.toLocaleString('en-IN')} reviews
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>{money(p.price)}</span>
            <span style={{ fontSize: 14, color: C.muted, textDecoration: 'line-through' }}>{money(p.mrp)}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.success }}>{off}% off</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: C.muted }}>
            or <b style={{ color: C.text }}>{money(emi)}/month</b> with no-cost EMI
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: p.stock > p.reorderAt ? C.success : p.stock > 0 ? C.danger : C.danger, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9, background: 'currentColor', animation: 'pulseDot 1.6s infinite' }} />
            {p.stock === 0 ? 'Out of stock' : p.stock > p.reorderAt ? 'In stock · ready to dispatch' : `Only ${p.stock} left`}
          </div>
        </Reveal>

        {p.category === 'phone' && (
          <Reveal delay={80}>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 8 }}>Colour</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {colors.map((c) => (
                  <button key={c} aria-label="Colour" onClick={() => setColor(c)} style={{ width: 34, height: 34, borderRadius: 99, background: c, border: `3px solid ${art === c ? C.primary : '#fff'}`, boxShadow: `0 0 0 1.5px ${C.border}`, transition: 'transform .2s ease', transform: art === c ? 'scale(1.15)' : 'none' }} />
                ))}
              </div>
              {p.storage && (
                <>
                  <div style={{ fontSize: 12.5, fontWeight: 800, margin: '16px 0 8px' }}>Storage</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {p.storage.map((s, i) => (
                      <button key={s} className="tap" onClick={() => setStorage(i)} style={{ padding: '10px 16px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: storage === i ? C.primary : '#fff', color: storage === i ? '#fff' : C.text, border: `1.5px solid ${storage === i ? C.primary : C.border}`, transition: 'all .25s ease' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>
        )}

        <Reveal delay={100}>
          <div style={{ marginTop: 18, padding: 14, borderRadius: 18, background: '#fff', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Icon name="truck" size={16} color={C.primary} /> Delivery availability
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" inputMode="numeric" style={{ ...input, padding: '11px 12px' }} />
              <Btn onClick={checkPin} variant="light" style={{ padding: '0 18px' }}>Check</Btn>
            </div>
            {pinResult && (
              <div key={pinResult} style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: /^Delivery/.test(pinResult) ? C.success : C.danger, animation: 'fadeUp .35s ease' }}>
                {pinResult}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
            {[
              { i: 'shield' as const, t: '1-Year Warranty' },
              { i: 'refresh' as const, t: '7-Day Replace' },
              { i: 'award' as const, t: '100% Genuine' },
            ].map((b) => (
              <div key={b.t} style={{ textAlign: 'center', padding: '12px 4px', borderRadius: 14, background: C.tint, fontSize: 10.5, fontWeight: 800, color: C.primary }}>
                <Icon name={b.i} size={20} style={{ margin: '0 auto 4px', display: 'block' }} />
                {b.t}
              </div>
            ))}
          </div>
        </Reveal>

        {/* tabs */}
        <div style={{ marginTop: 22, display: 'flex', gap: 6, background: C.tint, padding: 4, borderRadius: 14 }}>
          {(['specs', 'overview', 'reviews'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '10px 0', borderRadius: 11, fontWeight: 800, fontSize: 12.5, textTransform: 'capitalize', background: tab === t ? '#fff' : 'transparent', color: tab === t ? C.primary : C.muted, boxShadow: tab === t ? '0 2px 8px rgba(11,74,67,.1)' : 'none', transition: 'all .25s ease' }}>
              {t}
            </button>
          ))}
        </div>
        <div key={tab} style={{ marginTop: 12, background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, padding: 16, animation: 'fadeUp .35s ease' }}>
          {tab === 'specs' &&
            p.specs.map((s, i) => (
              <div key={s} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < p.specs.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 13, fontWeight: 600, animation: `fadeUp .4s ease ${i * 60}ms both` }}>
                <Icon name="check" size={16} color={C.success} stroke={3} /> {s}
              </div>
            ))}
          {tab === 'overview' && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65 }}>{p.description}</p>}
          {tab === 'reviews' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 38, fontWeight: 800 }}>{p.rating}</div>
                <Stars value={p.rating} size={13} />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{p.reviews.toLocaleString('en-IN')} reviews</div>
              </div>
              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginBottom: 3 }}>
                    {n}
                    <div style={{ flex: 1, height: 6, background: C.tint, borderRadius: 9, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${[72, 18, 6, 2, 2][5 - n]}%`, background: C.accent, borderRadius: 9, animation: 'grow .9s ease both', transformOrigin: 'left' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section style={{ paddingTop: 26 }}>
          <SectionHead title="Similar Picks" />
          <div className="hide-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 18px 12px' }}>
            {similar.map((s) => (
              <ProductCard key={s.id} p={s} width={164} compact />
            ))}
          </div>
        </section>
      )}

      {/* sticky buy bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: `1px solid ${C.border}`, padding: '10px 14px 14px', display: 'flex', gap: 10, zIndex: 15, animation: 'slideUp .5s ease both' }}>
        <Btn variant="light" full disabled={p.stock === 0} onClick={add} style={{ flex: 1, background: added ? C.successSoft : C.tint, color: added ? C.success : C.primary }}>
          <Icon name={added ? 'check' : 'cart'} size={17} /> {added ? 'Added' : 'Add to Cart'}
        </Btn>
        <Btn full disabled={p.stock === 0} onClick={() => { addToCart(p.id); nav('/cart'); }} style={{ flex: 1 }}>
          Buy Now
        </Btn>
      </div>
    </div>
  );
}
