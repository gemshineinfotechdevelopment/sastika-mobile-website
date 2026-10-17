import { useState } from 'react';
import { STORES } from '../data';
import { C } from '../theme';
import Icon from '../components/Icon';
import { Reveal } from '../components/anim';
import { Btn, Field, Pill, input } from './ui';

export default function Contact() {
  const [active, setActive] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const store = STORES[active];

  const send = () => {
    if (name.trim().length < 2 || msg.trim().length < 5) return setError('Please add your name and a short message');
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit mobile number');
    setError('');
    setSent(true);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px 60px' }}>
      <div style={{ padding: '32px 28px', borderRadius: 28, color: '#fff', background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 30px rgba(11,74,67,0.15)' }}>
        <span style={{ position: 'absolute', width: 150, height: 150, right: -40, top: -40, borderRadius: '50%', background: 'rgba(246,196,69,.2)', animation: 'orb 9s ease-in-out infinite' }} />
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.accent }}>CONTACT</div>
        <h1 style={{ margin: '8px 0 8px', fontSize: 29, lineHeight: 1.1, fontWeight: 800, letterSpacing: -0.8 }}>Get in Touch with Our Tech Specialists</h1>
        <p style={{ margin: 0, fontSize: 12.5, opacity: 0.85 }}>Ask about availability, book a repair or visit us in store — open 7 days a week.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: 9, background: C.accent, animation: 'pulseDot 1.6s infinite' }} />
          3 specialists currently online
        </div>
      </div>

      <div style={{ padding: '22px 18px 0' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800 }}>Our Store Location</h2>
        {STORES.length > 1 && (
          <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12 }}>
            {STORES.map((s, i) => (
              <button key={s.name} className="tap" onClick={() => setActive(i)} style={{ padding: '9px 14px', borderRadius: 99, fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', background: active === i ? C.primary : '#fff', color: active === i ? '#fff' : C.text, border: `1px solid ${active === i ? C.primary : C.border}`, transition: 'all .25s ease' }}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div key={active} style={{ background: '#fff', borderRadius: 22, border: `1px solid ${C.border}`, overflow: 'hidden', animation: 'fadeUp .4s ease' }}>
          {/* stylised map */}
          <div style={{ height: 150, position: 'relative', background: `linear-gradient(135deg, ${C.tint}, #fff)`, overflow: 'hidden' }}>
            <svg width="100%" height="150" viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden>
              <path d="M0 110 Q90 60 180 90 T360 50" stroke={C.border} strokeWidth="14" fill="none" />
              <path d="M60 0 L120 150" stroke={C.border} strokeWidth="10" fill="none" />
              <path d="M250 0 Q230 80 300 150" stroke={C.border} strokeWidth="10" fill="none" />
              <path d="M0 40 H360" stroke="#fff" strokeWidth="3" strokeDasharray="8 8" />
            </svg>
            <div style={{ position: 'absolute', left: '52%', top: 38, animation: 'floatSoft 2.2s ease-in-out infinite' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: C.danger, display: 'grid', placeItems: 'center', boxShadow: '0 6px 14px rgba(229,72,77,.4)' }}>
                <span style={{ transform: 'rotate(45deg)', display: 'grid' }}><Icon name="phone" size={17} color="#fff" /></span>
              </div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <Pill tone="accent">{store.tag.toUpperCase()}</Pill>
            <div style={{ fontWeight: 800, fontSize: 17, margin: '8px 0 4px' }}>{store.name}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, color: C.muted, marginBottom: 6 }}><Icon name="pin" size={16} color={C.primary} /> {store.addr}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, color: C.muted, marginBottom: 14 }}><Icon name="clock" size={16} color={C.primary} /> {store.hours}</div>
            <Btn full variant="light" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(store.addr)}`, '_blank')}>
              Get Directions <Icon name="external" size={15} />
            </Btn>
          </div>
        </div>
      </div>

      <Reveal>
        <div style={{ margin: '22px 18px 0', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, padding: 18 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0', animation: 'bounceIn .5s ease' }}>
              <div style={{ width: 64, height: 64, borderRadius: 99, background: C.success, margin: '0 auto 12px', display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={32} color="#fff" stroke={3.5} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Message sent</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>We'll get back to you within the hour.</div>
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 12px', fontSize: 19, fontWeight: 800 }}>Send us a message</h2>
              <Field label="Name"><input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></Field>
              <Field label="Mobile"><input style={input} inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" /></Field>
              <Field label="Message"><textarea style={{ ...input, minHeight: 92, resize: 'none' }} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="How can we help?" /></Field>
              {error && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>{error}</div>}
              <Btn full onClick={send}>Send Message <Icon name="right" size={16} /></Btn>
            </>
          )}
        </div>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 18px 0' }}>
        <a href="tel:+919876543210" className="tap" style={{ padding: 14, borderRadius: 16, background: C.primary, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 13 }}>Call Us</a>
        <a href="mailto:care@sastikamobiles.in" className="tap" style={{ padding: 14, borderRadius: 16, background: C.accent, color: C.primaryDark, textAlign: 'center', fontWeight: 800, fontSize: 13 }}>Email</a>
      </div>
    </div>
  );
}
