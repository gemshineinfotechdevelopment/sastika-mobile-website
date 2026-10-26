import { useMemo, useState } from 'react';
import { C, money } from '../theme';
import { useStore } from '../store';
import type { OrderStatus } from '../types';
import Icon from '../components/Icon';
import { AButton, AdminTableScroll, Kpi, PageTitle, Tag, panel, td, th } from './ui';
import { orderTone } from './Dashboard';

const FLOW: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Delivered'];
const FILTERS: ('All' | OrderStatus)[] = ['All', 'Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<'All' | OrderStatus>('All');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState('');

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

      <div className="admin-kpi-grid">
        <Kpi icon="box" label="New orders" value={count('Placed')} tone="amber" delay={0} />
        <Kpi icon="grid" label="Packed · awaiting dispatch" value={count('Packed')} delay={70} />
        <Kpi icon="truck" label="In transit" value={count('Shipped')} delay={140} />
        <Kpi icon="check" label="Delivered" value={count('Delivered')} delay={210} />
      </div>

      <div className="admin-split-orders">
        <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .2s both' }}>
          <div style={{ display: 'flex', gap: 8, padding: '14px 16px', alignItems: 'center', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {FILTERS.map((f) => (
                <button key={f} className="tap" onClick={() => setFilter(f)} style={{ padding: '6px 12px', borderRadius: 99, fontWeight: 700, fontSize: 12, background: filter === f ? C.primary : C.tint, color: filter === f ? '#fff' : C.primary, transition: 'all .25s ease' }}>
                  {f}
                </button>
              ))}
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, customer, city…" style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 11, border: `1.5px solid ${C.border}`, flex: '1 1 180px', maxWidth: '100%', fontSize: 12.5 }} />
          </div>
          <AdminTableScroll>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
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
          </AdminTableScroll>
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

            {order.status === 'Cancelled' ? (
              <div style={{ padding: '12px 14px', borderRadius: 12, background: C.dangerSoft, border: `1.5px solid ${C.danger}40`, marginBottom: 14, color: C.danger }}>
                <div style={{ fontWeight: 850, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon name="alert" size={15} /> Order Cancelled
                </div>
                <div style={{ fontSize: 12.5, color: C.text }}>
                  <b>Reason:</b> {order.cancelReason || 'Cancelled by store administration'}
                </div>
              </div>
            ) : (
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
              {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                <AButton
                  variant="danger"
                  onClick={() => {
                    setCancellingOrderId(order.id);
                    setCancelReasonText('');
                  }}
                >
                  Cancel Order
                </AButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Reason Modal */}
      {cancellingOrderId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            padding: 16,
            backdropFilter: 'blur(3px)',
            animation: 'fadeIn .2s ease',
          }}
          onClick={() => setCancellingOrderId(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              border: `1.5px solid ${C.border}`,
              animation: 'scaleUp .25s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.dangerSoft, color: C.danger, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="alert" size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.primaryDark }}>Cancel Order {cancellingOrderId}</h3>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  Enter the cancellation description. This reason will be shown to the customer on the website.
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: C.text, marginBottom: 6 }}>
                Cancellation Reason / Description <span style={{ color: C.danger }}>*</span>
              </label>
              <textarea
                value={cancelReasonText}
                onChange={(e) => setCancelReasonText(e.target.value)}
                placeholder="e.g. Item out of stock in Sivakasi warehouse / Customer requested cancellation..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  borderRadius: 11,
                  border: `1.5px solid ${C.border}`,
                  background: '#fff',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* Quick Suggestion Chips */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                Quick Suggestions:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  'Customer requested cancellation',
                  'Item out of stock in warehouse',
                  'Delivery address unreachable',
                  'Pricing or billing discrepancy',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setCancelReasonText(txt)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: C.tint,
                      color: C.primary,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    + {txt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <AButton variant="ghost" onClick={() => setCancellingOrderId(null)}>
                Dismiss
              </AButton>
              <AButton
                variant="danger"
                onClick={() => {
                  const finalReason = cancelReasonText.trim() || 'Customer requested order cancellation';
                  updateOrderStatus(cancellingOrderId, 'Cancelled', finalReason);
                  setCancellingOrderId(null);
                }}
              >
                Confirm Cancellation
              </AButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
