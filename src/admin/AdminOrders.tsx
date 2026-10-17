import { useMemo, useState } from 'react';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { OrderStatus } from '../types';
import Icon from '../components/Icon';
import { AButton, Kpi, PageTitle, Tag, panel, td, th } from './ui';
import { orderTone } from './Dashboard';

const FLOW: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Delivered'];
const FILTERS: ('All' | OrderStatus)[] = ['All', 'Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<'All' | OrderStatus>('All');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);

  const list = useMemo(
    () => orders.filter((o) => (filter === 'All' || o.status === filter) && (o.id + o.customer + o.city).toLowerCase().includes(q.toLowerCase())),
    [orders, filter, q],
  );
  const order = orders.find((o) => o.id === sel) ?? list[0];
  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
  const stage = order ? FLOW.indexOf(order.status) : -1;

  return (
    <div>
      <PageTitle
        title="Orders & Dispatch Fulfilment"
        sub="Live processing for storefront orders across Tamil Nadu."
        actions={<AButton variant="ghost" onClick={() => window.print()}><Icon name="download" size={15} /> Print Queue</AButton>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        <Kpi icon="box" label="New orders" value={count('Placed')} tone="amber" delay={0} />
        <Kpi icon="grid" label="Packed · awaiting dispatch" value={count('Packed')} delay={70} />
        <Kpi icon="truck" label="In transit" value={count('Shipped')} delay={140} />
        <Kpi icon="check" label="Delivered" value={count('Delivered')} delay={210} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .2s both' }}>
          <div style={{ display: 'flex', gap: 8, padding: 16, alignItems: 'center', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button key={f} className="tap" onClick={() => setFilter(f)} style={{ padding: '7px 13px', borderRadius: 99, fontWeight: 700, fontSize: 12.5, background: filter === f ? C.primary : C.tint, color: filter === f ? '#fff' : C.primary, transition: 'all .25s ease' }}>
                {f}
              </button>
            ))}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, customer, city…" style={{ marginLeft: 'auto', padding: '9px 12px', borderRadius: 11, border: `1.5px solid ${C.border}`, width: 240, fontSize: 13 }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['ORDER', 'CUSTOMER', 'DATE', 'PAYMENT', 'AMOUNT', 'STATUS'].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="row-hover" onClick={() => setSel(o.id)} style={{ cursor: 'pointer', background: order?.id === o.id ? C.tint2 : undefined }}>
                  <td style={{ ...td, fontWeight: 800 }}>{o.id}</td>
                  <td style={td}>{o.customer}<div style={{ fontSize: 11, color: C.muted }}>{o.city}</div></td>
                  <td style={{ ...td, color: C.muted }}>{o.date}</td>
                  <td style={td}><Tag tone="gray">{o.payment}</Tag></td>
                  <td style={{ ...td, fontWeight: 800 }}>{money(o.total)}</td>
                  <td style={td}><Tag tone={orderTone(o.status)}>{o.status}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No orders in this view.</div>}
        </div>

        {order && (
          <div key={order.id} style={{ ...panel, position: 'sticky', top: 84, animation: 'fadeUp .4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Order {order.id}</div>
              <Tag tone={orderTone(order.status)}>{order.status}</Tag>
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, margin: '4px 0 14px' }}>{order.date} · paid via {order.payment}</div>

            <div style={{ padding: 12, borderRadius: 12, background: C.tint2, fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
              <b>{order.customer}</b><br />{order.phone}<br />{order.address}
            </div>

            {order.status !== 'Cancelled' && (
              <div style={{ margin: '0 0 16px' }}>
                {FLOW.map((s, i) => (
                  <div key={s} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 99, background: i <= stage ? C.success : '#fff', border: `2px solid ${i <= stage ? C.success : C.border}`, display: 'grid', placeItems: 'center', transition: 'all .4s ease' }}>
                        {i <= stage && <Icon name="check" size={11} color="#fff" stroke={3.5} />}
                      </div>
                      {i < FLOW.length - 1 && <div style={{ width: 2, height: 22, background: i < stage ? C.success : C.border, transition: 'background .4s ease' }} />}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: i <= stage ? 800 : 600, color: i <= stage ? C.text : C.muted, paddingBottom: 10 }}>{s}</div>
                  </div>
                ))}
              </div>
            )}

            {order.items.map((it) => (
              <div key={it.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
                <span>{it.name} × {it.qty}</span>
                <b>{money(it.price * it.qty)}</b>
              </div>
            ))}
            <div style={{ borderTop: `1px dashed ${C.border}`, marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}>
              <span>Total</span><span>{money(order.total)}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {order.status === 'Placed' && <AButton onClick={() => updateOrderStatus(order.id, 'Packed')}>Mark as Packed</AButton>}
              {order.status === 'Packed' && <AButton variant="accent" onClick={() => updateOrderStatus(order.id, 'Shipped')}>Dispatch Shipment</AButton>}
              {order.status === 'Shipped' && <AButton onClick={() => updateOrderStatus(order.id, 'Delivered')}>Mark Delivered</AButton>}
              {(order.status === 'Placed' || order.status === 'Packed') && <AButton variant="danger" onClick={() => updateOrderStatus(order.id, 'Cancelled')}>Cancel Order</AButton>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
