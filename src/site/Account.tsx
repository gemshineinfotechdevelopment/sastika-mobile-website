import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { OrderStatus } from '../types';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { CountUp, Reveal } from '../components/anim';
import { Btn, Pill } from './ui';
import ProductCard from './ProductCard';

const FLOW: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Delivered'];

export default function Account() {
  const nav = useNavigate();
  const { orders, wishlist, products, tickets, cartCount } = useStore();
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'service'>('orders');
  const [open, setOpen] = useState<string | null>(orders[0]?.id ?? null);

  const wished = products.filter((p) => wishlist.includes(p.id));
  const tone = (s: OrderStatus) => (s === 'Delivered' ? 'success' : s === 'Cancelled' ? 'danger' : s === 'Shipped' ? 'accent' : 'tint');

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 24, background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primarySoft})`, color: '#fff', animation: 'fadeUp .5s ease both' }}>
          <div style={{ width: 58, height: 58, borderRadius: 99, background: C.accent, color: C.primaryDark, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 800 }}>R</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Rajesh Kumar</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>+91 98401 23456</div>
            <div style={{ marginTop: 6 }}><Pill tone="accent">GOLD CLUB MEMBER</Pill></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {[
            { v: orders.length, l: 'Orders' },
            { v: wishlist.length, l: 'Wishlist' },
            { v: 1250, l: 'Coins' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 90} dir="zoom">
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '12px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}><CountUp to={s.v} duration={1000} /></div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {cartCount > 0 && (
          <button className="tap" onClick={() => nav('/cart')} style={{ width: '100%', marginTop: 12, padding: 12, borderRadius: 14, background: C.warnSoft, color: C.warn, fontWeight: 800, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>You have {cartCount} item{cartCount > 1 ? 's' : ''} in your cart</span>
            <Icon name="right" size={16} />
          </button>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 6, background: C.tint, padding: 4, borderRadius: 14 }}>
          {([['orders', 'Orders'], ['wishlist', 'Saved'], ['service', 'Service']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '10px 0', borderRadius: 11, fontWeight: 800, fontSize: 12.5, background: tab === k ? '#fff' : 'transparent', color: tab === k ? C.primary : C.muted, boxShadow: tab === k ? '0 2px 8px rgba(11,74,67,.1)' : 'none', transition: 'all .25s ease' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} style={{ padding: '14px 18px 0', animation: 'fadeUp .35s ease both' }}>
        {tab === 'orders' &&
          orders.map((o, idx) => {
            const isOpen = open === o.id;
            const stage = FLOW.indexOf(o.status);
            const first = products.find((p) => p.id === o.items[0]?.productId);
            return (
              <div key={o.id} style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, marginBottom: 10, overflow: 'hidden', animation: `fadeUp .4s ease ${idx * 60}ms both` }}>
                <button onClick={() => setOpen(isOpen ? null : o.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, textAlign: 'left' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: C.tint, display: 'grid', placeItems: 'center' }}>
                    {first && <ProductArt category={first.category} color={first.color} size={44} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5 }}>{o.id}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items.map((i) => i.name).join(', ')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{money(o.total)}</div>
                    <Pill tone={tone(o.status)}>{o.status.toUpperCase()}</Pill>
                  </div>
                </button>
                <div style={{ maxHeight: isOpen ? 220 : 0, transition: 'max-height .45s ease', overflow: 'hidden' }}>
                  <div style={{ padding: '4px 16px 16px' }}>
                    {o.status === 'Cancelled' ? (
                      <div style={{ color: C.danger, fontWeight: 700, fontSize: 13 }}>This order was cancelled. Refund initiated.</div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {FLOW.map((s, i) => (
                          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{ width: 22, height: 22, borderRadius: 99, background: i <= stage ? C.success : '#fff', border: `2px solid ${i <= stage ? C.success : C.border}`, display: 'grid', placeItems: 'center' }}>
                                {i <= stage && <Icon name="check" size={12} color="#fff" stroke={3.5} />}
                              </div>
                              <span style={{ fontSize: 9.5, fontWeight: 700, color: i <= stage ? C.success : C.muted }}>{s}</span>
                            </div>
                            {i < 3 && <div style={{ flex: 1, height: 3, margin: '0 4px 14px', background: i < stage ? C.success : C.border, borderRadius: 9 }} />}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12 }}>{o.address} · {o.payment} · {o.date}</div>
                  </div>
                </div>
              </div>
            );
          })}

        {tab === 'wishlist' &&
          (wished.length === 0 ? (
            <Empty icon="heart" text="Tap the heart on any product to save it here." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {wished.map((p) => <ProductCard key={p.id} p={p} compact />)}
            </div>
          ))}

        {tab === 'service' &&
          (tickets.length === 0 ? (
            <Empty icon="tool" text="No service tickets yet." />
          ) : (
            <>
              {tickets.map((t, i) => (
                <div key={t.id} style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, padding: 14, marginBottom: 10, animation: `fadeUp .4s ease ${i * 60}ms both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: 13.5 }}>#{t.id}</b>
                    <Pill tone={t.status === 'Ready' || t.status === 'Closed' ? 'success' : t.status === 'In Progress' ? 'accent' : 'tint'}>{t.status.toUpperCase()}</Pill>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>{t.device}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.issue}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={13} /> {t.eta} · {t.tech}</div>
                </div>
              ))}
              <Btn full variant="light" onClick={() => nav('/services')}>Book a New Service</Btn>
            </>
          ))}
      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: 'heart' | 'tool'; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
      <Icon name={icon} size={36} style={{ margin: '0 auto 8px', display: 'block', animation: 'floatSoft 3s ease-in-out infinite' }} />
      <div style={{ fontSize: 13, fontWeight: 600 }}>{text}</div>
    </div>
  );
}
