import { useState } from 'react';
import { C, money } from '../theme';
import { useStore } from '../store';
import { FillBar } from '../components/anim';
import { AButton, FieldRow, Kpi, PageTitle, Tag, field, panel, td, th } from './ui';

interface PO {
  id: string;
  productId: string;
  name: string;
  qty: number;
  status: 'Sent' | 'Received';
}

export default function Inventory() {
  const { products, updateProduct } = useStore();
  const [pos, setPos] = useState<PO[]>([]);
  const [audit, setAudit] = useState({ id: products[0]?.id ?? '', type: 'add', qty: '1', note: '' });
  const [log, setLog] = useState<{ t: string; text: string }[]>([]);
  const [error, setError] = useState('');

  const low = products.filter((p) => p.stock <= p.reorderAt).sort((a, b) => a.stock / (a.reorderAt || 1) - b.stock / (b.reorderAt || 1));
  const units = products.reduce((n, p) => n + p.stock, 0);
  const value = products.reduce((n, p) => n + p.price * p.stock, 0);
  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const raisePO = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p || pos.some((o) => o.productId === id && o.status === 'Sent')) return;
    const qty = Math.max(10, p.reorderAt * 3 - p.stock);
    setPos((prev) => [{ id: 'PO-' + (2040 + prev.length), productId: id, name: p.name, qty, status: 'Sent' }, ...prev]);
    setLog((l) => [{ t: now(), text: `PO raised for ${qty} × ${p.name}` }, ...l]);
  };

  const receive = (po: PO) => {
    const p = products.find((x) => x.id === po.productId);
    if (!p) return;
    updateProduct(p.id, { stock: p.stock + po.qty });
    setPos((prev) => prev.map((o) => (o.id === po.id ? { ...o, status: 'Received' } : o)));
    setLog((l) => [{ t: now(), text: `Received ${po.qty} × ${po.name}` }, ...l]);
  };

  const submitAudit = () => {
    const p = products.find((x) => x.id === audit.id);
    const qty = Number(audit.qty);
    if (!p) return setError('Select a product');
    if (!(qty > 0)) return setError('Quantity must be greater than zero');
    const next = audit.type === 'add' ? p.stock + qty : audit.type === 'remove' ? p.stock - qty : qty;
    if (next < 0) return setError('Stock cannot go below zero');
    setError('');
    updateProduct(p.id, { stock: next });
    setLog((l) => [{ t: now(), text: `${audit.type === 'set' ? 'Set' : audit.type === 'add' ? 'Added' : 'Removed'} ${qty} · ${p.name} → ${next}${audit.note ? ` (${audit.note})` : ''}` }, ...l]);
    setAudit((a) => ({ ...a, qty: '1', note: '' }));
  };

  return (
    <div>
      <PageTitle title="Inventory Intelligence & Stock Alerts" sub="Track stock levels, raise purchase orders and audit movements." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        <Kpi icon="grid" label="Total units on hand" value={units} delay={0} />
        <Kpi icon="chart" label="Stock value" value={value} prefix="₹" delay={70} />
        <Kpi icon="alert" label="Below reorder level" value={low.length} tone={low.length ? 'red' : 'green'} delay={140} />
        <Kpi icon="truck" label="Open purchase orders" value={pos.filter((p) => p.status === 'Sent').length} tone="amber" delay={210} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ ...panel, animation: 'fadeUp .5s ease .2s both' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>Critical Low Stock & Auto-Reorder Queue</div>
            {low.length === 0 && <div style={{ color: C.muted, fontSize: 13.5 }}>All items are above their reorder levels.</div>}
            {low.map((p) => {
              const pct = Math.min(100, (p.stock / Math.max(1, p.reorderAt * 2)) * 100);
              const sent = pos.some((o) => o.productId === p.id && o.status === 'Sent');
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>{p.name}</div>
                    <FillBar pct={pct} color={p.stock === 0 ? C.danger : `linear-gradient(90deg, ${C.danger}, ${C.warn})`} bg={C.dangerSoft} />
                    <div style={{ fontSize: 11.5, color: C.danger, fontWeight: 700, marginTop: 5 }}>{p.stock} on hand · reorder at {p.reorderAt}</div>
                  </div>
                  {sent ? <Tag tone="blue">PO sent</Tag> : <AButton small variant="danger" onClick={() => raisePO(p.id)}>Raise PO</AButton>}
                </div>
              );
            })}
          </div>

          <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .3s both' }}>
            <div style={{ padding: '18px 20px 6px', fontWeight: 800, fontSize: 17 }}>Stock Ledger</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['PRODUCT', 'SKU', 'ON HAND', 'REORDER AT', 'VALUE', 'LEVEL'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="row-hover">
                    <td style={{ ...td, fontWeight: 700, maxWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 6, background: C.tint2, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 12, height: 12, borderRadius: 99, background: p.color, flexShrink: 0 }} />
                        )}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ ...td, color: C.muted, fontSize: 12 }}>{p.sku}</td>
                    <td style={{ ...td, fontWeight: 800 }}>{p.stock}</td>
                    <td style={td}>{p.reorderAt}</td>
                    <td style={td}>{money(p.price * p.stock)}</td>
                    <td style={{ ...td, width: 110 }}><FillBar pct={Math.min(100, (p.stock / Math.max(1, p.reorderAt * 4)) * 100)} color={p.stock <= p.reorderAt ? C.danger : C.success} bg={C.tint} height={7} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ ...panel, animation: 'fadeUp .5s ease .25s both' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>Quick Stock Audit</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <FieldRow label="PRODUCT">
                <select style={field} value={audit.id} onChange={(e) => setAudit((a) => ({ ...a, id: e.target.value }))}>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
                </select>
              </FieldRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldRow label="ADJUSTMENT">
                  <select style={field} value={audit.type} onChange={(e) => setAudit((a) => ({ ...a, type: e.target.value }))}>
                    <option value="add">Add stock</option>
                    <option value="remove">Remove stock</option>
                    <option value="set">Set exact count</option>
                  </select>
                </FieldRow>
                <FieldRow label="QUANTITY"><input style={field} type="number" min={0} value={audit.qty} onChange={(e) => setAudit((a) => ({ ...a, qty: e.target.value }))} /></FieldRow>
              </div>
              <FieldRow label="NOTE (optional)"><input style={field} value={audit.note} onChange={(e) => setAudit((a) => ({ ...a, note: e.target.value }))} placeholder="e.g. damaged in transit" /></FieldRow>
              {error && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 700 }}>{error}</div>}
              <AButton onClick={submitAudit}>Confirm Stock Movement</AButton>
            </div>
          </div>

          <div style={{ ...panel, animation: 'fadeUp .5s ease .35s both' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>Active Purchase Orders</div>
            {pos.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No purchase orders yet. Raise one from the low-stock queue.</div>}
            {pos.map((po) => (
              <div key={po.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}`, animation: 'fadeUp .3s ease' }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{po.id} · {po.qty} units<div style={{ fontSize: 11.5, color: C.muted, fontWeight: 500 }}>{po.name}</div></div>
                {po.status === 'Sent' ? <AButton small variant="accent" onClick={() => receive(po)}>Receive</AButton> : <Tag tone="green">Received</Tag>}
              </div>
            ))}
          </div>

          <div style={{ ...panel, animation: 'fadeUp .5s ease .4s both' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>Audit Log</div>
            {log.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Stock movements from this session appear here.</div>}
            {log.slice(0, 8).map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12.5, padding: '7px 0', borderBottom: `1px solid ${C.border}`, animation: 'fadeUp .3s ease' }}>
                <span style={{ color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{l.t}</span>
                <span style={{ fontWeight: 600 }}>{l.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
