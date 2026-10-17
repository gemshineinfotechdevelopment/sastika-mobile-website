import { useEffect, useState } from 'react';
import { C } from '../theme';
import Icon from '../components/Icon';
import { AButton, FieldRow, PageTitle, Tag, Toggle, field, panel } from './ui';

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
  business: 'Sastika Mobiles Pvt. Ltd.',
  gstin: '33AAAAA0000A1Z5',
  email: 'care@sastikamobiles.in',
  phone: '+91 98765 43210',
  address: 'Usman Road, T. Nagar, Chennai 600017',
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
  const [cfg, setCfg] = useState<Cfg>(() => {
    try {
      const raw = localStorage.getItem('sastika:settings');
      return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : DEFAULT;
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
    if (window.confirm('Reset the demo data (products, orders, tickets) to defaults?')) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sastika:'))
        .forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const switches: { k: keyof Cfg; t: string; s: string }[] = [
    { k: 'gstOn', t: 'GST tax engine', s: 'Add GST breakdown to invoices' },
    { k: 'autoInvoice', t: 'Automated invoicing', s: 'Email invoice when an order ships' },
    { k: 'lowStockAlerts', t: 'Low-stock alerts', s: 'Alert managers at reorder level' },
    { k: 'smsUpdates', t: 'SMS & WhatsApp updates', s: 'Send order and repair status updates' },
    { k: 'upiOn', t: 'UPI payments', s: 'Accept UPI at checkout' },
    { k: 'codOn', t: 'Cash on delivery', s: 'Allow COD orders' },
  ];

  return (
    <div>
      <PageTitle
        title="Enterprise Retail Settings"
        sub="Business profile, notifications and payment controls."
        actions={
          <>
            <AButton variant="danger" onClick={reset}>Reset Demo Data</AButton>
            <AButton onClick={save} disabled={!dirty && !saved}>{saved ? '✓ Saved' : 'Save Configuration'}</AButton>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ ...panel, animation: 'fadeUp .5s ease .1s both' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>General Business Profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldRow label="REGISTERED BUSINESS NAME"><input style={field} value={cfg.business} onChange={(e) => set('business', e.target.value)} /></FieldRow>
              <FieldRow label="GSTIN"><input style={field} value={cfg.gstin} onChange={(e) => set('gstin', e.target.value)} /></FieldRow>
              <FieldRow label="SUPPORT EMAIL"><input style={field} type="email" value={cfg.email} onChange={(e) => set('email', e.target.value)} /></FieldRow>
              <FieldRow label="SUPPORT PHONE"><input style={field} value={cfg.phone} onChange={(e) => set('phone', e.target.value)} /></FieldRow>
              <div style={{ gridColumn: '1 / -1' }}>
                <FieldRow label="REGISTERED ADDRESS"><input style={field} value={cfg.address} onChange={(e) => set('address', e.target.value)} /></FieldRow>
              </div>
              <FieldRow label="STORE CURRENCY"><input style={{ ...field, background: C.tint2 }} value={cfg.currency} readOnly /></FieldRow>
              <FieldRow label="FREE SHIPPING ABOVE (₹)"><input style={field} type="number" min={0} value={cfg.freeShipAbove} onChange={(e) => set('freeShipAbove', e.target.value)} /></FieldRow>
            </div>
          </div>

          <div style={{ ...panel, animation: 'fadeUp .5s ease .2s both' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Automation & Payments</div>
            {switches.map((s) => (
              <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.s}</div>
                </div>
                <Toggle on={cfg[s.k] as boolean} onChange={(v) => set(s.k, v as Cfg[typeof s.k])} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ ...panel, animation: 'fadeUp .5s ease .15s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Staff Accounts</div>
              <Tag tone="gray">{STAFF.length} members</Tag>
            </div>
            {STAFF.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < STAFF.length - 1 ? `1px solid ${C.border}` : 'none', animation: `fadeUp .4s ease ${i * 70}ms both` }}>
                <div style={{ width: 38, height: 38, borderRadius: 99, background: s.c, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{s.n[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.r}</div>
                </div>
                <Tag tone="green">Active</Tag>
              </div>
            ))}
          </div>

          <div style={{ ...panel, background: C.primary, color: '#fff', border: 'none', animation: 'fadeUp .5s ease .25s both', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', width: 130, height: 130, right: -30, top: -30, borderRadius: '50%', background: 'rgba(246,196,69,.2)', animation: 'orb 8s ease-in-out infinite' }} />
            <Icon name="lock" size={22} color={C.accent} />
            <div style={{ fontWeight: 800, fontSize: 17, margin: '10px 0 4px' }}>Data lives in this browser</div>
            <div style={{ fontSize: 12.5, opacity: 0.85, lineHeight: 1.55 }}>
              Products, orders and tickets are saved to localStorage so the storefront and admin stay in sync. Connect a backend API to share data between devices.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
