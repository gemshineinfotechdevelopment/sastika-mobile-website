import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C } from '../theme';
import { useStore } from '../store';
import { api } from '../api';
import type { AuthUser } from '../types';
import logoImg from '../assets/logo.png';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
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
        gap: 12,
        padding: '13px 18px',
        borderRadius: 12,
        border: '1.5px solid #d1d5db',
        background: '#ffffff',
        color: '#1f2937',
        fontSize: 14.5,
        fontWeight: 800,
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
        transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: loading ? 0.75 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.borderColor = '#4285F4';
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(66,133,244,0.18)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <GoogleIcon />
      <span>{loading ? 'Connecting to Google...' : label}</span>
    </button>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, loginUser, logo } = useStore();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);

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
        setLoading(false);
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

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px 40px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 22,
          border: `1.5px solid ${C.border}`,
          boxShadow: '0 12px 40px rgba(11,74,67,0.1)',
          overflow: 'hidden',
          animation: 'fadeUp .3s ease both',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
            color: '#fff',
            padding: '22px 22px 18px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            onClick={() => nav('/')}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#fff',
              margin: '0 auto 8px',
              display: 'grid',
              placeItems: 'center',
              border: '2px solid #d4af37',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <img src={logo || logoImg} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = logoImg; }} alt="Sastikaa Mobiles" style={{ width: 42, height: 42, objectFit: 'cover' }} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.accent, marginBottom: 3 }}>
            SASTIKAA MOBILES • SIVAKASI
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: -0.3 }}>
            {redirectTo.includes('checkout') ? 'Sign In to Checkout' : 'Customer Sign In'}
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 12.5, opacity: 0.9, lineHeight: 1.4 }}>
            {redirectTo.includes('checkout')
              ? 'Sign in with Google to complete your order quickly & securely'
              : 'Sign in with your Google account for 1-click access'}
          </p>
        </div>

        <div style={{ padding: '22px 20px 20px' }}>
          {/* Checkout Notification Banner */}
          {redirectTo.includes('checkout') && (
            <div
              style={{
                marginBottom: 16,
                padding: '11px 14px',
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
                <strong>Checkout requires sign-in:</strong> Please continue with Google to place your order.
              </span>
            </div>
          )}

          {/* General sign-in required notice */}
          {params.get('notice') && !redirectTo.includes('checkout') && (
            <div
              style={{
                marginBottom: 16,
                padding: '11px 14px',
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
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 11,
                background: C.dangerSoft,
                color: C.danger,
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                animation: 'fadeUp .2s ease',
              }}
            >
              <span>⚠️</span>
              <span style={{ lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 11,
                background: C.successSoft,
                color: C.success,
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                animation: 'fadeUp .2s ease',
              }}
            >
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* ==================== 1-CLICK GOOGLE SIGN IN ==================== */}
          <div style={{ display: 'grid', gap: 14 }}>
            <GoogleButton onClick={handleGoogleAuth} loading={loading} label="Continue with Google" />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 11.5,
                color: C.muted,
                fontWeight: 600,
              }}
            >
              <span>⚡</span>
              <span>One-click instant login — No password needed</span>
            </div>
          </div>

          {/* Account Perks Card */}
          <div
            style={{
              marginTop: 20,
              padding: '14px 15px',
              borderRadius: 14,
              background: '#f8fafc',
              border: `1px solid ${C.border}`,
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: C.muted, textTransform: 'uppercase' }}>
              Why Sign In with Google?
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: C.text }}>
              <span style={{ fontSize: 15 }}>📦</span>
              <span><strong>Live Order Tracking</strong> — Track orders & download invoices</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: C.text }}>
              <span style={{ fontSize: 15 }}>🔧</span>
              <span><strong>Repair Service Desk</strong> — Track real-time phone repair status</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: C.text }}>
              <span style={{ fontSize: 15 }}>🛡️</span>
              <span><strong>Fast & Safe</strong> — Secured by Google credentials</span>
            </div>
          </div>

          {/* Already logged in indicator */}
          {user && (
            <div
              style={{
                marginTop: 14,
                padding: '9px 12px',
                borderRadius: 10,
                background: C.tint2,
                border: `1px solid ${C.border}`,
                fontSize: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Active as: <b>{user.name}</b></span>
              <button
                type="button"
                onClick={() => nav('/orders')}
                style={{ color: C.primary, fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12 }}
              >
                My Account →
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
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
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
                  padding: '22px 24px',
                  maxWidth: 480,
                  width: '100%',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                  border: `1.5px solid ${C.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GoogleIcon />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: C.text }}>
                      Google Sign-In Setup
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
                    padding: '11px 13px',
                    fontSize: 12.5,
                    color: '#1e40af',
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}
                >
                  <b>Connect your Google OAuth credentials</b> in your server environment (<code>server/.env</code>) or test immediately with a mock Google session below.
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
GOOGLE_CLIENT_ID=563616633952-9gql725sk9tijanfpbciqh0v3a2tav3e.apps.googleusercontent.com
GOOGLE_REDIRECT_URI=https://sastika-mobiles.gemshine.tech/api/auth/google/callback`}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={handleDemoGoogleLogin}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Test with Demo Google ID →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSetupModal(false)}
                    style={{
                      padding: '10px 16px',
                      background: C.tint2,
                      color: C.text,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      fontSize: 13,
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
