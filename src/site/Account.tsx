import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { OrderStatus } from '../types';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { CountUp, Reveal } from '../components/anim';
import { Btn, Pill, Field, input } from './ui';
import ProductCard from './ProductCard';

const FLOW: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Delivered'];

export default function Account() {
  const nav = useNavigate();
  const { orders, wishlist, products, tickets, cartCount, user, login, register, logout } = useStore();
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'service'>('orders');
  const [open, setOpen] = useState<string | null>(orders[0]?.id ?? null);

  // Authentication form state for guest customers
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  const wished = products.filter((p) => wishlist.includes(p.id));
  const tone = (s: OrderStatus) =>
    s === 'Delivered' ? 'success' : s === 'Cancelled' ? 'danger' : s === 'Shipped' ? 'accent' : 'tint';

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      if (!authForm.email.trim() || !authForm.email.includes('@')) {
        return setAuthError('Please enter a valid registered email address.');
      }
      if (!authForm.password) {
        return setAuthError('Please enter your account password.');
      }

      setAuthBusy(true);
      const res = await login(authForm.email.trim(), authForm.password);
      setAuthBusy(false);
      if (!res.success) {
        setAuthError(res.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (authForm.name.trim().length < 2) {
        return setAuthError('Please enter your full name.');
      }
      if (!/^\d{10}$/.test(authForm.phone.trim().replace(/\D/g, ''))) {
        return setAuthError('Please enter a valid 10-digit mobile number.');
      }
      if (!authForm.email.trim() || !authForm.email.includes('@')) {
        return setAuthError('Please enter a valid email address.');
      }
      if (authForm.password.length < 4) {
        return setAuthError('Password must be at least 4 characters.');
      }

      setAuthBusy(true);
      const res = await register({
        name: authForm.name.trim(),
        email: authForm.email.trim(),
        phone: '+91 ' + authForm.phone.trim().replace(/\D/g, '').slice(0, 10),
        password: authForm.password,
      });
      setAuthBusy(false);
      if (!res.success) {
        setAuthError(res.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="site-page-container" style={{ maxWidth: 880, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ padding: '16px 18px 0' }}>
        {/* If User is Logged In: Customer Profile Badge */}
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: 20,
              borderRadius: 24,
              background: `linear-gradient(135deg, #072a25 0%, ${C.primaryDark} 50%, #052622 100%)`,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(7,42,37,0.22)',
              border: '1px solid rgba(255,255,255,0.1)',
              animation: 'fadeUp .5s ease both',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 99,
                  background: C.accent,
                  color: C.primaryDark,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 24,
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(246,196,69,0.3)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: 0.2 }}>{user.name}</div>
                <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>
                  {user.phone ? user.phone : 'Mobile verified'} · {user.email}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Pill tone="accent">GOLD CLUB MEMBER</Pill>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>✓ Warranty Enrolled</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="tap"
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all .2s ease',
              }}
            >
              <Icon name="logout" size={14} color="#fca5a5" />
              Sign Out
            </button>
          </div>
        ) : (
          /* If User is NOT Logged In: Clean Login & Registration Card */
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              border: `1.5px solid ${C.border}`,
              padding: '24px 22px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              animation: 'fadeUp .45s ease both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: C.tint2,
                  color: C.primary,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name="user" size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.text }}>
                  {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  Access your phone orders, official brand warranty certificates, and invoice receipts.
                </div>
              </div>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                background: C.tint,
                padding: 4,
                borderRadius: 14,
                margin: '18px 0 16px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 11,
                  fontWeight: 800,
                  fontSize: 13,
                  background: authMode === 'login' ? '#fff' : 'transparent',
                  color: authMode === 'login' ? C.primary : C.muted,
                  boxShadow: authMode === 'login' ? '0 2px 8px rgba(11,74,67,.12)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 11,
                  fontWeight: 800,
                  fontSize: 13,
                  background: authMode === 'register' ? '#fff' : 'transparent',
                  color: authMode === 'register' ? C.primary : C.muted,
                  boxShadow: authMode === 'register' ? '0 2px 8px rgba(11,74,67,.12)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                }}
              >
                Create Account (New Customer)
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {authMode === 'register' && (
                <>
                  <Field label="Full Name">
                    <input
                      style={input}
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kannan"
                    />
                  </Field>
                  <Field label="Mobile Number (10 digits for WhatsApp order & delivery updates)">
                    <input
                      style={input}
                      inputMode="numeric"
                      value={authForm.phone}
                      onChange={(e) =>
                        setAuthForm({
                          ...authForm,
                          phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                      placeholder="98765 43210"
                    />
                  </Field>
                </>
              )}

              <Field label="Email Address">
                <input
                  style={input}
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="ramesh@example.com"
                />
              </Field>

              <Field label="Password">
                <input
                  style={input}
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder={authMode === 'register' ? 'Choose a password (min 4 characters)' : 'Enter your password'}
                />
              </Field>

              {authError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.1)',
                    color: C.danger,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  {authError}
                </div>
              )}

              <Btn type="submit" disabled={authBusy} style={{ marginTop: 6, minHeight: 46 }}>
                {authBusy ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 99,
                        border: '2.5px solid rgba(255,255,255,.4)',
                        borderTopColor: '#fff',
                        animation: 'spin .8s linear infinite',
                      }}
                    />
                    Authenticating…
                  </>
                ) : authMode === 'login' ? (
                  <>
                    Sign In to Account <Icon name="right" size={16} />
                  </>
                ) : (
                  <>
                    Create Free Customer Account <Icon name="right" size={16} />
                  </>
                )}
              </Btn>

              <div style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 4 }}>
                {authMode === 'login' ? (
                  <span>
                    New to Sastika Mobiles?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      style={{ color: C.primary, fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Create account here
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      style={{ color: C.primary, fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Sign in here
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Account Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
          {[
            { v: orders.length, l: 'Orders' },
            { v: wishlist.length, l: 'Wishlist' },
            { v: user ? 1250 : 250, l: 'Reward Coins' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 90} dir="zoom">
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: `1px solid ${C.border}`,
                  padding: '14px 0',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>
                  <CountUp to={s.v} duration={1000} />
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 700 }}>{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {cartCount > 0 && (
          <button
            className="tap"
            onClick={() => nav('/cart')}
            style={{
              width: '100%',
              marginTop: 14,
              padding: '12px 16px',
              borderRadius: 14,
              background: C.warnSoft,
              color: C.warn,
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>You have {cartCount} item{cartCount > 1 ? 's' : ''} in your cart</span>
            <Icon name="right" size={16} />
          </button>
        )}

        {/* Tab Navigator */}
        <div style={{ marginTop: 18, display: 'flex', gap: 6, background: C.tint, padding: 4, borderRadius: 14 }}>
          {([['orders', 'Orders & Warranty'], ['wishlist', 'Saved Wishlist'], ['service', 'Service Desk']] as const).map(
            ([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k as any)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 11,
                  fontWeight: 800,
                  fontSize: 12.5,
                  background: tab === k ? '#fff' : 'transparent',
                  color: tab === k ? C.primary : C.muted,
                  boxShadow: tab === k ? '0 2px 8px rgba(11,74,67,.1)' : 'none',
                  transition: 'all .25s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {l}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div key={tab} style={{ padding: '16px 18px 0', animation: 'fadeUp .35s ease both' }}>
        {tab === 'orders' &&
          (orders.length === 0 ? (
            <Empty icon="heart" text="No orders placed yet. Browse our smartphones to place your first order!" />
          ) : (
            orders.map((o, idx) => {
              const isOpen = open === o.id;
              const stage = FLOW.indexOf(o.status);
              const first = products.find((p) => p.id === o.items[0]?.productId);
              return (
                <div
                  key={o.id}
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    border: `1px solid ${C.border}`,
                    marginBottom: 12,
                    overflow: 'hidden',
                    animation: `fadeUp .4s ease ${idx * 60}ms both`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : o.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: C.tint,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {first && (
                        <ProductArt
                          category={first.category}
                          color={first.color}
                          size={44}
                          image={first.image}
                          alt={first.name}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{o.id}</div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: C.muted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: 2,
                        }}
                      >
                        {o.items.map((i) => i.name).join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14.5 }}>{money(o.total)}</div>
                      <Pill tone={tone(o.status)}>{o.status.toUpperCase()}</Pill>
                    </div>
                  </button>

                  <div
                    style={{
                      maxHeight: isOpen ? 260 : 0,
                      transition: 'max-height .45s ease',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '4px 18px 18px', borderTop: `1px solid ${C.tint2}` }}>
                      {o.status === 'Cancelled' ? (
                        <div style={{ color: C.danger, fontWeight: 700, fontSize: 13 }}>
                          This order was cancelled. Refund initiated.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                          {FLOW.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 99,
                                    background: i <= stage ? C.success : '#fff',
                                    border: `2px solid ${i <= stage ? C.success : C.border}`,
                                    display: 'grid',
                                    placeItems: 'center',
                                  }}
                                >
                                  {i <= stage && <Icon name="check" size={12} color="#fff" stroke={3.5} />}
                                </div>
                                <span style={{ fontSize: 9.5, fontWeight: 700, color: i <= stage ? C.success : C.muted }}>
                                  {s}
                                </span>
                              </div>
                              {i < 3 && (
                                <div
                                  style={{
                                    flex: 1,
                                    height: 3,
                                    margin: '0 4px 14px',
                                    background: i < stage ? C.success : C.border,
                                    borderRadius: 9,
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.5 }}>
                        📍 {o.address} · 💳 {o.payment} · 📅 {o.date}
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          padding: '8px 12px',
                          borderRadius: 10,
                          background: C.tint,
                          fontSize: 11.5,
                          color: C.primary,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        ✓ Official 1-Year Brand Warranty &amp; GST Bill Registered
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ))}

        {tab === 'wishlist' &&
          (wished.length === 0 ? (
            <Empty icon="heart" text="Tap the heart on any product to save it here." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {wished.map((p) => (
                <ProductCard key={p.id} p={p} compact />
              ))}
            </div>
          ))}

        {tab === 'service' &&
          (tickets.length === 0 ? (
            <Empty icon="tool" text="No service tickets yet." />
          ) : (
            <>
              {tickets.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    border: `1px solid ${C.border}`,
                    padding: 16,
                    marginBottom: 12,
                    animation: `fadeUp .4s ease ${i * 60}ms both`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: 14 }}>#{t.id}</b>
                    <Pill
                      tone={
                        t.status === 'Ready' || t.status === 'Closed'
                          ? 'success'
                          : t.status === 'In Progress'
                          ? 'accent'
                          : 'tint'
                      }
                    >
                      {t.status.toUpperCase()}
                    </Pill>
                  </div>
                  <div style={{ fontSize: 13.5, marginTop: 6, fontWeight: 700 }}>{t.device}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.issue}</div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: C.muted,
                      marginTop: 8,
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="clock" size={13} /> {t.eta} · Specialist: {t.tech}
                  </div>
                </div>
              ))}
              <Btn full variant="light" onClick={() => nav('/services')} style={{ marginTop: 8 }}>
                Book a New Service Ticket
              </Btn>
            </>
          ))}
      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: 'heart' | 'tool'; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
      <Icon
        name={icon}
        size={36}
        style={{ margin: '0 auto 8px', display: 'block', animation: 'floatSoft 3s ease-in-out infinite' }}
      />
      <div style={{ fontSize: 13, fontWeight: 600 }}>{text}</div>
    </div>
  );
}
