import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import { Btn, Field, PageHead, input } from './ui';
import { computeTotals } from './pricing';

const STEPS = ['Contact', 'Address', 'Payment', 'Review'];

const PAYMENTS: { id: string; title: string; sub: string; icon: IconName }[] = [
  { id: 'UPI', title: 'UPI / QR Payment', sub: 'Google Pay, PhonePe, Paytm — extra ₹500 off', icon: 'zap' },
  { id: 'Credit Card', title: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay · No-cost EMI', icon: 'card' },
  { id: 'Net Banking', title: 'Net Banking', sub: 'SBI, HDFC, Axis, ICICI and others', icon: 'lock' },
  { id: 'COD', title: 'Cash on Delivery', sub: '₹50 verification deposit may apply', icon: 'truck' },
];

export default function Checkout() {
  const nav = useNavigate();
  const { cart, products, coupon, placeOrder } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: 'Chennai', pin: '', payment: 'UPI' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const t = computeTotals(cart, products, coupon);

  if (t.lines.length === 0 && !busy) return <Navigate to="/cart" replace />;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => {
    setError('');
    if (step === 0) {
      if (form.name.trim().length < 2) return setError('Please enter your full name');
      if (!/^\d{10}$/.test(form.phone)) return setError('Enter a valid 10-digit mobile number');
    }
    if (step === 1) {
      if (form.address.trim().length < 8) return setError('Please enter your full address');
      if (!/^\d{6}$/.test(form.pin)) return setError('Enter a valid 6-digit pincode');
    }
    setStep((s) => s + 1);
  };

  const pay = () => {
    setBusy(true);
    window.setTimeout(() => {
      const id = placeOrder({
        name: form.name,
        phone: '+91 ' + form.phone,
        address: `${form.address}, ${form.city} ${form.pin}`,
        city: form.city,
        payment: form.payment,
        discount: t.couponDiscount,
      });
      nav(`/confirmation/${encodeURIComponent(id)}`, { replace: true });
    }, 1400);
  };

  return (
    <div style={{ paddingBottom: 30 }}>
      <PageHead title="Secure Checkout" sub="Encrypted · Sastika Protected" />

      {/* stepper */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 22px 18px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, background: i <= step ? C.primary : '#fff', color: i <= step ? '#fff' : C.muted, border: `2px solid ${i <= step ? C.primary : C.border}`, transition: 'all .4s ease', animation: i === step ? 'pulseRing 2s infinite' : undefined }}>
                {i < step ? <Icon name="check" size={14} stroke={3} /> : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: i <= step ? C.primary : C.muted }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 3, margin: '0 6px 16px', background: C.border, borderRadius: 9, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: i < step ? '100%' : '0%', background: C.primary, transition: 'width .5s ease' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div key={step} style={{ padding: '0 18px', animation: 'fadeUp .4s ease both' }}>
        {step === 0 && (
          <Card title="Contact information">
            <Field label="Full name"><input style={input} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Rajesh Kumar" /></Field>
            <Field label="Mobile number"><input style={input} inputMode="numeric" value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" /></Field>
            <Field label="Email (optional)"><input style={input} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" /></Field>
          </Card>
        )}
        {step === 1 && (
          <Card title="Shipping address">
            <Field label="Address"><textarea style={{ ...input, minHeight: 84, resize: 'none' }} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Flat, street, landmark" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="City"><input style={input} value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
              <Field label="Pincode"><input style={input} inputMode="numeric" value={form.pin} onChange={(e) => set('pin', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="600017" /></Field>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 12, background: C.successSoft, color: C.success, fontSize: 12, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Icon name="truck" size={16} /> Sastika Lightning Express · Free delivery by tomorrow, 2:00 PM
            </div>
          </Card>
        )}
        {step === 2 && (
          <Card title="Select payment option">
            {PAYMENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => set('payment', p.id)}
                className="tap"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: 12, borderRadius: 14, marginBottom: 8, border: `2px solid ${form.payment === p.id ? C.primary : C.border}`, background: form.payment === p.id ? C.tint2 : '#fff', transition: 'all .25s ease' }}
              >
                <span style={{ width: 38, height: 38, borderRadius: 12, background: form.payment === p.id ? C.primary : C.tint, color: form.payment === p.id ? C.accent : C.primary, display: 'grid', placeItems: 'center' }}>
                  <Icon name={p.icon} size={18} />
                </span>
                <span style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.sub}</div>
                </span>
                {form.payment === p.id && <Icon name="check" size={18} color={C.primary} stroke={3} />}
              </button>
            ))}
          </Card>
        )}
        {step === 3 && (
          <>
            <Card title={`Items in order (${t.lines.length})`}>
              {t.lines.map(({ product: p, qty }) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 0', fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{p.name} <span style={{ color: C.muted }}>× {qty}</span></span>
                  <b>{money(p.price * qty)}</b>
                </div>
              ))}
              {t.couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.success, fontWeight: 700, padding: '7px 0' }}>
                  <span>Coupon {coupon}</span><span>− {money(t.couponDiscount)}</span>
                </div>
              )}
              <div style={{ borderTop: `1px dashed ${C.border}`, marginTop: 6, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}>
                <span>Total Payable</span><span>{money(t.payable)}</span>
              </div>
            </Card>
            <Card title="Delivering to">
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                <b>{form.name}</b> · +91 {form.phone}<br />
                {form.address}, {form.city} {form.pin}<br />
                <span style={{ color: C.muted }}>Paying via {form.payment}</span>
              </div>
            </Card>
          </>
        )}

        {error && <div style={{ marginTop: 10, color: C.danger, fontSize: 12.5, fontWeight: 700, animation: 'fadeUp .3s ease' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {step > 0 && <Btn variant="light" onClick={() => setStep((s) => s - 1)} style={{ flex: 1 }}>Back</Btn>}
          {step < 3 ? (
            <Btn onClick={next} style={{ flex: 2 }}>Continue <Icon name="right" size={16} /></Btn>
          ) : (
            <Btn onClick={pay} disabled={busy} style={{ flex: 2 }}>
              {busy ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: 99, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'spin .8s linear infinite' }} /> Processing…
                </>
              ) : (
                <>Pay & Place Order · {money(t.payable)}</>
              )}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
