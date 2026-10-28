import { useEffect, useState } from 'react';
import { C } from '../theme';
import Icon from '../components/Icon';
import { AButton, FieldRow, PageTitle, Tag, Toggle, field, panel } from './ui';
import defaultLogo from '../assets/logo.png';
import { api } from '../api';

interface Cfg {
  business: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  gstOn: boolean;
  lowStockAlerts: boolean;
  autoInvoice: boolean;
  smsUpdates: boolean;
  codOn: boolean;
  codFee: string;
  upiOn: boolean;
  freeShipAbove: string;
  // Personnel Directory
  managerName: string;
  managerPhone: string;
  salesRepName: string;
  salesRepPhone: string;
  // Admin Credentials
  adminUsername: string;
  adminPassword: string;
}

const DEFAULT: Cfg = {
  business: 'Sastikaa Mobiles',
  gstin: '33BQTPJ5275L1Z6',
  email: 'sastikaamobiles.svk@gmail.com',
  phone: '+91 95434 34344',
  address: 'Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189',
  currency: 'INR (₹)',
  gstOn: true,
  lowStockAlerts: true,
  autoInvoice: true,
  smsUpdates: true,
  codOn: true,
  codFee: '50',
  upiOn: true,
  freeShipAbove: '0',
  // Store Personnel Defaults
  managerName: '',
  managerPhone: '',
  salesRepName: '',
  salesRepPhone: '',
  // Admin Credentials Defaults
  adminUsername: 'admin@sastikaamobiles.com',
  adminPassword: 'admin123',
};

export default function Settings() {
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [cfg, setCfg] = useState<Cfg>(() => {
    try {
      const raw = localStorage.getItem('sastika:settings');
      if (!raw) return DEFAULT;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT,
        ...parsed,
        business: parsed.business && !parsed.business.includes('சஷ்டிகா') ? parsed.business : DEFAULT.business,
        address: parsed.address || parsed.addressBranch1 || DEFAULT.address,
      };
    } catch {
      return DEFAULT;
    }
  });

  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Fetch settings from backend database on mount
  useEffect(() => {
    api
      .getSettings()
      .then((res) => {
        if (res && res.success && res.data) {
          setCfg((prev) => {
            const merged: Cfg = {
              ...prev,
              ...res.data,
              codFee: res.data.codFee !== undefined ? String(res.data.codFee) : prev.codFee,
              managerName: res.data.managerName || prev.managerName,
              managerPhone: res.data.managerPhone || prev.managerPhone,
              salesRepName: res.data.salesRepName || prev.salesRepName,
              salesRepPhone: res.data.salesRepPhone || prev.salesRepPhone,
              adminUsername: res.data.adminUsername || prev.adminUsername,
              adminPassword: res.data.adminPassword || prev.adminPassword,
            };
            localStorage.setItem('sastika:settings', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2400);
    return () => window.clearTimeout(t);
  }, [saved]);

  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => {
    setCfg((c) => {
      const next = { ...c, [k]: v };
      try {
        localStorage.setItem('sastika:settings', JSON.stringify(next));
        window.dispatchEvent(new Event('sastika:settings_changed'));
      } catch {
        /* ignore */
      }
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    try {
      localStorage.setItem('sastika:settings', JSON.stringify(cfg));
      window.dispatchEvent(new Event('sastika:settings_changed'));

      // Persist to backend database so all customer devices receive updated settings
      await api
        .updateSettings({
          ...cfg,
          codFee: Number(cfg.codFee) || 0,
        })
        .catch(() => {});
    } catch {
      /* ignore */
    }
    setSaved(true);
    setDirty(false);
  };

  // Only keep requested switches (removed GST Tax Engine, Automated Invoicing, UPI Payments as circled by user)
  const switches: { k: keyof Cfg; t: string; s: string }[] = [
    { k: 'lowStockAlerts', t: 'Low-Stock Alerts', s: 'Notify managers when inventory drops below reorder threshold' },
    { k: 'codOn', t: 'Cash on Delivery / In-Store Pickup', s: 'Allow payment upon delivery or during store pickup' },
  ];

  return (
    <div>
      <PageTitle
        title="Enterprise Retail Settings"
        sub="Configure shop details, store personnel contacts, admin credentials, and checkout controls."
        actions={
          <AButton onClick={save} disabled={!dirty && !saved} style={{ minWidth: 160 }}>
            {saved ? '✓ Saved Successfully' : 'Save Configuration'}
          </AButton>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Row 1: Brand Logo & Tax Invoice Profile Card */}
        <div className="admin-split-grid" style={{ alignItems: 'stretch' }}>
          {/* Brand Logo & Identity */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .05s both', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Brand Logo &amp; Identity</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                  Official store logo permanently configured for Sastikaa Mobiles.
                </div>
              </div>
              <Tag tone="green">Static Logo</Tag>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '8px 0 4px' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    border: '2.5px solid #d4af37',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    margin: '0 auto 6px',
                    overflow: 'hidden',
                  }}
                >
                  <img src={defaultLogo} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultLogo; }} alt="Sastikaa Mobiles" style={{ width: 58, height: 58, objectFit: 'cover' }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.primaryDark }}>Current Icon</div>
              </div>

              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: '#4b5563' }}>
                Golden Peacock emblem with <b>SASTIKAA MOBILES</b> Sivakasi hallmark. Automatically applied across storefront, invoices, and mobile navigation.
              </div>
            </div>
          </div>

          {/* Quick Invoice Card */}
          <div
            style={{
              ...panel,
              animation: 'fadeUp .5s ease .08s both',
              background: 'linear-gradient(135deg, #fff 0%, #fdfbf7 100%)',
              border: '1.5px solid #ecd8a5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#f6c445',
                  color: C.primaryDark,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: 14,
                }}
              >
                SM
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>
                  {cfg.business || 'Sastikaa Mobiles'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#b8860b' }}>
                  Sales &bull; Service &bull; TAX INVOICE PROFILE
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12.5, lineHeight: 1.65, color: '#555' }}>
              <div style={{ marginBottom: 5 }}>
                <strong>GSTIN:</strong>{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: C.primary }}>
                  {cfg.gstin || '33BQTPJ5275L1Z6'}
                </span>
              </div>
              <div style={{ marginBottom: 5 }}>
                <strong>Store Address:</strong> {cfg.address || 'Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189'}
              </div>
              <div>
                <strong>Contact Phone:</strong> {cfg.phone || '+91 98765 43210'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Store Details & Tax Profile */}
        <div style={{ ...panel, animation: 'fadeUp .5s ease .1s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Store Details &amp; Tax Profile</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                Official store credentials and business information from Sastikaa Mobiles Tax Invoice (Sithurajapuram, Sivakasi)
              </div>
            </div>
            <Tag tone="amber">GST Registered</Tag>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <FieldRow label="BUSINESS / STORE NAME">
              <input
                style={field}
                value={cfg.business}
                onChange={(e) => set('business', e.target.value)}
                placeholder="Sastikaa Mobiles"
              />
            </FieldRow>

            <FieldRow label="REGISTERED GSTIN">
              <input
                style={{ ...field, fontWeight: 700, letterSpacing: 0.8 }}
                value={cfg.gstin}
                onChange={(e) => set('gstin', e.target.value)}
                placeholder="33BQTPJ5275L1Z6"
              />
            </FieldRow>

            <FieldRow label="SUPPORT EMAIL">
              <input
                style={field}
                type="email"
                value={cfg.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="sastikaamobiles.svk@gmail.com"
              />
            </FieldRow>

            <FieldRow label="STORE HELPLINE PHONE">
              <input
                style={field}
                value={cfg.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 95434 34344"
              />
            </FieldRow>

            <FieldRow label="STORE CURRENCY">
              <input style={{ ...field, background: C.tint2 }} value={cfg.currency} readOnly />
            </FieldRow>

            <FieldRow label="FREE SHIPPING ABOVE (₹)">
              <input
                style={field}
                type="number"
                min={0}
                value={cfg.freeShipAbove}
                onChange={(e) => set('freeShipAbove', e.target.value)}
              />
            </FieldRow>

            <div style={{ gridColumn: '1 / -1' }}>
              <FieldRow label="STORE ADDRESS">
                <input
                  style={field}
                  value={cfg.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189"
                />
              </FieldRow>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: STORE PERSONNEL & CONTACT DIRECTORY (FOR WEBSITE /contact PAGE)    */}
        {/* ========================================================================= */}
        <div style={{ ...panel, animation: 'fadeUp .5s ease .12s both', border: '1.5px solid #bfdbfe', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>👥</span>
                <span>Store Personnel &amp; Direct Contact Directory</span>
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
                Enter the Store Manager and Sales Representative details. Changes made here automatically update on the customer website's <b>Stores &amp; Contact</b> page (<code>/#/contact</code>).
              </div>
            </div>
            <Tag tone="green">Live On Website</Tag>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Store Manager Section */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👔</span>
                <span>Store Manager Details</span>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <FieldRow label="STORE MANAGER NAME">
                  <input
                    style={field}
                    value={cfg.managerName}
                    onChange={(e) => set('managerName', e.target.value)}
                    placeholder="S. Ramanathan"
                  />
                </FieldRow>

                <FieldRow label="STORE MANAGER MOBILE (CALL & WHATSAPP)">
                  <input
                    style={field}
                    value={cfg.managerPhone}
                    onChange={(e) => set('managerPhone', e.target.value)}
                    placeholder="+91 95434 34344"
                  />
                </FieldRow>
              </div>
            </div>

            {/* Sales Representative Section */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0891b2', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>💼</span>
                <span>Sales Representative Details</span>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <FieldRow label="SALES REP NAME">
                  <input
                    style={field}
                    value={cfg.salesRepName}
                    onChange={(e) => set('salesRepName', e.target.value)}
                    placeholder="M. Karthi"
                  />
                </FieldRow>

                <FieldRow label="SALES REP MOBILE (CALL & WHATSAPP)">
                  <input
                    style={field}
                    value={cfg.salesRepPhone}
                    onChange={(e) => set('salesRepPhone', e.target.value)}
                    placeholder="+91 98401 23456"
                  />
                </FieldRow>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 4: ADMIN LOGIN & SECURITY CREDENTIALS                                 */}
        {/* ========================================================================= */}
        <div style={{ ...panel, animation: 'fadeUp .5s ease .14s both', border: '1.5px solid #fed7aa', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔐</span>
                <span>Admin Login &amp; Security Credentials</span>
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
                Change your administrator username / email and login password used to access the <b>Sastikaa Admin Portal</b> (<code>/#/admin/login</code>).
              </div>
            </div>
            <Tag tone="amber">Admin Security</Tag>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <FieldRow label="ADMIN USERNAME / EMAIL">
              <input
                style={field}
                value={cfg.adminUsername}
                onChange={(e) => set('adminUsername', e.target.value)}
                placeholder="admin@sastikaamobiles.com"
                autoComplete="username"
              />
            </FieldRow>

            <FieldRow label="ADMIN PASSWORD">
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...field, paddingRight: 40 }}
                  type={showAdminPass ? 'text' : 'password'}
                  value={cfg.adminPassword}
                  onChange={(e) => set('adminPassword', e.target.value)}
                  placeholder="Enter new admin password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: C.muted,
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 4,
                  }}
                  title={showAdminPass ? 'Hide password' : 'Show password'}
                >
                  <Icon name="eye" size={16} />
                </button>
              </div>
            </FieldRow>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              fontSize: 12,
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>ℹ️</span>
            <span>
              After saving, use these updated credentials to sign into the Admin Portal at <code>/#/admin/login</code>.
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 5: AUTOMATION & PAYMENTS (WITH COD EXTRA AMOUNT & LOW STOCK)          */}
        {/* ========================================================================= */}
        <div style={{ ...panel, animation: 'fadeUp .5s ease .16s both' }}>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>Automation &amp; Payments</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '0 24px' }}>
            {switches.map((s) => (
              <div
                key={s.k}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.s}</div>
                </div>
                <Toggle on={cfg[s.k] as boolean} onChange={(v) => set(s.k, v as Cfg[typeof s.k])} />
              </div>
            ))}

            {/* Cash on Delivery Extra Fee Configuration Card */}
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: 14,
                padding: '16px 20px',
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>💵</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
                    Cash on Delivery (COD) Extra Amount (₹)
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 1.45 }}>
                  Enter the extra fee to charge when a customer selects Cash on Delivery at checkout. This amount is automatically displayed and added to the user's total payment.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.primary }}>₹</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  style={{
                    ...field,
                    width: 130,
                    fontSize: 16,
                    fontWeight: 800,
                    textAlign: 'center',
                    background: '#fff',
                    border: `2px solid ${C.primary}`,
                    borderRadius: 10,
                    padding: '9px 12px',
                    color: C.primaryDark,
                  }}
                  value={cfg.codFee}
                  onChange={(e) => set('codFee', e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
