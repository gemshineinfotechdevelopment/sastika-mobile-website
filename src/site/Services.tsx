import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICES } from '../data';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon, { type IconName } from '../components/Icon';
import { Reveal } from '../components/anim';
import { Btn, Field, input } from './ui';

const ISSUES = ['Cracked Screen', 'Battery Drain', "Won't Turn On", 'Water Damage', 'Camera Issue', 'Other'];

export default function Services() {
  const nav = useNavigate();
  const { addTicket } = useStore();
  const [svc, setSvc] = useState<string>(SERVICES[0].id);
  const [issue, setIssue] = useState(ISSUES[0]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mode, setMode] = useState<'pickup' | 'walk'>('pickup');
  const [slot, setSlot] = useState('Today (Express)');
  const [error, setError] = useState('');
  const [doneId, setDoneId] = useState<string | null>(null);

  const selected = SERVICES.find((s) => s.id === svc);

  const submit = () => {
    if (!brand.trim() || !model.trim()) return setError('Please enter the device brand and model');
    if (name.trim().length < 2) return setError('Please enter your name');
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit mobile number');
    setError('');
    const id = addTicket({
      customer: name,
      phone: '+91 ' + phone,
      device: `${brand} ${model}`,
      issue: `${selected?.title ?? 'Repair'} — ${issue} (${mode === 'pickup' ? 'Doorstep pickup' : 'Walk-in'}, ${slot})`,
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
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '16px 24px 60px' }}>
      <div style={{ padding: '32px 30px', borderRadius: 28, color: '#fff', position: 'relative', overflow: 'hidden', background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`, boxShadow: '0 8px 30px rgba(11,74,67,0.14)' }}>
        <span style={{ position: 'absolute', width: 200, height: 200, right: -40, top: -40, borderRadius: '50%', background: 'rgba(246,196,69,.22)', animation: 'orb 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', right: 28, top: 28, animation: 'wiggle 3s ease-in-out infinite' }}>
          <Icon name="tool" size={54} color={C.accent} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.accent }}>CERTIFIED TECH CARE &amp; SERVICE</div>
        <h1 style={{ margin: '8px 0 8px', fontSize: 32, lineHeight: 1.15, fontWeight: 800, letterSpacing: -0.8, maxWidth: 440 }}>Expert Mobile Repairs &amp; Tech Services</h1>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.9, maxWidth: 480 }}>OEM parts, 1-year brand warranty and express repairs in Sivakasi &amp; Sithurajapuram.</p>
        <div style={{ display: 'flex', gap: 20, marginTop: 18, fontSize: 13, fontWeight: 700 }}>
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
        <div style={{ margin: '22px 18px 0', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, padding: 18 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800 }}>Book a Device Service</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.muted }}>Selected: <b style={{ color: C.primary }}>{selected?.title}</b></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Brand"><input style={input} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="OnePlus" /></Field>
            <Field label="Model"><input style={input} value={model} onChange={(e) => setModel(e.target.value)} placeholder="12 5G" /></Field>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Problem</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {ISSUES.map((i) => (
              <button key={i} className="tap" onClick={() => setIssue(i)} style={{ padding: '8px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: issue === i ? C.primary : C.tint, color: issue === i ? '#fff' : C.primary, transition: 'all .25s ease' }}>{i}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Fulfilment</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {([['pickup', 'Doorstep Pickup'], ['walk', 'Store Walk-in']] as const).map(([k, l]) => (
              <button key={k} className="tap" onClick={() => setMode(k)} style={{ flex: 1, padding: 11, borderRadius: 12, fontWeight: 700, fontSize: 12.5, border: `2px solid ${mode === k ? C.primary : C.border}`, background: mode === k ? C.tint2 : '#fff', color: C.primary, transition: 'all .25s ease' }}>{l}</button>
            ))}
          </div>
          <Field label="Preferred slot">
            <select style={input} value={slot} onChange={(e) => setSlot(e.target.value)}>
              {['Today (Express)', 'Today 4–6 PM', 'Tomorrow 10–12 AM', 'Tomorrow 2–4 PM'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Your name"><input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></Field>
          <Field label="Mobile number"><input style={input} inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" /></Field>
          {error && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 700, marginBottom: 10, animation: 'fadeUp .3s ease' }}>{error}</div>}
          <Btn full onClick={submit}>Confirm Service Booking <Icon name="right" size={16} /></Btn>
        </div>
      </Reveal>
    </div>
  );
}
