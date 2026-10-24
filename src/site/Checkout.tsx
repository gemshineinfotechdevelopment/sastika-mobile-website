import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import { Btn, Field, PageHead, input } from './ui';
import { computeTotals } from './pricing';

const STEPS = ['Contact', 'Address', 'Payment', 'Review'];

const PAYMENTS: { id: string; title: string; sub: string; icon: IconName }[] = [
  { id: 'UPI', title: 'UPI / QR Payment', sub: 'Google Pay, PhonePe, Paytm — Instant & Secure', icon: 'zap' },
  { id: 'COD', title: 'Cash on Delivery', sub: 'Pay cash or UPI at your doorstep upon delivery', icon: 'truck' },
];

export default function Checkout() {
  const nav = useNavigate();
  const { cart, products, getProduct, coupon, placeOrder, user, logout } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone ? user.phone.replace('+91 ', '') : '',
    email: user?.email || '',
    address: '',
    city: '',
    pin: '',
    payment: 'UPI',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const t = computeTotals(cart, products, coupon, getProduct);

  const hasPhone = cart.some((l) => getProduct(l.id)?.category === 'phone');

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || (user.phone ? user.phone.replace('+91 ', '') : ''),
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const set = (k: keyof typeof form, v: string) => {
    if (error) setError('');
    setForm((f) => ({ ...f, [k]: v }));
  };

  const next = async () => {
    setError('');

    // Step 0: Customer Account & Contact Verification
    if (step === 0) {
      const cleanName = form.name.trim();
      const cleanPhone = form.phone.trim();
      const cleanEmail = form.email.trim();

      if (!cleanName) return setError('Please enter your full name (Mandatory)');
      if (cleanName.length < 2) return setError('Name must be at least 2 characters');
      if (!cleanPhone) return setError('Please enter your 10-digit mobile number (Mandatory)');
      if (!/^\d{10}$/.test(cleanPhone)) return setError('Enter a valid 10-digit mobile number');
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return setError('Enter a valid email address (e.g. name@example.com)');
      }
    }

    // Step 1: Shipping Address
    if (step === 1) {
      if (form.address.trim().length < 8) return setError('Please enter your full delivery address (at least 8 characters)');
      if (!form.city.trim() || form.city.trim().length < 2) return setError('Please enter your City / Town (Mandatory)');
      if (!/^\d{6}$/.test(form.pin.trim())) return setError('Enter a valid 6-digit pincode');
    }

    setStep((s) => s + 1);
  };

  const pay = () => {
    setBusy(true);
    window.setTimeout(() => {
      const id = placeOrder({
        name: form.name.trim() || user?.name || 'Customer',
        phone: '+91 ' + (form.phone.trim() || (user?.phone ? user.phone.replace('+91 ', '') : '9876543210')),
        email: form.email.trim() || user?.email || '',
        address: `${form.address.trim()}, ${form.city.trim()} ${form.pin.trim()}`,
        city: form.city.trim(),
        payment: form.payment,
        discount: t.couponDiscount,
      });
      nav(`/confirmation/${encodeURIComponent(id)}`, { replace: true });
    }, 1400);
  };

  if (!user && !busy) return <Navigate to="/login?redirect=/checkout" replace />;
  if (t.lines.length === 0 && !busy) return <Navigate to="/cart" replace />;

  return (
    <div className="site-page-container" style={{ maxWidth: 840, margin: '0 auto' }}>
      <PageHead title="Secure Checkout" sub="Encrypted · Sastika Protected · Doorstep Delivery Across Tamil Nadu" />

      {/* stepper */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 22px 18px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 99,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  background: i <= step ? C.primary : '#fff',
                  color: i <= step ? '#fff' : C.muted,
                  border: `2px solid ${i <= step ? C.primary : C.border}`,
                  transition: 'all .4s ease',
                  animation: i === step ? 'pulseRing 2s infinite' : undefined,
                }}
              >
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
          <Card title="Customer Account & Contact Information">
            <div style={{ padding: '14px 16px', borderRadius: 14, background: C.successSoft, border: `1.5px solid ${C.success}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="check" size={18} color={C.success} stroke={3} />
                  <b style={{ color: C.success, fontSize: 14 }}>Logged in as {user?.name}</b>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    nav('/login?redirect=/checkout');
                  }}
                  style={{ fontSize: 12, color: C.danger, fontWeight: 800, cursor: 'pointer', background: 'transparent', border: 'none' }}
                >
                  Switch account
                </button>
              </div>
              <div style={{ fontSize: 12, color: C.primary, marginTop: 4 }}>
                {user?.email} {user?.phone && `· ${user.phone}`} · Your official GST warranty invoice will be registered to this account.
              </div>
            </div>

            <Field label="Full name" required>
              <input
                style={input}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && next()}
                placeholder="Rajesh Kumar"
                required
              />
            </Field>
            <Field label="Mobile number (10 digits for WhatsApp & delivery SMS)" required>
              <input
                style={input}
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && next()}
                placeholder="98765 43210"
                required
              />
            </Field>
            <Field label="Email address (optional)">
              <input
                style={input}
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && next()}
                placeholder="rajesh@example.com (optional)"
              />
            </Field>
          </Card>
        )}
        {step === 1 && (
          <Card title="Shipping address">
            <Field label="Full Delivery Address" required>
              <textarea
                style={{ ...input, minHeight: 84, resize: 'none' }}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="House / Flat No., Building, Street Name, Area / Landmark"
                required
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="City / Town" required>
                <input
                  style={input}
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="e.g. Sivakasi, Madurai, Chennai"
                  required
                />
              </Field>
              <Field label="Pincode" required>
                <input
                  style={input}
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pin}
                  onChange={(e) => set('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g. 626123"
                  required
                />
              </Field>
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
                {form.email && <><span style={{ color: C.muted }}>Email:</span> <b>{form.email}</b><br /></>}
                {form.address}, {form.city} {form.pin}<br />
                <span style={{ color: C.muted }}>Paying via {form.payment}</span>
              </div>
            </Card>
          </>
        )}

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: C.dangerSoft,
              color: C.danger,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'fadeUp .3s ease',
            }}
          >
            <Icon name="alert" size={16} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {step > 0 && <Btn variant="light" onClick={() => setStep((s) => s - 1)} style={{ flex: 1 }}>Back</Btn>}
          {step < 3 ? (
            <Btn onClick={next} style={{ flex: 2 }}>
              {step === 0 ? 'Continue to Address' : step === 1 ? 'Continue to Payment' : 'Review Order'} <Icon name="right" size={16} />
            </Btn>
          ) : (
            <Btn onClick={pay} disabled={busy} style={{ flex: 2 }}>
              {busy ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: 99, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'spin .8s linear infinite' }} /> Processing…
                </>
              ) : (
                <>Pay &amp; Place Order · {money(t.payable)}</>
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
