import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { Reveal } from '../components/anim';
import { Btn, PageHead, input } from './ui';
import { COUPONS, computeTotals } from './pricing';

export default function Cart() {
  const nav = useNavigate();
  const { cart, products, getProduct, setQty, removeFromCart, coupon, setCoupon, user } = useStore();
  const [code, setCode] = useState(coupon);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const t = computeTotals(cart, products, coupon, getProduct);

  const apply = () => {
    const c = COUPONS[code.trim().toUpperCase()];
    if (c) {
      setCoupon(code.trim().toUpperCase());
      setMsg({ ok: true, text: `${code.toUpperCase()} applied · you saved ${money(c.amount)}` });
    } else {
      setMsg({ ok: false, text: 'Invalid coupon code' });
    }
  };

  const remove = (id: string) => {
    setLeaving(id);
    window.setTimeout(() => {
      removeFromCart(id);
      setLeaving(null);
    }, 300);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      nav('/login?redirect=/checkout');
    } else {
      nav('/checkout');
    }
  };

  if (t.lines.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: 110, height: 110, borderRadius: 99, background: C.tint, display: 'grid', placeItems: 'center', margin: '0 auto 18px', animation: 'floatSoft 3s ease-in-out infinite' }}>
          <Icon name="cart" size={46} color={C.primary} />
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900 }}>Your shopping cart is empty</h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Explore top 5G smartphones in Sivakasi to get started.</p>
        <Btn onClick={() => nav('/mobiles')} style={{ padding: '12px 32px' }}>Shop Available Mobiles</Btn>
      </div>
    );
  }

  return (
    <div className="site-page-container" style={{ maxWidth: 1160, margin: '0 auto' }}>
      <PageHead title={`Shopping Cart (${t.lines.length} items)`} />

      <div className="cart-grid" style={{ marginTop: 16 }}>
        {/* Left Column: Cart items list */}
        <div>
          {t.lines.map(({ product: p, qty }, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                gap: 16,
                padding: 16,
                background: '#fff',
                borderRadius: 18,
                border: `1.5px solid ${C.border}`,
                marginBottom: 14,
                opacity: leaving === p.id ? 0 : 1,
                transform: leaving === p.id ? 'translateX(60px)' : 'none',
                transition: 'all .3s ease',
                animation: `fadeUp .45s ease ${i * 70}ms both`,
              }}
            >
              <div style={{ width: 100, height: 110, borderRadius: 14, background: C.tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <ProductArt category={p.category} color={p.color} size={84} image={p.image} alt={p.name} />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{p.name}</div>
                    <button onClick={() => remove(p.id)} aria-label="Remove" style={{ color: C.muted, cursor: 'pointer', padding: 4 }}>
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: C.success, fontWeight: 700, margin: '4px 0 8px' }}>
                    ✓ In Stock at Sivakasi Branch
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: C.text }}>{money(p.price * qty)}</div>
                    <div style={{ fontSize: 11, color: C.muted, textDecoration: 'line-through' }}>{money(p.mrp * qty)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', background: C.tint, borderRadius: 12, padding: '2px 4px' }}>
                    <button className="tap" onClick={() => setQty(p.id, qty - 1)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }} aria-label="Decrease">
                      <Icon name="minus" size={15} />
                    </button>
                    <span key={qty} style={{ minWidth: 28, textAlign: 'center', fontWeight: 800, fontSize: 14 }}>
                      {qty}
                    </span>
                    <button className="tap" onClick={() => setQty(p.id, Math.min(p.stock, qty + 1))} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }} aria-label="Increase">
                      <Icon name="plus" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Coupons & Order Summary Sticky Card */}
        <div style={{ position: 'sticky', top: 70 }}>
          {/* Coupon input */}
          <div style={{ padding: 18, borderRadius: 18, background: '#fff', border: `1.5px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="percent" size={16} color={C.primary} /> Discount Coupons &amp; Offers
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Coupon code (e.g. FESTIVAL2000)"
                style={{ ...input, padding: '10px 12px', fontSize: 13, letterSpacing: 0.5 }}
              />
              <Btn onClick={apply} style={{ padding: '0 20px', fontSize: 13 }}>Apply</Btn>
            </div>
            {msg && (
              <div key={msg.text} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: msg.ok ? C.success : C.danger }}>
                {msg.text}
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div style={{ padding: 20, borderRadius: 18, background: '#fff', border: `1.5px solid ${C.border}` }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: C.text }}>Order Price Summary</div>
            <Row label={`Items total (MRP)`} value={money(t.mrpTotal)} />
            <Row label="Direct store discount" value={`− ${money(t.productDiscount)}`} green />
            {t.couponDiscount > 0 && <Row label={`Coupon (${coupon})`} value={`− ${money(t.couponDiscount)}`} green />}
            <Row label="Express Delivery fee" value="FREE" green />
            <div style={{ borderTop: `1px dashed ${C.border}`, margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 20 }}>
              <span>Total Payable</span>
              <span key={t.payable} style={{ color: C.primary }}>{money(t.payable)}</span>
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: C.successSoft, color: C.success, fontSize: 12.5, fontWeight: 700 }}>
              🎉 You are saving {money(t.saved)} on this purchase!
            </div>

            {/* Account Status / Sign In requirement banner */}
            {!user ? (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  color: '#92400e',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>🔒</span>
                <span>Sign in or create an account to proceed to checkout.</span>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 14,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: C.successSoft,
                  color: C.success,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name="check" size={14} color={C.success} stroke={3} />
                <span>Signed in as <strong>{user.name}</strong></span>
              </div>
            )}

            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <Btn full onClick={handleProceedToCheckout} style={{ padding: '14px 0', fontSize: 14, fontWeight: 800 }}>
                {!user ? 'Sign In & Proceed to Checkout' : 'Proceed to Checkout'} · {money(t.payable)} <Icon name="right" size={16} />
              </Btn>
              <Btn full variant="light" onClick={() => nav('/mobiles')} style={{ padding: '11px 0', fontSize: 13 }}>
                Continue Shopping
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '6px 0', color: green ? C.success : C.text, fontWeight: green ? 700 : 500 }}>
      <span style={{ color: green ? C.success : C.muted }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
