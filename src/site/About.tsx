import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import Icon, { type IconName } from '../components/Icon';
import { CountUp, Reveal } from '../components/anim';
import { Btn } from './ui';

const PILLARS: { icon: IconName; t: string; s: string }[] = [
  { icon: 'award', t: '100% Brand Sealed Originality', s: 'Every phone ships with an official invoice and GST validation. Never refurbished, never grey-market.' },
  { icon: 'tag', t: 'Fair Price Guarantee', s: 'Direct official OEM sourcing removes middlemen. Found it cheaper? We will price match.' },
  { icon: 'tool', t: 'Certified Technician Care', s: 'Clean-room certified bench with ESD-safe tooling and original spare parts.' },
  { icon: 'leaf', t: 'Green Tech & E-Waste Trade-In', s: 'Instant valuation on your old handset with government-authorised, eco-friendly disposal.' },
];

const MILESTONES = [
  { y: '2014', t: 'First store opens in T. Nagar' },
  { y: '2018', t: 'Certified service lab launched' },
  { y: '2021', t: 'Became an authorised OEM partner' },
  { y: '2024', t: 'OMR & Anna Nagar flagships open' },
];

export default function About() {
  const nav = useNavigate();
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ margin: '14px 14px 0', padding: '26px 20px', borderRadius: 28, color: '#fff', background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`, position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', width: 200, height: 200, right: -60, bottom: -80, borderRadius: '50%', background: 'rgba(246,196,69,.18)', animation: 'orb 10s ease-in-out infinite' }} />
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.accent }}>EST. 2014 · CHENNAI</div>
        <h1 style={{ margin: '8px 0 10px', fontSize: 30, lineHeight: 1.1, fontWeight: 800, letterSpacing: -0.8 }}>Our Journey & Craft</h1>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>Tamil Nadu's premier destination for genuine smartphones, certified accessories and expert care.</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.accent }}><CountUp to={250} suffix="K+" /></div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Happy customers</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.accent }}><CountUp to={4.9} decimals={1} /></div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Google rating</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 18px 0' }}>
        <Reveal>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.primarySoft }}>THE SASTIKA LEGACY</div>
          <h2 style={{ margin: '4px 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>From a humble T. Nagar desk to Tamil Nadu's most trusted tech haven</h2>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.muted }}>
            What began as an intimate boutique showroom near Panagal Park has blossomed into a statewide tech family. Founded on zero-compromise device authenticity, Sastika resolved early on that every customer deserved honest advice and genuine hardware.
          </p>
        </Reveal>

        <div style={{ marginTop: 22, position: 'relative', paddingLeft: 22 }}>
          <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 2, background: C.border }} />
          {MILESTONES.map((m, i) => (
            <Reveal key={m.y} delay={i * 110} dir="left">
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <span style={{ position: 'absolute', left: -22, top: 3, width: 14, height: 14, borderRadius: 99, background: C.accent, border: `3px solid ${C.primary}` }} />
                <div style={{ fontWeight: 800, color: C.primary, fontSize: 15 }}>{m.y}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{m.t}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <h2 style={{ margin: '26px 0 12px', fontSize: 21, fontWeight: 800 }}>Four Non-Negotiable Pillars of Trust</h2>
        {PILLARS.map((p, i) => (
          <Reveal key={p.t} delay={i * 90}>
            <div className="lift" style={{ display: 'flex', gap: 14, padding: 14, background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10 }}>
              <span style={{ width: 42, height: 42, borderRadius: 13, background: C.primary, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={p.icon} size={20} color={C.accent} />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{p.t}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 3 }}>{p.s}</div>
              </div>
            </div>
          </Reveal>
        ))}

        <Reveal>
          <div style={{ marginTop: 18, padding: 20, borderRadius: 24, background: C.primary, color: '#fff' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>Questions about compatibility or doorstep service?</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, opacity: 0.85 }}>Our master consultants are on hand to help.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="accent" onClick={() => nav('/services')} style={{ flex: 1 }}>Book Repair</Btn>
              <Btn variant="ghost" onClick={() => nav('/contact')} style={{ flex: 1, color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>Talk to Us</Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
