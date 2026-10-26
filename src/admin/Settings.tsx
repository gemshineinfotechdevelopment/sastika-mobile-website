import { useEffect, useState } from 'react';
import { C } from '../theme';
import Icon from '../components/Icon';
import { AButton, FieldRow, PageTitle, Tag, Toggle, field, panel } from './ui';
import defaultLogo from '../assets/logo.png';

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
  upiOn: boolean;
  freeShipAbove: string;
}

const DEFAULT: Cfg = {
  business: 'Sastika Mobiles',
  gstin: '33BQTPJ5275L1Z6',
  email: 'sastikamobiles.svk@gmail.com',
  phone: '+91 98765 43210',
  address: 'Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189',
  currency: 'INR (₹)',
  gstOn: true,
  lowStockAlerts: true,
  autoInvoice: true,
  smsUpdates: true,
  codOn: true,
  upiOn: true,
  freeShipAbove: '0',
};

export default function Settings() {
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

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2200);
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

  const save = () => {
    try {
      localStorage.setItem('sastika:settings', JSON.stringify(cfg));
      window.dispatchEvent(new Event('sastika:settings_changed'));
    } catch {
      /* ignore */
    }
    setSaved(true);
    setDirty(false);
  };

  const reset = () => {
    if (window.confirm('Reset all demo data (products, orders, tickets, settings) to defaults?')) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sastika:'))
        .forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const switches: { k: keyof Cfg; t: string; s: string }[] = [
    { k: 'gstOn', t: 'GST Tax Engine', s: 'Include GSTIN 33BQTPJ5275L1Z6 breakdown on all invoices' },
    { k: 'autoInvoice', t: 'Automated Invoicing', s: 'Generate and email tax bill automatically on order dispatch' },
    { k: 'lowStockAlerts', t: 'Low-Stock Alerts', s: 'Notify managers when inventory drops below reorder threshold' },
    { k: 'upiOn', t: 'UPI Payments (GPay, PhonePe, Paytm)', s: 'Accept instant zero-fee UPI payments at checkout' },
    { k: 'codOn', t: 'Cash on Delivery / In-Store Pickup', s: 'Allow payment upon delivery or during store pickup' },
  ];

  return (
    <div>
      <PageTitle
        title="Enterprise Retail Settings"
        sub="Configure shop details, GSTIN tax credentials, store address, and retail controls."
        actions={
          <>
            <AButton variant="danger" onClick={reset}>
              Reset Demo Data
            </AButton>
            <AButton onClick={save} disabled={!dirty && !saved}>
              {saved ? '✓ Saved' : 'Save Configuration'}
            </AButton>
          </>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Row 1: Brand Logo & Tax Invoice Profile Card */}
        <div className="admin-split-grid" style={{ alignItems: 'stretch' }}>
          {/* Brand Logo & Identity (Text Removed) */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .05s both', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Brand Logo &amp; Identity</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                  Official store logo permanently configured for Sastika Mobiles.
                </div>
              </div>
              <Tag tone="green">Static Logo</Tag>
            </div>

            <div style={{ display: 'flex', gap: 28, alignItems: 'center', padding: '8px 0 4px' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '2.5px solid #d4af37',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    margin: '0 auto 6px',
                  }}
                >
                  <img
                    src={defaultLogo}
                    alt="Official Logo Light"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: C.muted }}>Light Mode</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: C.primary,
                    border: '2.5px solid #d4af37',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    margin: '0 auto 6px',
                  }}
                >
                  <img
                    src={defaultLogo}
                    alt="Official Logo Dark"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: C.muted }}>Dark / Admin</div>
              </div>
            </div>
          </div>

          {/* Tax Invoice Info Badge */}
          <div
            style={{
              ...panel,
              background: '#fffdf6',
              border: '1.5px solid #f6c445',
              animation: 'fadeUp .5s ease .08s both',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
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
                  {cfg.business || 'Sastika Mobiles'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#b8860b' }}>
                  Sales &amp; Service &bull; TAX INVOICE PROFILE
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

        {/* Row 2: Store Details & Tax Profile - 100% FULL WIDTH */}
        <div style={{ ...panel, animation: 'fadeUp .5s ease .1s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Store Details &amp; Tax Profile</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                Official store credentials and business information from Sastika Mobiles Tax Invoice (Sithurajapuram, Sivakasi)
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
                placeholder="Sastika Mobiles"
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
                placeholder="sastikamobiles.svk@gmail.com"
              />
            </FieldRow>

            <FieldRow label="PHONE / CONTACT NUMBER">
              <input
                style={field}
                value={cfg.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
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

        {/* Row 3: Automation & Payments - FULL WIDTH */}
        <div style={{ ...panel, animation: 'fadeUp .5s ease .15s both' }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
