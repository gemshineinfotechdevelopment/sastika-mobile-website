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
        business: parsed.business && !/[\u0B80-\u0BFF]/.test(parsed.business) ? parsed.business : DEFAULT.business,
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
    setCfg((c) => ({ ...c, [k]: v }));
    setDirty(true);
  };

  const save = () => {
    try {
      localStorage.setItem('sastika:settings', JSON.stringify(cfg));
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
    { k: 'smsUpdates', t: 'SMS & WhatsApp Updates', s: 'Send order confirmation and repair status alerts to customers' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Static Brand Logo Display */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .05s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Brand Logo &amp; Identity</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                  Official store logo permanently configured for Sastika Mobiles.
                </div>
              </div>
              <Tag tone="green">Static Logo Active</Tag>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Previews */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Light Mode</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Dark / Admin</div>
                </div>
              </div>

              {/* Static Asset Note */}
              <div style={{ flex: 1, minWidth: 240, paddingLeft: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ padding: '3px 9px', borderRadius: 6, background: '#e8f5e9', color: '#2e7d32', fontWeight: 800, fontSize: 11.5 }}>
                    ✓ Static Brand Asset
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>assets/logo.png</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
                  The logo is permanently loaded from <strong style={{ color: C.primary }}>src/assets/logo.png</strong> and displayed across the storefront header, mobile navigation drawer, tax invoice receipts, and admin portal.
                </div>
              </div>
            </div>
          </div>

          {/* Business Profile from Official Invoice */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .1s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Store Details &amp; Tax Profile</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>
                  Official store credentials from Sastika Mobiles Tax Invoice (Sithurajapuram, Sivakasi)
                </div>
              </div>
              <Tag tone="amber">GST Registered</Tag>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            </div>
          </div>

          {/* Automation & Payments */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .2s both' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Automation &amp; Payments</div>
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

        {/* Right Column */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Tax Invoice Info Badge */}
          <div
            style={{
              ...panel,
              background: '#fffdf6',
              border: '1.5px solid #f6c445',
              animation: 'fadeUp .5s ease .1s both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span
                style={{
                  width: 34,
                  height: 34,
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
                <div style={{ fontWeight: 800, fontSize: 15, color: C.primary }}>
                  {cfg.business || 'Sastika Mobiles'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#b8860b' }}>
                  Sales &amp; Service &bull; TAX INVOICE
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, lineHeight: 1.6, color: '#555' }}>
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

          {/* Storage & Sync Card */}
          <div
            style={{
              ...panel,
              background: C.primary,
              color: '#fff',
              border: 'none',
              animation: 'fadeUp .5s ease .15s both',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                position: 'absolute',
                width: 130,
                height: 130,
                right: -30,
                top: -30,
                borderRadius: '50%',
                background: 'rgba(246,196,69,.2)',
                animation: 'orb 8s ease-in-out infinite',
              }}
            />
            <Icon name="lock" size={22} color={C.accent} />
            <div style={{ fontWeight: 800, fontSize: 17, margin: '10px 0 4px' }}>
              Real-Time Brand Sync
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.88, lineHeight: 1.55 }}>
              Any changes made to your store name, address, or contact details are immediately synchronized in real time across the Storefront, Mobile View, Invoice Engine, and Admin Portal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
