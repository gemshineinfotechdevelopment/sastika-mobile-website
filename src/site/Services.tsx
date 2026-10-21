import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICES } from '../data';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import { Reveal } from '../components/anim';
import { Btn, Field, input } from './ui';

const ISSUES = [
  'Cracked Screen',
  'Battery Drain',
  "Won't Turn On",
  'Water Damage',
  'Camera Issue',
  'Charging Port Issue',
  'Speaker / Mic Issue',
  'Other',
];

export default function Services() {
  const nav = useNavigate();
  const { addTicket } = useStore();
  const [svc, setSvc] = useState<string>(SERVICES[0].id);
  const [issue, setIssue] = useState(ISSUES[0]);
  const [problemText, setProblemText] = useState(ISSUES[0]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mode, setMode] = useState<'pickup' | 'walk'>('pickup');
  const [slot, setSlot] = useState('Today (Express) — Within 90 mins');
  const [error, setError] = useState('');
  const [doneId, setDoneId] = useState<string | null>(null);

  const selected = SERVICES.find((s) => s.id === svc);

  const submit = () => {
    if (!brand.trim()) return setError('Brand is required. Please enter device brand.');
    if (!model.trim()) return setError('Model is required. Please enter device model.');
    if (!name.trim() || name.trim().length < 2) return setError('Your name is required. Please enter your name.');
    if (!phone.trim()) return setError('Mobile number is required. Please enter 10-digit number.');
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit mobile number.');
    setError('');
    const finalProblem = problemText.trim() || issue || 'General Repair';
    const id = addTicket({
      customer: name.trim(),
      phone: '+91 ' + phone.trim(),
      device: `${brand.trim()} ${model.trim()}`,
      issue: `${selected?.title ?? 'Repair'} — ${finalProblem} (${mode === 'pickup' ? 'Doorstep pickup' : 'Walk-in'}, ${slot})`,
      cost: selected?.price ?? 0,
    });
    setDoneId(id);
  };

  if (doneId) {
    return (
      <div style={{ textAlign: 'center', padding: '70px 26px', animation: 'fadeUp .5s ease' }}>
        <div style={{ width: 90, height: 90, borderRadius: 99, background: C.success, margin: '0 auto 18px', display: 'grid', placeItems: 'center', animation: 'bounceIn .6s ease', boxShadow: '0 0 0 12px rgba(31,157,107,.15)' }}>
          <Icon name="check" size={44} color="#fff" stroke={3.5} />
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>Service booked</h2>
        <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>
          Your ticket <b style={{ color: C.text }}>#{doneId}</b> is confirmed. Our technician will call you shortly.
        </p>
        <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
          <Btn full onClick={() => nav('/account')}>Track Ticket</Btn>
          <Btn full variant="light" onClick={() => setDoneId(null)}>Book Another</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="site-page-container" style={{ maxWidth: 1160, margin: '0 auto' }}>
      <div style={{ padding: '24px 20px', borderRadius: 24, color: '#fff', position: 'relative', overflow: 'hidden', background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`, boxShadow: '0 8px 30px rgba(11,74,67,0.14)' }}>
        <span style={{ position: 'absolute', width: 200, height: 200, right: -40, top: -40, borderRadius: '50%', background: 'rgba(246,196,69,.22)', animation: 'orb 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', right: 28, top: 28, animation: 'wiggle 3s ease-in-out infinite' }}>
          <Icon name="tool" size={54} color={C.accent} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.accent }}>CERTIFIED TECH CARE &amp; SERVICE</div>
        <h1 style={{ margin: '8px 0 8px', fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: -0.6, maxWidth: 440 }}>Expert Mobile Repairs &amp; Tech Services</h1>
        <p style={{ margin: 0, fontSize: 13.5, opacity: 0.9, maxWidth: 480 }}>OEM parts, 1-year brand warranty and express repairs in Sivakasi &amp; Sithurajapuram.</p>
        <div style={{ display: 'flex', gap: 14, marginTop: 18, fontSize: 12.5, fontWeight: 700, flexWrap: 'wrap' }}>
          {['100% Genuine Parts', '90-min Express Service', 'No Fix, No Fee Guarantee'].map((t, i) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, animation: `fadeUp .5s ease ${0.3 + i * 0.12}s both` }}>
              <Icon name="check" size={15} color={C.accent} stroke={3} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 0 0' }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 800 }}>Catalog of Care Services</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {SERVICES.map((s, i) => {
            const on = svc === s.id;
            return (
              <Reveal key={s.id} delay={(i % 2) * 90} dir={i % 2 ? 'right' : 'left'}>
                <button className="lift tap" onClick={() => setSvc(s.id)} style={{ width: '100%', textAlign: 'left', padding: 14, borderRadius: 18, background: on ? C.primary : '#fff', color: on ? '#fff' : C.text, border: `1.5px solid ${on ? C.primary : C.border}`, transition: 'background .3s ease, color .3s ease' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, background: on ? C.accent : C.tint, display: 'grid', placeItems: 'center', marginBottom: 10 }}>
                    <Icon name={s.icon as IconName} size={19} color={on ? C.primaryDark : C.primary} />
                  </span>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{s.title}</div>
                  <div style={{ fontSize: 11, opacity: on ? 0.8 : 0.65, margin: '3px 0 8px', lineHeight: 1.35 }}>{s.desc}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: on ? C.accent : C.primary }}>{s.price ? `Starts ${money(s.price)}` : 'FREE'}</div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Reveal>
        <div style={{ margin: '24px 0 0', width: '100%', boxSizing: 'border-box', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Book a Device Service</h2>
          <p style={{ margin: '0 0 16px', fontSize: 12.5, color: C.muted }}>Selected Service: <b style={{ color: C.primary }}>{selected?.title}</b></p>

          {/* Brand & Model (Required) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <Field label="Brand" required>
              <input
                style={input}
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. OnePlus, Vivo, Redmi"
              />
            </Field>
            <Field label="Model" required>
              <input
                style={input}
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. 12 5G, Y200, Note 13"
              />
            </Field>
          </div>

          {/* Problem section: Text box + Dropdown */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
              Problem / Issue Description <span style={{ color: C.danger, fontWeight: 800 }}>*</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {/* Text Box */}
              <div>
                <input
                  style={input}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="Type issue details (e.g. screen broken, battery drain)..."
                />
              </div>

              {/* Dropdown with options */}
              <div style={{ position: 'relative' }}>
                <select
                  style={{
                    ...input,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    paddingRight: 34,
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: C.primary,
                  }}
                  value={issue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIssue(val);
                    if (val && val !== 'Other') {
                      setProblemText(val);
                    } else if (val === 'Other') {
                      setProblemText('');
                    }
                  }}
                >
                  {ISSUES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.muted }}>
                  <Icon name="down" size={15} />
                </div>
              </div>
            </div>
          </div>

          {/* Fulfilment Mode */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Fulfilment Type</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {([['pickup', 'Doorstep Pickup'], ['walk', 'Store Walk-in']] as const).map(([k, l]) => (
              <button key={k} type="button" className="tap" onClick={() => setMode(k)} style={{ flex: 1, padding: 11, borderRadius: 12, fontWeight: 700, fontSize: 12.5, border: `2px solid ${mode === k ? C.primary : C.border}`, background: mode === k ? C.tint2 : '#fff', color: C.primary, transition: 'all .25s ease' }}>{l}</button>
            ))}
          </div>

          {/* Preferred Slot - Modern Redesigned UI */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Preferred Time Slot</div>
            <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.primary }}>
                <Icon name="clock" size={18} />
              </div>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                style={{
                  ...input,
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  paddingLeft: 42,
                  paddingRight: 36,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: C.primaryDark,
                  background: '#fff',
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 14,
                }}
              >
                <option value="Today (Express) — Within 90 mins">⚡ Today (Express) — Within 90 mins</option>
                <option value="Today Evening (4:00 PM – 6:00 PM)">🕒 Today Evening (4:00 PM – 6:00 PM)</option>
                <option value="Tomorrow Morning (10:00 AM – 12:00 PM)">🌅 Tomorrow Morning (10:00 AM – 12:00 PM)</option>
                <option value="Tomorrow Afternoon (2:00 PM – 4:00 PM)">🌇 Tomorrow Afternoon (2:00 PM – 4:00 PM)</option>
              </select>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.muted }}>
                <Icon name="down" size={16} />
              </div>
            </div>

            {/* Quick Slot Selector Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {[
                { id: 'Today (Express) — Within 90 mins', label: '⚡ Today (Express)' },
                { id: 'Today Evening (4:00 PM – 6:00 PM)', label: '🕒 Today 4–6 PM' },
                { id: 'Tomorrow Morning (10:00 AM – 12:00 PM)', label: '🌅 Tomorrow 10–12 AM' },
                { id: 'Tomorrow Afternoon (2:00 PM – 4:00 PM)', label: '🌇 Tomorrow 2–4 PM' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="tap"
                  onClick={() => setSlot(s.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 99,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: slot === s.id ? C.primary : C.tint,
                    color: slot === s.id ? '#fff' : C.primary,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Name & Phone (Required) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <Field label="Your name" required>
              <input
                style={input}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </Field>
            <Field label="Mobile number" required>
              <input
                style={input}
                required
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
              />
            </Field>
          </div>

          {error && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 700, marginBottom: 12, padding: '8px 12px', background: C.dangerSoft, borderRadius: 10, animation: 'fadeUp .3s ease' }}>⚠️ {error}</div>}
          <Btn full onClick={submit}>Confirm Service Booking <Icon name="right" size={16} /></Btn>
        </div>
      </Reveal>
    </div>
  );
}
