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
  const { cart, products, getProduct, setQty, removeFromCart, coupon, setCoupon } = useStore();
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

  if (t.lines.length === 0) {
    return (
      <div>
        <PageHead title="Shopping Cart" />
        <div style={{ textAlign: 'center', padding: '60px 30px' }}>
          <div style={{ width: 110, height: 110, borderRadius: 99, background: C.tint, display: 'grid', placeItems: 'center', margin: '0 auto 18px', animation: 'floatSoft 3s ease-in-out infinite' }}>
            <Icon name="cart" size={46} color={C.primary} />
          </div>
          <h2 style={{ margin: '0 0 6px' }}>Your cart is empty</h2>
          <p style={{ color: C.muted, fontSize: 13.5, marginBottom: 20 }}>Pick a phone or an accessory to get started.</p>
          <Btn onClick={() => nav('/mobiles')}>Shop Mobiles</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      <PageHead title={`Shopping Cart (${t.lines.length})`} />

      <div style={{ padding: '6px 18px 0' }}>
        {t.lines.map(({ product: p, qty }, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              gap: 12,
              padding: 12,
              background: '#fff',
              borderRadius: 18,
              border: `1px solid ${C.border}`,
              marginBottom: 10,
              opacity: leaving === p.id ? 0 : 1,
              transform: leaving === p.id ? 'translateX(60px)' : 'none',
              transition: 'all .3s ease',
              animation: `fadeUp .45s ease ${i * 70}ms both`,
            }}
          >
            <div style={{ width: 84, height: 96, borderRadius: 14, background: C.tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <ProductArt category={p.category} color={p.color} size={74} image={p.image} alt={p.name} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.25 }}>{p.name}</div>
                <button onClick={() => remove(p.id)} aria-label="Remove" style={{ color: C.muted }}><Icon name="trash" size={16} /></button>
              </div>
              <div style={{ fontSize: 11, color: C.success, fontWeight: 700, margin: '3px 0 6px' }}>In stock</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{money(p.price * qty)}</div>
                  <div style={{ fontSize: 10.5, color: C.muted, textDecoration: 'line-through' }}>{money(p.mrp * qty)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: C.tint, borderRadius: 12 }}>
                  <button className="tap" onClick={() => setQty(p.id, qty - 1)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }} aria-label="Decrease"><Icon name="minus" size={15} /></button>
                  <span key={qty} style={{ minWidth: 22, textAlign: 'center', fontWeight: 800, animation: 'pop .3s ease' }}>{qty}</span>
                  <button className="tap" onClick={() => setQty(p.id, Math.min(p.stock, qty + 1))} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }} aria-label="Increase"><Icon name="plus" size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Reveal>
        <div style={{ margin: '4px 18px 0', padding: 14, borderRadius: 18, background: '#fff', border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="percent" size={16} color={C.primary} /> Coupons & Offers
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code (try FESTIVAL2000)" style={{ ...input, padding: '11px 12px', letterSpacing: 0.5 }} />
            <Btn onClick={apply} style={{ padding: '0 18px' }}>Apply</Btn>
          </div>
          {msg && (
            <div key={msg.text} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: msg.ok ? C.success : C.danger, animation: 'fadeUp .3s ease' }}>{msg.text}</div>
          )}
        </div>
      </Reveal>

      <Reveal>
        <div style={{ margin: '12px 18px 0', padding: 16, borderRadius: 18, background: '#fff', border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Price Details</div>
          <Row label={`Items total (MRP)`} value={money(t.mrpTotal)} />
          <Row label="Product discount" value={`− ${money(t.productDiscount)}`} green />
          {t.couponDiscount > 0 && <Row label={`Coupon (${coupon})`} value={`− ${money(t.couponDiscount)}`} green />}
          <Row label="Delivery fee" value="FREE" green />
          <div style={{ borderTop: `1px dashed ${C.border}`, margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
            <span>Total Payable</span>
            <span key={t.payable} style={{ animation: 'pop .35s ease' }}>{money(t.payable)}</span>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: C.successSoft, color: C.success, fontSize: 12, fontWeight: 700 }}>
            You're saving {money(t.saved)} on this order
          </div>
        </div>
      </Reveal>

      <div style={{ padding: '14px 18px 0', display: 'grid', gap: 10 }}>
        <Btn full onClick={() => nav('/checkout')}>
          Proceed to Checkout · {money(t.payable)} <Icon name="right" size={16} />
        </Btn>
        <Btn full variant="light" onClick={() => nav('/mobiles')}>Continue Shopping</Btn>
      </div>
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: green ? C.success : C.text, fontWeight: green ? 700 : 500 }}>
      <span style={{ color: green ? C.success : C.muted }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
