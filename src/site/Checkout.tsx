import { useState } from 'react';
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
  const { cart, products, getProduct, coupon, placeOrder, user, login, register, logout } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone ? user.phone.replace('+91 ', '') : '',
    email: user?.email || '',
    address: '',
    city: 'Sivakasi',
    pin: '',
    payment: 'UPI',
  });
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const t = computeTotals(cart, products, coupon, getProduct);

  const hasPhone = cart.some((l) => getProduct(l.id)?.category === 'phone');

  const set = (k: keyof typeof form, v: string) => {
    if (error) setError('');
    setForm((f) => ({ ...f, [k]: v }));
  };

  const next = async () => {
    setError('');

    // Step 0: Account / Contact Authentication
    if (step === 0) {
      if (!user && authMode === 'login') {
        if (!form.email.trim()) return setError('Enter your registered email address (Mandatory)');
        if (!password) return setError('Enter your account password (Mandatory)');

        setAuthBusy(true);
        const res = await login(form.email.trim(), password);
        setAuthBusy(false);
        if (!res.success) {
          return setError(res.message || 'Login failed. Please check your credentials.');
        }
        return;
      }

      // Name and Phone are strictly mandatory
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

      if (!user && password.trim()) {
        if (password.length < 4) return setError('Please choose a password (minimum 4 characters)');

        setAuthBusy(true);
        const res = await register({
          name: cleanName,
          email: cleanEmail,
          phone: '+91 ' + cleanPhone,
          password,
        });
        setAuthBusy(false);
        if (!res.success) {
          return setError(res.message || 'Account registration failed. Please try again.');
        }
      }
    }

    // Step 1: Shipping Address
    if (step === 1) {
      if (form.address.trim().length < 8) return setError('Please enter your full address');
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

  if (t.lines.length === 0 && !busy) return <Navigate to="/cart" replace />;

  return (
    <div className="site-page-container" style={{ maxWidth: 840, margin: '0 auto' }}>
      <PageHead title="Secure Checkout" sub="Encrypted · Sastika Protected · Sivakasi & Sithurajapuram" />

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
          <Card title={user ? 'Customer Account Verified' : hasPhone ? 'Customer Account (Required for Mobile Order)' : 'Customer Account / Contact'}>
            {user ? (
              <div style={{ padding: '14px 16px', borderRadius: 14, background: C.successSoft, border: `1.5px solid ${C.success}`, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="check" size={18} color={C.success} stroke={3} />
                    <b style={{ color: C.success, fontSize: 14 }}>Logged in as {user.name}</b>
                  </div>
                  <button onClick={logout} style={{ fontSize: 12, color: C.danger, fontWeight: 800, cursor: 'pointer', background: 'transparent', border: 'none' }}>
                    Switch account
                  </button>
                </div>
                <div style={{ fontSize: 12, color: C.primary, marginTop: 4 }}>
                  {user.email} {user.phone && `· ${user.phone}`} · Your official GST warranty invoice will be registered to this account.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: '12px 14px', borderRadius: 14, background: C.tint, border: `1px solid ${C.border}`, marginBottom: 16, fontSize: 12.5, color: C.primary, lineHeight: 1.5 }}>
                  📱 <b>Account Registration:</b> Ordering a smartphone requires an account so your brand warranty, IMEI registration, and GST bill are securely stored for lifetime service.
                </div>

                {/* Tabs: Create Account vs Sign In */}
                <div style={{ display: 'flex', gap: 6, background: C.tint2, padding: 4, borderRadius: 12, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setError(''); }}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 12.5,
                      background: authMode === 'register' ? C.primary : 'transparent',
                      color: authMode === 'register' ? '#fff' : C.muted,
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                      border: 'none',
                    }}
                  >
                    Create Account (New)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(''); }}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 12.5,
                      background: authMode === 'login' ? C.primary : 'transparent',
                      color: authMode === 'login' ? '#fff' : C.muted,
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                      border: 'none',
                    }}
                  >
                    Sign In (Existing)
                  </button>
                </div>
              </div>
            )}

            {(!user && authMode === 'login') ? (
              <>
                <Field label="Registered email address" required>
                  <input
                    style={input}
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && next()}
                    placeholder="you@example.com"
                    required
                  />
                </Field>
                <Field label="Account password" required>
                  <input
                    style={input}
                    type="password"
                    value={password}
                    onChange={(e) => { setError(''); setPassword(e.target.value); }}
                    onKeyDown={(e) => e.key === 'Enter' && next()}
                    placeholder="Your account password"
                    required
                  />
                </Field>
              </>
            ) : (
              <>
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
                {!user && (
                  <Field label="Create account password (optional)">
                    <input
                      style={input}
                      type="password"
                      value={password}
                      onChange={(e) => { setError(''); setPassword(e.target.value); }}
                      onKeyDown={(e) => e.key === 'Enter' && next()}
                      placeholder="Choose a password (optional)"
                    />
                  </Field>
                )}
              </>
            )}
          </Card>
        )}
        {step === 1 && (
          <Card title="Shipping address">
            <Field label="Address"><textarea style={{ ...input, minHeight: 84, resize: 'none' }} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Flat, street, landmark" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="City"><input style={input} value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
              <Field label="Pincode"><input style={input} inputMode="numeric" value={form.pin} onChange={(e) => set('pin', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="600017" /></Field>
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
            <Btn onClick={next} disabled={authBusy} style={{ flex: 2 }}>
              {authBusy ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: 99, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'spin .8s linear infinite' }} /> Processing…
                </>
              ) : !user && authMode === 'login' ? (
                <>Sign In &amp; Continue <Icon name="right" size={16} /></>
              ) : (
                <>Continue to Address <Icon name="right" size={16} /></>
              )}
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
