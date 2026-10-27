import { useState } from 'react';
import { STORES } from '../data';
import { C } from '../theme';
import Icon from '../components/Icon';
import { Btn, Pill } from './ui';

export default function Contact() {
  const [active, setActive] = useState(0);
  const store = STORES[active] || STORES[0];

  const storeContacts = [
    {
      role: 'Store Manager',
      roleBadge: 'Branch In-Charge & Operations',
      name: 'S. Ramanathan',
      phone: '+91 95434 34344',
      rawPhone: '9543434344',
      description: 'Store escalations, corporate bulk purchases, service warranty & general customer care',
      status: 'Available Daily',
    },
    {
      role: 'Sales Representative',
      roleBadge: 'Sales & Product Specialist',
      name: 'M. Karthi',
      phone: '+91 98401 23456',
      rawPhone: '9840123456',
      description: 'Smartphone deals, trade-in exchange quotes, home appliances & live stock availability',
      status: 'Available Daily',
    },
  ];

  return (
    <div className="site-page-container" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 30 }}>
      {/* Top Banner */}
      <div
        style={{
          padding: '24px 20px',
          borderRadius: 24,
          color: '#fff',
          background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(11,74,67,0.15)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: 150,
            height: 150,
            right: -40,
            top: -40,
            borderRadius: '50%',
            background: 'rgba(246,196,69,.2)',
            animation: 'orb 9s ease-in-out infinite',
          }}
        />
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.accent }}>
          SASTIKA MOBILES &bull; SIVAKASI
        </div>
        <h1 style={{ margin: '8px 0 8px', fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: -0.6 }}>
          Direct Store Contacts &amp; Location
        </h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.88 }}>
          Speak directly with our store manager and sales specialists — open 7 days a week in Sivakasi.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: 9, background: C.accent, animation: 'pulseDot 1.6s infinite' }} />
          Store specialists ready to assist on Call &amp; WhatsApp
        </div>
      </div>

      {/* Store Location Card */}
      <div style={{ padding: '24px 0 0' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800 }}>Our Store Location</h2>
        {STORES.length > 1 && (
          <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12 }}>
            {STORES.map((s, i) => (
              <button
                key={s.name}
                className="tap"
                onClick={() => setActive(i)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 99,
                  fontWeight: 700,
                  fontSize: 12.5,
                  whiteSpace: 'nowrap',
                  background: active === i ? C.primary : '#fff',
                  color: active === i ? '#fff' : C.text,
                  border: `1px solid ${active === i ? C.primary : C.border}`,
                  transition: 'all .25s ease',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div
          key={active}
          style={{
            background: '#fff',
            borderRadius: 22,
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
            animation: 'fadeUp .4s ease',
          }}
        >
          {/* Stylised Map */}
          <div style={{ height: 150, position: 'relative', background: `linear-gradient(135deg, ${C.tint}, #fff)`, overflow: 'hidden' }}>
            <svg width="100%" height="150" viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden>
              <path d="M0 110 Q90 60 180 90 T360 50" stroke={C.border} strokeWidth="14" fill="none" />
              <path d="M60 0 L120 150" stroke={C.border} strokeWidth="10" fill="none" />
              <path d="M250 0 Q230 80 300 150" stroke={C.border} strokeWidth="10" fill="none" />
              <path d="M0 40 H360" stroke="#fff" strokeWidth="3" strokeDasharray="8 8" />
            </svg>
            <div style={{ position: 'absolute', left: '52%', top: 38, animation: 'floatSoft 2.2s ease-in-out infinite' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  background: C.danger,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 6px 14px rgba(229,72,77,.4)',
                }}
              >
                <span style={{ transform: 'rotate(45deg)', display: 'grid' }}>
                  <Icon name="phone" size={17} color="#fff" />
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: 18 }}>
            <Pill tone="accent">{store.tag.toUpperCase()}</Pill>
            <div style={{ fontWeight: 800, fontSize: 18, margin: '8px 0 4px' }}>{store.name}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, color: C.muted, marginBottom: 6 }}>
              <Icon name="pin" size={16} color={C.primary} /> {store.addr}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, color: C.muted, marginBottom: 14 }}>
              <Icon name="clock" size={16} color={C.primary} /> {store.hours}
            </div>
            <Btn
              full
              variant="light"
              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(store.addr)}`, '_blank')}
            >
              Get Directions <Icon name="external" size={15} />
            </Btn>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIRECT STORE CONTACT DIRECTORY (STORE MANAGER & SALES REP)                */}
      {/* ========================================================================= */}
      <div style={{ marginTop: 26 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: C.text }}>
            Store Key Personnel &amp; Direct Support
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
            Direct contact information for our Sivakasi showroom manager and sales representatives.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {storeContacts.map((c) => (
            <div
              key={c.role}
              style={{
                background: '#ffffff',
                borderRadius: 22,
                border: `1.5px solid ${C.border}`,
                padding: '22px 22px 20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(11,74,67,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      background: C.tint2,
                      color: C.primaryDark,
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    {c.roleBadge}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#16a34a' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: '#16a34a', animation: 'pulseDot 1.6s infinite' }} />
                    {c.status}
                  </div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {c.role}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: '2px 0 6px' }}>
                  {c.name}
                </div>

                <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.45, marginBottom: 16 }}>
                  {c.description}
                </div>

                {/* Mobile number display bar */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 14,
                    padding: '11px 16px',
                    border: `1px solid ${C.border}`,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Mobile Number:</span>
                  <a
                    href={`tel:${c.phone}`}
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: C.primary,
                      textDecoration: 'none',
                      letterSpacing: 0.3,
                    }}
                  >
                    {c.phone}
                  </a>
                </div>
              </div>

              {/* Action buttons (Direct Call & WhatsApp) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <a
                  href={`tel:${c.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`,
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13.5,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(11,74,67,0.22)',
                    transition: 'opacity .15s ease',
                  }}
                >
                  <Icon name="phone" size={16} />
                  <span>Call Now</span>
                </a>

                <a
                  href={`https://wa.me/91${c.rawPhone}?text=${encodeURIComponent(`Hi ${c.name}, I'm contacting Sastika Mobiles Sivakasi regarding mobile phone enquiry & support.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13.5,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
                    transition: 'opacity .15s ease',
                  }}
                >
                  <span>💬 WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Store Timings & Support Info Banner */}
        <div
          style={{
            marginTop: 18,
            padding: '16px 20px',
            borderRadius: 18,
            background: C.tint2,
            border: `1.5px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🕒</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.primaryDark }}>
                Direct Calling &amp; Showroom Hours
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 1 }}>
                Open 09:30 AM – 09:30 PM Every Day (Monday to Sunday) &bull; Sithurajapuram, Sivakasi
              </div>
            </div>
          </div>

          <a
            href="mailto:sastikamobiles.svk@gmail.com"
            style={{
              padding: '9px 18px',
              borderRadius: 12,
              background: '#ffffff',
              color: C.primaryDark,
              border: `1.5px solid ${C.border}`,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            ✉️ Email Store Support
          </a>
        </div>
      </div>
    </div>
  );
}
