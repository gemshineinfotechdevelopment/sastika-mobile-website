import { useEffect, useState } from 'react';
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function GoogleButton({
  onClick,
  loading,
  label = 'Continue with Google',
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        border: '1.5px solid #d1d5db',
        background: '#ffffff',
        color: '#1f2937',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        transition: 'all .2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#4285F4';
        e.currentTarget.style.boxShadow = '0 3px 10px rgba(66,133,244,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
      }}
    >
      <GoogleIcon />
      <span>{label}</span>
    </button>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, loginUser, logo } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: '',
  });

  const redirectTo = params.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') nav('/admin', { replace: true });
      else nav(redirectTo, { replace: true });
    }
  }, [user, redirectTo, nav]);

  // Handle Google OAuth callback redirect from backend
  useEffect(() => {
    const gToken = params.get('googleToken');
    const userJson = params.get('user');
    const oauthErr = params.get('error');

    if (oauthErr) {
      setError(`Google Sign-In notice: ${decodeURIComponent(oauthErr)}`);
    }

    if (gToken && userJson) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userJson));
        const u: AuthUser = {
          id: parsedUser.id || 'u_' + Date.now(),
          name: parsedUser.name || 'Google User',
          email: parsedUser.email,
          role: parsedUser.role || 'customer',
          phone: parsedUser.phone || '',
          avatar: parsedUser.avatar || '',
        };
        loginUser(u, gToken);
        setSuccess(`Signed in successfully with Google as ${u.name}!`);
        setTimeout(() => {
          if (u.role === 'admin') nav('/admin', { replace: true });
          else nav(redirectTo, { replace: true });
        }, 500);
      } catch (e) {
        console.error('Failed parsing Google auth callback:', e);
      }
    }
  }, [params, nav, redirectTo, loginUser]);

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Ask backend for configured Google OAuth URL
      const res = await api.getGoogleAuthUrl().catch(() => null);
      if (res && res.configured && res.url) {
        window.location.href = res.url;
        return;
      }

      // 2. Direct client Google OAuth URL fallback
      const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';
      if (!clientId || clientId.includes('your_google_client_id')) {
        setShowGoogleSetupModal(true);
        return;
      }

      const isLiveDomain = window.location.hostname.includes('gemshine.tech');
      const redirectUri = isLiveDomain
        ? 'https://sastika-mobiles.gemshine.tech/api/auth/google/callback'
        : `${window.location.origin}/api/auth/google/callback`;

      const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const qs = new URLSearchParams({
        client_id: clientId.trim(),
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
      }).toString();
      window.location.href = `${rootUrl}?${qs}`;
    } catch (err: any) {
      setError(err?.message || 'Failed to start Google sign in');
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    setLoading(true);
    setShowGoogleSetupModal(false);
    try {
      const demoUser: AuthUser = {
        id: 'u_google_' + Date.now().toString(36),
        name: 'Google Customer',
        email: 'customer.google@gmail.com',
        role: 'customer',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      };
      await api
        .register({
          name: demoUser.name,
          email: demoUser.email,
          password: 'google_oauth_mock_password',
          role: 'customer',
        })
        .catch(() => {});

      loginUser(demoUser);
      setSuccess('Signed in with Google Account (customer.google@gmail.com)!');
      setTimeout(() => {
        nav(redirectTo, { replace: true });
      }, 400);
    } catch (e: any) {
      setError(e?.message || 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      const msg = 'Please enter your email address or mobile number.';
      setError(msg);
      setAlertModal({
        open: true,
        title: 'Input Required',
        message: msg,
      });
      return;
    }
    if (!password.trim()) {
      const msg = 'Please enter your account password.';
      setError(msg);
      setAlertModal({
        open: true,
        title: 'Password Required',
        message: msg,
      });
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with backend API
      let res: any = null;
      let backendErrorMsg: string | null = null;
      try {
        res = await api.login({ email: cleanEmail, password });
      } catch (err: any) {
        backendErrorMsg = err?.message || 'Login failed';
      }

      // If backend returned authenticated user
      if (res && res.user) {
        const u: AuthUser = {
          id: res.user.id || res.user._id || 'u_' + Date.now(),
          name: res.user.name || 'Sastika Member',
          email: res.user.email || cleanEmail,
          role: res.user.role || (cleanEmail.toLowerCase().includes('admin') ? 'admin' : 'customer'),
          phone: res.user.phone || '',
        };
        loginUser(u, res.token);
        setSuccess('Welcome back, ' + u.name + '!');
        setTimeout(() => {
          if (u.role === 'admin') nav('/admin', { replace: true });
          else nav(redirectTo, { replace: true });
        }, 350);
        return;
      }

      // 2. Check local registered users cache (offline / client fallback)
      const localUsers: Array<{ name: string; email: string; phone: string; password: string; role?: string }> =
        JSON.parse(localStorage.getItem('sastika_registered_users_v1') || '[]');

      const normalizedInput = cleanEmail.toLowerCase();
      const cleanPhone = normalizedInput.replace(/\D/g, '').slice(-10);

      const matchedLocal = localUsers.find(
        (u) =>
          u.email.toLowerCase() === normalizedInput ||
          (cleanPhone.length >= 10 && u.phone && u.phone.replace(/\D/g, '').endsWith(cleanPhone))
      );

      if (matchedLocal) {
        if (matchedLocal.password === password) {
          const u: AuthUser = {
            id: 'u_' + matchedLocal.email.replace(/[^a-z0-9]/gi, ''),
            name: matchedLocal.name,
            email: matchedLocal.email,
            phone: matchedLocal.phone,
            role: (matchedLocal.role as any) || 'customer',
          };
          loginUser(u);
          setSuccess('Welcome back, ' + u.name + '!');
          setTimeout(() => {
            if (u.role === 'admin') nav('/admin', { replace: true });
            else nav(redirectTo, { replace: true });
          }, 350);
          return;
        } else {
          const wrongPwdMsg = 'Incorrect password. Please verify your password and try again.';
          setError(wrongPwdMsg);
          setAlertModal({
            open: true,
            title: 'Incorrect Password',
            message: wrongPwdMsg,
          });
          return;
        }
      }

      // 3. User is NOT authenticated (wrong email or wrong password)
      // Display alert popup modal and inline error banner
      const failMsg = backendErrorMsg || 'Incorrect email ID or password. Please verify your credentials and try again.';
      setError(failMsg);
      setAlertModal({
        open: true,
        title: 'Wrong Email or Password',
        message: failMsg,
      });
    } catch (err: any) {
      const generalErr = err?.message || 'Login failed. Please check your credentials.';
      setError(generalErr);
      setAlertModal({
        open: true,
        title: 'Sign In Failed',
        message: generalErr,
      });
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
            {redirectTo.includes('checkout') ? 'Sign In to Checkout' : 'Sign In to Account'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: 11.5, opacity: 0.85 }}>
            {redirectTo.includes('checkout')
              ? 'Complete sign-in to proceed with your order'
              : 'Sign in to track orders, repair tickets & saved wishlist'}
          </p>
        </div>

        <div style={{ padding: '16px 18px 16px' }}>
          {/* Checkout Notification Banner */}
          {redirectTo.includes('checkout') && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 14px',
                borderRadius: 12,
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                color: '#92400e',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>🛒</span>
              <span>
                <strong>Checkout requires sign-in:</strong> Please sign in with your email or Google account to complete your order.
              </span>
            </div>
          )}

          {/* General sign-in required notice */}
          {params.get('notice') && !redirectTo.includes('checkout') && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 14px',
                borderRadius: 12,
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                color: '#1e40af',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>🔒</span>
              <span>
                <strong>Sign in required:</strong> {params.get('notice')}
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: '9px 12px',
                borderRadius: 10,
                background: C.dangerSoft,
                color: C.danger,
                fontSize: 12.5,
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
                marginBottom: 12,
                padding: '9px 12px',
                borderRadius: 10,
                background: C.successSoft,
                color: C.success,
                fontSize: 12.5,
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
          <form onSubmit={handleSignIn} style={{ display: 'grid', gap: 11 }}>
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

              {/* OR Divider & Google Login Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  margin: '8px 0 4px',
                  color: C.muted,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                }}
              >
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span>OR SIGN IN WITH</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              <GoogleButton onClick={handleGoogleAuth} loading={loading} label="Continue with Google Mail" />

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 12,
                  color: C.muted,
                  lineHeight: 1.5,
                }}
              >
                Instant access with <strong>Continue with Google Mail</strong> above.
              </div>
            </form>

            {/* ==================== POPUP ALERT MODAL FOR WRONG CREDENTIALS ==================== */}
            {alertModal.open && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10000,
                  background: 'rgba(6, 42, 37, 0.65)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  animation: 'fadeIn .2s ease',
                }}
                onClick={() => setAlertModal({ ...alertModal, open: false })}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    maxWidth: 380,
                    background: '#ffffff',
                    borderRadius: 20,
                    padding: '24px 22px 20px',
                    boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
                    border: '2px solid #fee2e2',
                    textAlign: 'center',
                    animation: 'pop .25s cubic-bezier(.2,.8,.2,1)',
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background: '#fef2f2',
                      border: '2px solid #fecaca',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 14px',
                      color: '#dc2626',
                      fontSize: 26,
                      boxShadow: '0 4px 14px rgba(220,38,38,0.15)',
                    }}
                  >
                    ⚠️
                  </div>

                  <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 900, color: '#111827' }}>
                    {alertModal.title || 'Wrong Email ID or Password'}
                  </h3>

                  <p style={{ margin: '0 0 20px', fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>
                    {alertModal.message}
                  </p>

                  <button
                    type="button"
                    onClick={() => setAlertModal({ ...alertModal, open: false })}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: 12,
                      background: '#dc2626',
                      color: '#ffffff',
                      fontSize: 13.5,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
                      transition: 'transform .15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
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
          {/* Google OAuth Setup Guidance Modal */}
          {showGoogleSetupModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(3px)',
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
                  borderRadius: 16,
                  padding: '20px 22px',
                  maxWidth: 460,
                  width: '100%',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                  border: `1.5px solid ${C.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GoogleIcon />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: C.text }}>
                      Google OAuth Setup
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSetupModal(false)}
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
                    padding: '10px 12px',
                    fontSize: 12,
                    color: '#1e40af',
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}
                >
                  <b>Ready for your credentials!</b> Backend Google OAuth routes are fully created and active. To connect your live Google account, add your credentials in <code>server/.env</code>:
                </div>

                <div
                  style={{
                    background: '#1e293b',
                    color: '#e2e8f0',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontFamily: 'monospace',
                    marginBottom: 12,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
{`# In server/.env:
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback`}
                </div>

                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>
                  <b>Redirect URIs to whitelist in Google Console:</b>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.text, marginTop: 4 }}>
                    • http://localhost:5000/api/auth/google/callback<br />
                    • https://sastika-mobiles.gemshine.tech/api/auth/google/callback
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleDemoGoogleLogin}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      background: C.primary,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Quick Test with Demo Google ID →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSetupModal(false)}
                    style={{
                      padding: '9px 14px',
                      background: C.tint2,
                      color: C.text,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
