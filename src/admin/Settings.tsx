import { useEffect, useRef, useState } from 'react';
import { C } from '../theme';
import Icon from '../components/Icon';
import { AButton, FieldRow, PageTitle, Tag, Toggle, field, panel } from './ui';
import { useStore } from '../store';
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

const STAFF = [
  { n: 'Mahesh', r: 'Senior Technician', c: C.primary },
  { n: 'Imran', r: 'Repair Technician', c: C.primarySoft },
  { n: 'Divya', r: 'Store Manager', c: C.accentDark },
  { n: 'Karthik', r: 'Inventory Lead', c: C.info },
];

export default function Settings() {
  const { logo, setLogo } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [logoMsg, setLogoMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2200);
    return () => window.clearTimeout(t);
  }, [saved]);

  useEffect(() => {
    if (!logoMsg) return;
    const t = window.setTimeout(() => setLogoMsg(''), 2500);
    return () => window.clearTimeout(t);
  }, [logoMsg]);

  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => {
    setCfg((c) => ({ ...c, [k]: v }));
    setDirty(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogo(reader.result);
        setLogoMsg('✓ Logo uploaded & updated across Storefront and Admin!');
      }
    };
    reader.readAsDataURL(file);
  };

  const applyLogoUrl = () => {
    if (!logoUrlInput.trim()) return;
    setLogo(logoUrlInput.trim());
    setLogoUrlInput('');
    setLogoMsg('✓ Logo URL applied successfully!');
  };

  const resetLogo = () => {
    if (window.confirm('Reset logo back to default Sastika Mobiles logo?')) {
      setLogo(defaultLogo);
      setLogoMsg('✓ Logo reset to default.');
    }
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
        sub="Configure brand logo, shop details, GSTIN tax credentials, store address, and retail controls."
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
          {/* Logo Management Card */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .05s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Brand Logo &amp; Identity</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                  Upload your store logo. It updates automatically across the Storefront Header, Mobile Drawer, and Admin Portal.
                </div>
              </div>
              <Tag tone="green">Active</Tag>
            </div>

            {logoMsg && (
              <div
                style={{
                  background: C.successSoft,
                  color: C.success,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="check" size={16} />
                {logoMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Previews */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
                      src={logo || defaultLogo}
                      alt="Current Logo"
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
                      src={logo || defaultLogo}
                      alt="Current Logo Dark"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Dark / Admin</div>
                </div>
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1, minWidth: 240, display: 'grid', gap: 10 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <AButton variant="primary" onClick={() => fileInputRef.current?.click()}>
                    📁 Upload Logo Image
                  </AButton>
                  <AButton variant="ghost" onClick={resetLogo}>
                    🔄 Reset Default
                  </AButton>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input
                    style={{ ...field, fontSize: 12.5, padding: '8px 11px' }}
                    placeholder="Or paste image URL (https://...)"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyLogoUrl()}
                  />
                  <AButton small variant="accent" onClick={applyLogoUrl} disabled={!logoUrlInput.trim()}>
                    Apply
                  </AButton>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Recommended: Square PNG/JPG (at least 200x200px) with transparent or light background. Max 2MB.
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

          {/* Staff Accounts */}
          <div style={{ ...panel, animation: 'fadeUp .5s ease .15s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Staff &amp; Tech Team</div>
              <Tag tone="gray">{STAFF.length} members</Tag>
            </div>
            {STAFF.map((s, i) => (
              <div
                key={s.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i < STAFF.length - 1 ? `1px solid ${C.border}` : 'none',
                  animation: `fadeUp .4s ease ${i * 70}ms both`,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 99,
                    background: s.c,
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                  }}
                >
                  {s.n[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.r}</div>
                </div>
                <Tag tone="green">Active</Tag>
              </div>
            ))}
          </div>

          {/* Storage & Sync Card */}
          <div
            style={{
              ...panel,
              background: C.primary,
              color: '#fff',
              border: 'none',
              animation: 'fadeUp .5s ease .25s both',
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
              Any changes made to your store logo, shop name, or address are immediately synchronized in real time across the Storefront, Mobile View, Invoice Engine, and Admin Portal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
