import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C } from '../theme';
import { useStore } from '../store';
import { api } from '../api';
import type { AuthUser } from '../types';
import Icon from '../components/Icon';
import { Btn, input } from './ui';
import logoImg from '../assets/logo.png';

const compactInput: React.CSSProperties = {
  ...input,
  padding: '9px 12px',
  fontSize: 13,
  borderRadius: 10,
};

function CompactField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 0 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
        {label} {required && <span style={{ color: C.danger, fontWeight: 800 }}>*</span>}
      </div>
      {children}
    </label>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, loginUser, logo } = useStore();

  const [mode, setMode] = useState<'signin' | 'register'>((params.get('mode') as any) || 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = params.get('redirect') || '/orders';

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return setError('Please enter your email or mobile number.');
    if (!password.trim()) return setError('Please enter your password.');
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with backend API
      let res: any = null;
      let networkFailed = false;

      try {
        res = await api.login({ email: email.trim(), password });
      } catch (err: any) {
        const msg = err?.message || '';
        // If the server responded with an authentication failure (e.g., status 401, wrong password, or user not found)
        if (
          msg.includes('401') ||
          msg.includes('400') ||
          msg.toLowerCase().includes('password') ||
          msg.toLowerCase().includes('credential') ||
          msg.toLowerCase().includes('not found') ||
          msg.toLowerCase().includes('register')
        ) {
          setError(msg || 'Incorrect email/mobile or password.');
          setLoading(false);
          return;
        }
        networkFailed = true;
      }

      if (res && res.user) {
        const u: AuthUser = {
          id: res.user.id || res.user._id || 'u_' + Date.now(),
          name: res.user.name || 'Sastika Member',
          email: res.user.email || email.trim(),
          role: res.user.role || (email.toLowerCase().includes('admin') ? 'admin' : 'customer'),
          phone: res.user.phone || '',
        };
        loginUser(u, res.token);
        setSuccess('Welcome back, ' + u.name + '!');
        setTimeout(() => {
          if (u.role === 'admin') nav('/admin');
          else nav(redirectTo);
        }, 500);
        return;
      }

      // 2. Offline fallback (only if server network was completely unreachable)
      if (networkFailed) {
        const localUsers: Array<{ name: string; email: string; phone: string; password: string; role?: string }> =
          JSON.parse(localStorage.getItem('sastika_registered_users_v1') || '[]');

        const normalizedInput = email.trim().toLowerCase();
        const cleanPhone = normalizedInput.replace(/\D/g, '').slice(-10);

        const matched = localUsers.find(
          (u) =>
            u.email.toLowerCase() === normalizedInput ||
            (cleanPhone.length >= 10 && u.phone && u.phone.replace(/\D/g, '').endsWith(cleanPhone))
        );

        if (matched) {
          // STRICT password check - wrong password MUST NOT open the page
          if (matched.password === password) {
            const u: AuthUser = {
              id: 'u_' + matched.email.replace(/[^a-z0-9]/gi, ''),
              name: matched.name,
              email: matched.email,
              phone: matched.phone,
              role: (matched.role as any) || 'customer',
            };
            loginUser(u);
            setSuccess('Welcome back, ' + u.name + '!');
            setTimeout(() => {
              if (u.role === 'admin') nav('/admin');
              else nav(redirectTo);
            }, 500);
            return;
          } else {
            setError('Incorrect password. Please try again.');
            return;
          }
        } else {
          setError('No account found with this email or mobile number. Please register first.');
          return;
        }
      }

      setError('Login failed. Please check your credentials.');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regName.trim()) return setError('Please enter your full name.');
    if (!regEmail.trim() || !regEmail.includes('@')) return setError('Please enter a valid email address.');
    if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 10) return setError('Please enter a valid 10-digit mobile number.');
    if (regPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (regPassword !== regConfirmPassword) return setError('Passwords do not match.');
    setError('');
    setLoading(true);

    const formattedPhone = '+91 ' + regPhone.replace(/\D/g, '').slice(-10);

    try {
      let res: any = null;
      try {
        res = await api.register({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          phone: formattedPhone,
          role: 'customer',
        });
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('already') || msg.includes('400')) {
          setError(msg || 'An account with this email or phone already exists.');
          setLoading(false);
          return;
        }
      }

      // Sync into client-side cache
      const localUsers: Array<{ name: string; email: string; phone: string; password: string; role?: string }> =
        JSON.parse(localStorage.getItem('sastika_registered_users_v1') || '[]');
      const filtered = localUsers.filter((u) => u.email.toLowerCase() !== regEmail.trim().toLowerCase());
      filtered.push({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: formattedPhone,
        password: regPassword,
        role: 'customer',
      });
      localStorage.setItem('sastika_registered_users_v1', JSON.stringify(filtered));

      const newUser: AuthUser = {
        id: res?.user?.id || res?.user?._id || 'u_' + Date.now().toString(36),
        name: regName.trim(),
        email: regEmail.trim(),
        phone: formattedPhone,
        role: 'customer',
      };

      loginUser(newUser, res?.token);
      setSuccess('Account created successfully! Welcome to Sastika Mobiles.');
      setTimeout(() => nav(redirectTo), 600);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 14px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 410,
          background: '#fff',
          borderRadius: 20,
          border: `1.5px solid ${C.border}`,
          boxShadow: '0 8px 30px rgba(11,74,67,0.1)',
          overflow: 'hidden',
          animation: 'fadeUp .3s ease both',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
            color: '#fff',
            padding: '16px 20px 14px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            onClick={() => nav('/')}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#fff',
              margin: '0 auto 6px',
              display: 'grid',
              placeItems: 'center',
              border: '2px solid #d4af37',
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <img src={logo || logoImg} alt="Sastika Mobiles" style={{ width: 36, height: 36, objectFit: 'cover' }} />
          </div>

          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, color: C.accent, marginBottom: 2 }}>
            SASTIKA MOBILES • SIVAKASI
          </div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: -0.3 }}>
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: 11.5, opacity: 0.85 }}>
            {mode === 'signin'
              ? 'Sign in to track orders, repair tickets & saved wishlist'
              : 'Join Sastika Mobiles for instant GST billing & doorstep repair'}
          </p>
        </div>

        <div style={{ padding: '16px 18px 16px' }}>
          {error && (
            <div
              style={{
                marginBottom: 10,
                padding: '8px 12px',
                borderRadius: 10,
                background: C.dangerSoft,
                color: C.danger,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                animation: 'fadeUp .2s ease',
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: 10,
                padding: '8px 12px',
                borderRadius: 10,
                background: C.successSoft,
                color: C.success,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                animation: 'fadeUp .2s ease',
              }}
            >
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* ==================== SIGN IN FORM ==================== */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'grid', gap: 10 }}>
              <CompactField label="Email Address or Mobile Number" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
                    <Icon name="mail" size={15} />
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com or 9840123456"
                    style={{ ...compactInput, paddingLeft: 36 }}
                    autoComplete="username"
                    required
                  />
                </div>
              </CompactField>

              <CompactField label="Password" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
                    <Icon name="lock" size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ ...compactInput, paddingLeft: 36, paddingRight: 36 }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: C.muted,
                      cursor: 'pointer',
                      padding: 2,
                    }}
                    aria-label="Toggle password visibility"
                  >
                    <Icon name="eye" size={15} />
                  </button>
                </div>
              </CompactField>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: C.text }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: C.primary }} />
                  <span>Remember me</span>
                </label>
                <a
                  href="tel:+919543434344"
                  style={{ color: C.primary, fontWeight: 700, textDecoration: 'none' }}
                >
                  Forgot password?
                </a>
              </div>

              <Btn full disabled={loading} style={{ padding: '10px 14px', fontSize: 13.5, borderRadius: 10, marginTop: 2 }}>
                {loading ? 'Signing In...' : 'Sign In to Account →'}
              </Btn>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 12.5,
                  color: C.muted,
                }}
              >
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: C.primary,
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 12.5,
                    textDecoration: 'underline',
                  }}
                >
                  Sign Up
                </button>
              </div>
            </form>
          ) : (
            /* ==================== REGISTER FORM ==================== */
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: 9 }}>
              <CompactField label="Your Full Name" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
                    <Icon name="user" size={15} />
                  </span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    style={{ ...compactInput, paddingLeft: 36 }}
                    required
                  />
                </div>
              </CompactField>

              <CompactField label="Mobile Number" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
                    <Icon name="phone" size={15} />
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number (e.g. 9840123456)"
                    style={{ ...compactInput, paddingLeft: 36 }}
                    required
                  />
                </div>
              </CompactField>

              <CompactField label="Email Address" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
                    <Icon name="mail" size={15} />
                  </span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{ ...compactInput, paddingLeft: 36 }}
                    required
                  />
                </div>
              </CompactField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <CompactField label="Password" required>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    style={compactInput}
                    required
                  />
                </CompactField>
                <CompactField label="Confirm" required>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter"
                    style={compactInput}
                    required
                  />
                </CompactField>
              </div>

              <Btn full disabled={loading} style={{ padding: '10px 14px', fontSize: 13.5, borderRadius: 10, marginTop: 2 }}>
                {loading ? 'Creating Account...' : 'Complete Registration →'}
              </Btn>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 12.5,
                  color: C.muted,
                }}
              >
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: C.primary,
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 12.5,
                    textDecoration: 'underline',
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* Already logged in indicator */}
          {user && (
            <div
              style={{
                marginTop: 10,
                padding: '7px 10px',
                borderRadius: 10,
                background: C.tint2,
                border: `1px solid ${C.border}`,
                fontSize: 11.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Active as: <b>{user.name}</b></span>
              <button
                type="button"
                onClick={() => nav('/orders')}
                style={{ color: C.primary, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', fontSize: 11.5 }}
              >
                Orders →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
