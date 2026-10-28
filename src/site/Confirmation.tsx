import { useNavigate, useParams } from 'react-router-dom';
import { C, money } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import { Btn } from './ui';
import logoImg from '../assets/logo.png';

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 7) * 0.12,
  color: [C.accent, C.primarySoft, C.success, '#fff', C.danger][i % 5],
  size: 6 + (i % 4) * 2,
  dur: 1.8 + (i % 5) * 0.3,
}));

export default function Confirmation() {
  const { id } = useParams();
  const orderId = decodeURIComponent(id ?? '');
  const nav = useNavigate();
  const { orders, logo } = useStore();
  const order = orders.find((o) => o.id === orderId);

  const steps = ['Confirmed', 'Packing', 'Shipped', 'Delivered'];

  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${C.primaryDark}, ${C.primarySoft})`, color: '#fff', padding: '42px 22px 36px', textAlign: 'center', borderRadius: '0 0 32px 32px' }}>
        {CONFETTI.map((c, i) => (
          <span key={i} style={{ position: 'absolute', top: 0, left: `${c.left}%`, width: c.size, height: c.size * 1.6, background: c.color, borderRadius: 2, animation: `confetti ${c.dur}s ease-in ${c.delay}s both` }} />
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 16 }}>
          <img
            src={logo || logoImg}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = logoImg; }}
            alt="Sastikaa Mobiles"
            style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #d4af37', objectFit: 'cover', background: '#fff' }}
          />
          <span style={{ fontWeight: 900, fontSize: 13.5, letterSpacing: 1, color: '#fff' }}>SASTIKAA MOBILES</span>
        </div>
        <div style={{ width: 84, height: 84, borderRadius: 99, background: C.accent, margin: '0 auto 16px', display: 'grid', placeItems: 'center', animation: 'bounceIn .7s ease both', boxShadow: '0 0 0 10px rgba(246,196,69,.2)' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.primaryDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" strokeDasharray="30" strokeDashoffset="30" style={{ animation: 'draw .6s ease .5s forwards' }} />
          </svg>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: C.accent, animation: 'fadeUp .5s ease .5s both' }}>PAYMENT CONFIRMED</div>
        <h1 style={{ margin: '8px 0 6px', fontSize: 28, fontWeight: 800, letterSpacing: -0.6, animation: 'fadeUp .5s ease .6s both' }}>Thank you!<br />Your order is confirmed</h1>
        <div style={{ fontSize: 13, opacity: 0.85, animation: 'fadeUp .5s ease .7s both' }}>Order {orderId}</div>
      </div>

      <div style={{ padding: '18px 18px 0' }}>
        <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, padding: 16, animation: 'fadeUp .5s ease .8s both' }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="truck" size={18} color={C.primary} /> Arriving tomorrow, 2:00 PM
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 99, background: i === 0 ? C.success : '#fff', border: `2px solid ${i === 0 ? C.success : C.border}`, display: 'grid', placeItems: 'center' }}>
                    {i === 0 && <Icon name="check" size={12} color="#fff" stroke={3.5} />}
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: i === 0 ? C.success : C.muted }}>{s}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 2, background: C.border, margin: '0 4px 14px' }} />}
              </div>
            ))}
          </div>
        </div>

        {order && (
          <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, padding: 16, marginTop: 12, animation: 'fadeUp .5s ease .95s both' }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Order summary</div>
            {order.items.map((it) => (
              <div key={it.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0' }}>
                <span>{it.name} × {it.qty}</span>
                <b>{money(it.price * it.qty)}</b>
              </div>
            ))}
            <div style={{ borderTop: `1px dashed ${C.border}`, marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}>
              <span>Total paid</span>
              <span>{money(order.total)}</span>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>Paid via {order.payment} · {order.address}</div>
          </div>
        )}

        <div style={{ display: 'grid', gap: 10, marginTop: 16, animation: 'fadeUp .5s ease 1.1s both' }}>
          <Btn full onClick={() => nav('/account')}>Track Order</Btn>
          <Btn full variant="light" onClick={() => nav('/')}>Continue Shopping</Btn>
        </div>
      </div>
    </div>
  );
}
