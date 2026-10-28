import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import Icon, { type IconName } from '../components/Icon';
import { CountUp, Reveal } from '../components/anim';
import { Btn } from './ui';
import { useStore } from '../store';
import defaultLogo from '../assets/logo.png';

const PILLARS: { icon: IconName; t: string; s: string }[] = [
  {
    icon: 'award',
    t: '100% Original Sealed Mobiles',
    s: 'Every smartphone is 100% brand new, factory sealed with official 1-year brand warranty and authentic GST Tax Invoice (GSTIN: 33BQTPJ5275L1Z6).',
  },
  {
    icon: 'tool',
    t: 'Multi-Brand Sales & Expert Service',
    s: 'Sales and certified service under one roof. Our experienced technicians provide trusted diagnostic and repair support.',
  },
  {
    icon: 'tag',
    t: 'Best Price Guarantee in Sivakasi',
    s: 'Direct distributor pricing with exclusive exchange offers and discounts on top smartphone brands in Sivakasi and Sithurajapuram.',
  },
  {
    icon: 'shield',
    t: 'Authorized Company Service Support',
    s: 'Comprehensive assistance and documentation to ensure prompt, smooth servicing at official brand service centers.',
  },
];

const RULES = [
  {
    no: '1',
    title: '1 Year Brand Warranty',
    desc: 'All brand new smartphones come with 1 year official manufacturer warranty.',
  },
  {
    no: '2',
    title: 'Company Service Center Assistance',
    desc: 'Full assistance provided for quick service and repairs at authorized brand centers.',
  },
  {
    no: '3',
    title: 'Genuine Accessories & Care',
    desc: 'Original accessories, certified fast chargers, premium cases, and tempered glass available.',
  },
  {
    no: '4',
    title: 'Transparent GST Billing',
    desc: 'Official GST Tax Invoice (GSTIN: 33BQTPJ5275L1Z6) generated and provided with every device.',
  },
  {
    no: '5',
    title: 'Friendly After-Sales Support',
    desc: 'Our staff will gladly assist you with initial setup, contacts transfer, and WhatsApp data migration.',
  },
];

export default function About() {
  const nav = useNavigate();
  const { logo } = useStore();

  return (
    <div className="site-page-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Devotional Invocations Banner from original bill */}
      <div
        style={{
          background: '#fff3dc',
          borderBottom: '1px solid #ffd899',
          padding: '8px 14px',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 800,
          color: '#995c00',
          letterSpacing: 0.3,
          borderRadius: 12,
        }}
      >
        Sri Bala Murugan Thunai &bull; Sri Kottai Karuppasamy Thunai &bull; Sri Guruvammal Thunai
      </div>

      {/* Hero Card */}
      <div
        style={{
          margin: '14px 0 0',
          padding: '24px 20px',
          borderRadius: 24,
          color: '#fff',
          background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            right: -60,
            bottom: -80,
            borderRadius: '50%',
            background: 'rgba(246,196,69,.18)',
            animation: 'orb 10s ease-in-out infinite',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <img
            src={logo || defaultLogo || '/logo.png'}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultLogo || '/logo.png'; }}
            alt="Sastikaa Mobiles Logo"
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #d4af37',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              background: '#fff',
            }}
          />
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: C.accent }}>
              TAX INVOICE &bull; GSTIN: 33BQTPJ5275L1Z6
            </div>
            <h1
              style={{
                margin: '2px 0 0',
                fontSize: 26,
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: -0.5,
              }}
            >
              Sastikaa Mobiles
            </h1>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e4f3ef', letterSpacing: 0.5 }}>
              SASTIKAA MOBILES &bull; SALES &amp; SERVICE
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
          Premier multi-brand smartphone showroom and service center situated in Sithurajapuram and Sivakasi.
        </p>

        <div style={{ display: 'flex', gap: 24, marginTop: 18 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>
              <CountUp to={2} suffix=" Branches" />
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Sithurajapuram & Sivakasi</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>
              <CountUp to={10} suffix="K+" />
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Satisfied Customers</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 18px 0' }}>
        {/* Store Location Section */}
        <Reveal>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.primarySoft }}>
            OUR STORE LOCATION
          </div>
          <h2 style={{ margin: '4px 0 14px', fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}>
            Visit Our Showroom in Sivakasi
          </h2>

          <div
            className="lift"
            style={{
              padding: 18,
              background: '#fff',
              borderRadius: 20,
              border: `1.5px solid ${C.border}`,
              boxShadow: '0 4px 14px rgba(11,74,67,.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 8,
                  background: C.primary,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                Flagship Store
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primarySoft }}>Sales &amp; Service</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 4 }}>
              Sri Renga Complex, Sithurajapuram, Sivakasi
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
              Near Kennedy Medicals, Sithurajapuram, Sivakasi, Tamil Nadu - 626189.
              <br />
              <span style={{ fontWeight: 600, color: C.primary }}>Hours:</span> 09:30 AM – 09:30 PM (All 7 Days)
            </div>
          </div>
        </Reveal>

        {/* 4 Pillars of Trust */}
        <h2 style={{ margin: '28px 0 12px', fontSize: 21, fontWeight: 800 }}>
          Our Key Highlights &amp; Advantages
        </h2>
        {PILLARS.map((p, i) => (
          <Reveal key={p.t} delay={i * 90}>
            <div
              className="lift"
              style={{
                display: 'flex',
                gap: 14,
                padding: 14,
                background: '#fff',
                borderRadius: 18,
                border: `1px solid ${C.border}`,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: C.primary,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={p.icon} size={20} color={C.accent} />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{p.t}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 3 }}>
                  {p.s}
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {/* Customer Guidelines from Invoice */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.primarySoft }}>
            CUSTOMER TERMS &bull; SERVICE GUIDELINES
          </div>
          <h2 style={{ margin: '4px 0 12px', fontSize: 20, fontWeight: 800 }}>
            Warranty &amp; Service Policy
          </h2>

          <div style={{ display: 'grid', gap: 9 }}>
            {RULES.map((r) => (
              <div
                key={r.no}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 14px',
                  background: C.tint2,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    background: C.primary,
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {r.no}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Reveal>
          <div style={{ marginTop: 24, padding: 20, borderRadius: 24, background: C.primary, color: '#fff' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>
              Looking to Buy a Smartphone or Book a Repair?
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, opacity: 0.88 }}>
              Our expert team across both branches in Sivakasi and Sithurajapuram is ready to assist you.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="accent" onClick={() => nav('/services')} style={{ flex: 1 }}>
                Book Service
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => nav('/contact')}
                style={{ flex: 1, color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}
              >
                Find Stores
              </Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
