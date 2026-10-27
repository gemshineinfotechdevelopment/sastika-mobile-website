import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import { api } from '../api';
import Icon, { type IconName } from '../components/Icon';
import { Btn, Field, PageHead, input } from './ui';
import { computeTotals } from './pricing';

const STEPS = ['Contact', 'Address', 'Payment', 'Review'];

const PAYMENTS: { id: string; title: string; sub: string; icon: IconName; badge?: string }[] = [
  {
    id: 'RAZORPAY',
    title: 'Pay Online via Razorpay',
    sub: 'Google Pay, PhonePe, Paytm, UPI, Cards (Credit/Debit) & Netbanking',
    icon: 'zap',
    badge: '100% Secure',
  },
  {
    id: 'COD',
    title: 'Cash on Delivery',
    sub: 'Pay cash or UPI at your doorstep upon delivery (Sivakasi only)',
    icon: 'truck',
  },
];

export default function Checkout() {
  const nav = useNavigate();
  const { cart, products, getProduct, coupon, placeOrder, user, logout, logo, flashDeal } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone ? user.phone.replace('+91 ', '') : '',
    email: user?.email || '',
    address: '',
    city: '',
    pin: '',
    payment: 'RAZORPAY',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showKeysSetupModal, setShowKeysSetupModal] = useState(false);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState<{
    open: boolean;
    orderId: string;
    paymentId: string;
  } | null>(null);

  const t = computeTotals(cart, products, coupon, getProduct);

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const [codEnabled, setCodEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('sastika:settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.codOn === false) return false;
      }
    } catch {
      /* ignore */
    }
    return true;
  });

  useEffect(() => {
    const checkSettings = () => {
      try {
        const raw = localStorage.getItem('sastika:settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          const isCodOn = parsed.codOn !== false;
          setCodEnabled(isCodOn);
          if (!isCodOn && form.payment === 'COD') {
            setForm((f) => ({ ...f, payment: 'RAZORPAY' }));
          }
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('storage', checkSettings);
    window.addEventListener('sastika:settings_changed', checkSettings);
    return () => {
      window.removeEventListener('storage', checkSettings);
      window.removeEventListener('sastika:settings_changed', checkSettings);
    };
  }, [form.payment]);

  const isSivakasi = form.city.trim().toLowerCase().includes('sivakasi');
  const isCodAllowed = codEnabled && isSivakasi;

  const availablePayments = PAYMENTS.filter((p) => {
    if (p.id === 'COD') return isCodAllowed;
    return true;
  });

  useEffect(() => {
    if (!isCodAllowed && form.payment === 'COD') {
      setForm((f) => ({ ...f, payment: availablePayments[0]?.id || 'RAZORPAY' }));
    }
  }, [isCodAllowed, form.payment, availablePayments]);

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

  const pay = async () => {
    setError('');
    setBusy(true);

    const orderId = '#SM-' + String(Math.floor(100000 + Math.random() * 899999));
    const items = cart
      .map((l) => {
        const p = products.find((x) => x.id === l.id) || flashDeal.items?.find((x) => x.id === l.id);
        return p ? { productId: p.id, name: p.name, qty: l.qty, price: p.price } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // 1. CASH ON DELIVERY FLOW
    if (form.payment === 'COD') {
      window.setTimeout(() => {
        const id = placeOrder({
          id: orderId,
          name: form.name.trim() || user?.name || 'Customer',
          phone: '+91 ' + (form.phone.trim() || (user?.phone ? user.phone.replace('+91 ', '') : '9876543210')),
          email: form.email.trim() || user?.email || '',
          address: `${form.address.trim()}, ${form.city.trim()} ${form.pin.trim()}`,
          city: form.city.trim(),
          payment: 'Cash on Delivery (COD)',
          discount: t.couponDiscount,
        });
        nav(`/confirmation/${encodeURIComponent(id)}`, { replace: true });
      }, 700);
      return;
    }

    // 2. RAZORPAY ONLINE PAYMENT FLOW
    try {
      // Step A: Request Razorpay Order Creation from Backend
      const orderRes = await api.createRazorpayOrder({
        amount: t.payable,
        receipt: orderId,
        notes: {
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
          orderId: orderId,
        },
      }).catch((err: any) => {
        throw new Error(err?.message || 'Failed to connect to Razorpay server');
      });

      if (!orderRes || !orderRes.success || !orderRes.orderId) {
        if (orderRes?.configured === false || orderRes?.message?.includes('not configured')) {
          setShowKeysSetupModal(true);
          setBusy(false);
          return;
        }
        throw new Error(orderRes?.message || 'Could not initiate Razorpay payment. Please try again.');
      }

      // Check if Razorpay SDK loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Step B: Launch Razorpay Checkout Modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'Sastika Mobiles',
        description: `Order Payment ${orderId}`,
        image: logo || undefined,
        order_id: orderRes.orderId,
        prefill: {
          name: form.name.trim() || user?.name || '',
          email: form.email.trim() || user?.email || '',
          contact: form.phone.trim() || '',
        },
        theme: {
          color: '#0b4a43', // Sastika emerald theme
        },
        modal: {
          ondismiss: function () {
            setBusy(false);
            setVerifyingPayment(false);
            setError('Payment cancelled. You can retry whenever you are ready.');
          },
        },
        // Step C: Handler called when customer finishes payment in Razorpay modal
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          // =========================================================================
          // CRITICAL REQUIREMENT:
          // DO NOT NOTIFY FRONTEND SUCCESS YET!
          // Send signature, payment ID & order data to BACKEND to cryptographically verify HMAC-SHA256.
          // =========================================================================
          setVerifyingPayment(true);

          try {
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                id: orderId,
                customer: form.name.trim() || user?.name || 'Customer',
                phone: '+91 ' + (form.phone.trim() || '9876543210'),
                email: form.email.trim() || user?.email || '',
                address: `${form.address.trim()}, ${form.city.trim()} ${form.pin.trim()}`,
                city: form.city.trim(),
                items: items,
                total: t.payable,
                paymentMethod: 'Razorpay Online (UPI/Cards)',
              },
            });

            if (verifyRes && verifyRes.success && verifyRes.verified) {
              // =====================================================================
              // BACKEND HAS VERIFIED SIGNATURE & PERSISTED ORDER IN DATABASE!
              // NOW AND ONLY NOW NOTIFY FRONTEND WITH CONFIRMATION MESSAGE!
              // =====================================================================
              placeOrder({
                id: orderId,
                name: form.name.trim() || user?.name || 'Customer',
                phone: '+91 ' + (form.phone.trim() || '9876543210'),
                email: form.email.trim() || user?.email || '',
                address: `${form.address.trim()}, ${form.city.trim()} ${form.pin.trim()}`,
                city: form.city.trim(),
                payment: 'Razorpay Online (UPI/Cards)',
                discount: t.couponDiscount,
                paymentStatus: 'Paid',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                isPreVerified: true,
              });

              setPaymentSuccessModal({
                open: true,
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
              });
            } else {
              setError(
                verifyRes?.message ||
                  'Payment verification failed on the server. If money was debited, it will be refunded automatically.'
              );
            }
          } catch (verifyErr: any) {
            console.error('Payment verification error:', verifyErr);
            setError(
              verifyErr?.message ||
                'Server payment verification error. Please contact Sastika Mobiles with your transaction details.'
            );
          } finally {
            setVerifyingPayment(false);
            setBusy(false);
          }
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setBusy(false);
        setVerifyingPayment(false);
        setError(`Payment Failed: ${resp.error?.description || 'Transaction declined by bank/UPI'}`);
      });
      rzpInstance.open();
    } catch (err: any) {
      setBusy(false);
      setVerifyingPayment(false);
      setError(err?.message || 'Failed to start payment. Please check your connection.');
    }
  };

  if (!user && !busy) return <Navigate to="/login?redirect=/checkout" replace />;
  if (t.lines.length === 0 && !busy && !paymentSuccessModal) return <Navigate to="/cart" replace />;

  return (
    <div className="site-page-container" style={{ maxWidth: 840, margin: '0 auto', position: 'relative' }}>
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
            {availablePayments.map((p) => (
              <button
                key={p.id}
                onClick={() => set('payment', p.id)}
                className="tap"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 10,
                  border: `2px solid ${form.payment === p.id ? C.primary : C.border}`,
                  background: form.payment === p.id ? C.tint2 : '#fff',
                  transition: 'all .25s ease',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: form.payment === p.id ? C.primary : C.tint,
                    color: form.payment === p.id ? C.accent : C.primary,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={p.icon} size={20} />
                </span>
                <span style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{p.title}</span>
                    {p.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '2px 6px',
                          borderRadius: 6,
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{p.sub}</div>
                </span>
                {form.payment === p.id && <Icon name="check" size={20} color={C.primary} stroke={3} />}
              </button>
            ))}

            {form.payment === 'RAZORPAY' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 10,
                  color: '#15803d',
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 10,
                }}
              >
                <Icon name="check" size={16} color="#15803d" />
                <span>
                  Protected by Razorpay 256-bit encryption. Payment is verified directly with our backend server.
                </span>
              </div>
            )}

            {isCodAllowed ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: C.successSoft,
                  border: `1px solid ${C.success}`,
                  borderRadius: 10,
                  color: '#166534',
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 10,
                }}
              >
                <Icon name="check" size={16} color="#166534" />
                <span>Cash on Delivery is available for delivery in <strong>{form.city}</strong>.</span>
              </div>
            ) : form.city.trim() ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 10,
                  color: '#92400e',
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 10,
                }}
              >
                <Icon name="alert" size={16} color="#92400e" />
                <span>
                  Notice: Cash on Delivery is exclusively available for <strong>Sivakasi</strong>. For{' '}
                  <strong>{form.city}</strong>, please pay securely online via Razorpay (UPI, Card, Netbanking).
                </span>
              </div>
            ) : null}
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
                <span style={{ color: C.muted }}>
                  Payment Method: <b>{form.payment === 'RAZORPAY' ? 'Razorpay Online (UPI/Cards)' : 'Cash on Delivery'}</b>
                </span>
              </div>
            </Card>
          </>
        )}

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: C.dangerSoft,
              color: C.danger,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'fadeUp .3s ease',
            }}
          >
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {step > 0 && <Btn variant="light" onClick={() => setStep((s) => s - 1)} style={{ flex: 1 }}>Back</Btn>}
          {step < 3 ? (
            <Btn onClick={next} style={{ flex: 2 }}>
              {step === 0 ? 'Continue to Address' : step === 1 ? 'Continue to Payment' : 'Review Order'} <Icon name="right" size={16} />
            </Btn>
          ) : (
            <Btn onClick={pay} disabled={busy || verifyingPayment} style={{ flex: 2 }}>
              {verifyingPayment ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: 99, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'spin .8s linear infinite' }} />
                  Verifying with Server…
                </>
              ) : busy ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: 99, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'spin .8s linear infinite' }} />
                  Connecting to Razorpay…
                </>
              ) : (
                <>
                  {form.payment === 'RAZORPAY' ? 'Pay Online with Razorpay · ' : 'Confirm COD Order · '}
                  {money(t.payable)}
                </>
              )}
            </Btn>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BACKEND PAYMENT VERIFICATION OVERLAY (CRITICAL REQUIREMENT)            */}
      {/* ========================================================================= */}
      {verifyingPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: 'rgba(6, 42, 37, 0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn .2s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#ffffff',
              borderRadius: 22,
              padding: '28px 24px',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: `2px solid ${C.primary}`,
              animation: 'pop .3s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: C.tint2,
                border: `3px solid ${C.primary}`,
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                color: C.primary,
                fontSize: 32,
              }}
            >
              🛡️
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 900, color: C.text }}>
              Verifying Payment with Server…
            </h3>

            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>
              Our backend server is cryptographically validating your transaction signature and saving your order details to the database.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f0fdf4',
                color: '#15803d',
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid #bbf7d0',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 99,
                  background: '#15803d',
                  animation: 'pulseRing 1.5s infinite',
                }}
              />
              <span>Cryptographic HMAC-SHA256 check active</span>
            </div>

            <div style={{ marginTop: 16, fontSize: 11.5, color: C.muted }}>
              Please do not close or reload this window.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUCCESS NOTIFICATION MODAL (DISPLAYED ONLY AFTER BACKEND VERIFIES)     */}
      {/* ========================================================================= */}
      {paymentSuccessModal?.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10002,
            background: 'rgba(6, 42, 37, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn .25s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#ffffff',
              borderRadius: 22,
              padding: '28px 24px',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '2px solid #86efac',
              animation: 'pop .3s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#dcfce7',
                border: '3px solid #22c55e',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                color: '#15803d',
                fontSize: 30,
              }}
            >
              ✓
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#16a34a', marginBottom: 4 }}>
              TRANSACTION VERIFIED
            </div>

            <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 900, color: C.text }}>
              Payment Verified Successfully!
            </h3>

            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>
              Your payment has been verified by the backend and your order is securely saved in the Sastika Mobiles database.
            </p>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: 14,
                padding: '14px 16px',
                border: `1px solid ${C.border}`,
                textAlign: 'left',
                display: 'grid',
                gap: 6,
                fontSize: 12.5,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.muted }}>Order Number:</span>
                <strong style={{ color: C.primary }}>{paymentSuccessModal.orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.muted }}>Razorpay Payment ID:</span>
                <strong style={{ fontFamily: 'monospace', fontSize: 11.5 }}>
                  {paymentSuccessModal.paymentId}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.muted }}>Backend Database Status:</span>
                <strong style={{ color: '#16a34a' }}>✓ Stored &amp; Paid</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const targetId = paymentSuccessModal.orderId;
                setPaymentSuccessModal(null);
                nav(`/confirmation/${encodeURIComponent(targetId)}`, { replace: true });
              }}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
                color: '#ffffff',
                fontSize: 14.5,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(11,74,67,0.25)',
                transition: 'transform .15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              View Order Confirmation →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RAZORPAY API KEYS SETUP GUIDANCE MODAL                                 */}
      {/* ========================================================================= */}
      {showKeysSetupModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeUp .2s ease',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '24px 24px 20px',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 16px 45px rgba(0,0,0,0.25)',
              border: `1.5px solid ${C.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>💳</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: C.text }}>
                  Razorpay API Keys Required
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeysSetupModal(false)}
                style={{
                  border: 'none',
                  background: C.tint2,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: 14,
                  color: C.muted,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 10,
                padding: '11px 13px',
                fontSize: 12.5,
                color: '#1e40af',
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              To accept online UPI / Card payments, add your Razorpay Test or Live keys to <code>server/.env</code>:
            </div>

            <div
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                padding: '11px 13px',
                borderRadius: 8,
                fontSize: 11.5,
                fontFamily: 'monospace',
                marginBottom: 12,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
{`# In server/.env on your server:
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret`}
            </div>

            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>
              <strong>Where to get these keys:</strong><br />
              Log into <a href="https://dashboard.razorpay.com/#/access/api-keys" target="_blank" rel="noreferrer" style={{ color: C.primary, fontWeight: 700 }}>Razorpay Dashboard</a> → Settings → API Keys → Generate Key.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowKeysSetupModal(false)}
                style={{
                  padding: '9px 18px',
                  background: C.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
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
