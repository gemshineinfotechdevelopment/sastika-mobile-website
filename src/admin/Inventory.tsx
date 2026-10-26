import { useState } from 'react';
import { C, money } from '../theme';
import { useStore } from '../store';
import { FillBar } from '../components/anim';
import Icon from '../components/Icon';
import { AButton, AdminTableScroll, FieldRow, Kpi, Modal, PageTitle, field, panel, td, th } from './ui';

export default function Inventory() {
  const { products, updateProduct } = useStore();
  const [audit, setAudit] = useState({ id: products[0]?.id ?? '', type: 'add', qty: '1', note: '' });
  const [error, setError] = useState('');
  const [stockModalProduct, setStockModalProduct] = useState<(typeof products)[0] | null>(null);
  const [stockModalQty, setStockModalQty] = useState('10');
  const [stockModalError, setStockModalError] = useState('');

  const low = products.filter((p) => p.stock <= p.reorderAt).sort((a, b) => a.stock / (a.reorderAt || 1) - b.stock / (b.reorderAt || 1));
  const units = products.reduce((n, p) => n + p.stock, 0);
  const value = products.reduce((n, p) => n + p.price * p.stock, 0);

  const handleConfirmAddStock = () => {
    if (!stockModalProduct) return;
    const qty = parseInt(stockModalQty, 10);
    if (!qty || qty <= 0) {
      setStockModalError('Please enter a valid quantity greater than zero');
      return;
    }
    updateProduct(stockModalProduct.id, { stock: stockModalProduct.stock + qty });
    setStockModalProduct(null);
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
    setAudit((a) => ({ ...a, qty: '1', note: '' }));
  };

  return (
    <div>
      <PageTitle title="Inventory Intelligence & Stock Alerts" sub="Track stock levels, add stock and audit inventory movements." />

      <div className="admin-kpi-grid">
        <Kpi icon="grid" label="Total units on hand" value={units} delay={0} />
        <Kpi icon="chart" label="Stock value" value={value} prefix="₹" delay={70} />
        <Kpi icon="alert" label="Below reorder level" value={low.length} tone={low.length ? 'red' : 'green'} delay={140} />
        <Kpi icon="truck" label="Restock required" value={low.length} tone={low.length ? 'amber' : 'green'} delay={210} />
      </div>

      <div className="admin-split-inventory">
        <div style={{ display: 'grid', gap: 16, minWidth: 0, maxWidth: '100%' }}>
          <div style={{ ...panel, animation: 'fadeUp .5s ease .2s both', minWidth: 0, maxWidth: '100%' }}>
            <div style={{ fontWeight: 800, fontSize: 'clamp(15px, 3.5vw, 17px)', marginBottom: 14, wordBreak: 'break-word' }}>
              Critical Low Stock & Auto-Reorder Queue
            </div>
            {low.length === 0 && <div style={{ color: C.muted, fontSize: 13.5 }}>All items are above their reorder levels.</div>}
            {low.map((p) => {
              const pct = Math.min(100, (p.stock / Math.max(1, p.reorderAt * 2)) * 100);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: `1px solid ${C.border}`,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6, wordBreak: 'break-word' }}>{p.name}</div>
                    <FillBar pct={pct} color={p.stock === 0 ? C.danger : `linear-gradient(90deg, ${C.danger}, ${C.warn})`} bg={C.dangerSoft} />
                    <div style={{ fontSize: 11.5, color: C.danger, fontWeight: 700, marginTop: 5 }}>
                      {p.stock} on hand · reorder at {p.reorderAt}
                    </div>
                  </div>
                  <AButton
                    small
                    variant="primary"
                    style={{ flexShrink: 0 }}
                    onClick={() => {
                      setStockModalProduct(p);
                      setStockModalQty(String(Math.max(5, p.reorderAt * 2)));
                      setStockModalError('');
                    }}
                  >
                    <Icon name="plus" size={13} /> Add Stock
                  </AButton>
                </div>
              );
            })}
          </div>

          <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .3s both', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 6px', fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <span>Stock Ledger</span>
              <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>👈 Swipe side to side to view 👉</span>
            </div>
            <AdminTableScroll>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
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
                          <span style={{ wordBreak: 'break-word' }}>{p.name}</span>
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
            </AdminTableScroll>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16, minWidth: 0, maxWidth: '100%' }}>
          <div style={{ ...panel, animation: 'fadeUp .5s ease .25s both', minWidth: 0, maxWidth: '100%' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>Quick Stock Audit</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <FieldRow label="PRODUCT">
                <select style={field} value={audit.id} onChange={(e) => setAudit((a) => ({ ...a, id: e.target.value }))}>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
                </select>
              </FieldRow>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
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
        </div>
      </div>

      {stockModalProduct && (
        <Modal title={`Add Stock — ${stockModalProduct.name}`} onClose={() => setStockModalProduct(null)} width={460}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.tint2, borderRadius: 12 }}>
              {stockModalProduct.image ? (
                <img src={stockModalProduct.image} alt={stockModalProduct.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: '#fff' }} />
              ) : (
                <div style={{ width: 16, height: 16, borderRadius: 99, background: stockModalProduct.color }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{stockModalProduct.name}</div>
                <div style={{ fontSize: 12, color: C.danger, fontWeight: 700, marginTop: 2 }}>
                  Current Stock: {stockModalProduct.stock} on hand · Reorder level: {stockModalProduct.reorderAt}
                </div>
              </div>
            </div>

            <FieldRow label="QUANTITY TO ADD">
              <input
                style={field}
                type="number"
                min={1}
                autoFocus
                value={stockModalQty}
                onChange={(e) => setStockModalQty(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddStock()}
                placeholder="e.g. 10"
              />
            </FieldRow>

            {stockModalError && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 700 }}>{stockModalError}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <AButton variant="ghost" onClick={() => setStockModalProduct(null)}>Cancel</AButton>
              <AButton variant="primary" onClick={handleConfirmAddStock}><Icon name="plus" size={14} /> Add Stock</AButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
