import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import { getUniqueProductBrands } from '../data';
import type { Category, Product } from '../types';
import ProductArt from '../components/ProductArt';
import { AButton, FieldRow, Kpi, Modal, PageTitle, Tag, field, panel, td, th } from './ui';

type Draft = {
  name: string;
  brand: string;
  category: Category;
  price: string;
  mrp: string;
  stock: string;
  reorderAt: string;
  sku: string;
  color: string;
  description: string;
  specs: string;
  image: string;
};

const EMPTY: Draft = {
  name: '',
  brand: '',
  category: 'phone',
  price: '',
  mrp: '',
  stock: '',
  reorderAt: '10',
  sku: '',
  color: '#2f7d6d',
  description: '',
  specs: '',
  image: '',
};

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [cat, setCat] = useState<'all' | Category>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(params.get('new') === '1');
  const [confirmDel, setConfirmDel] = useState<Product | null>(null);
  const existingBrands = useMemo(() => getUniqueProductBrands(products), [products]);

  useEffect(() => {
    setQ(params.get('q') ?? '');
    if (params.get('new') === '1') setCreating(true);
  }, [params]);

  const list = useMemo(
    () =>
      products.filter(
        (p) => (cat === 'all' || p.category === cat) && (p.name + p.brand + p.sku).toLowerCase().includes(q.toLowerCase()),
      ),
    [products, q, cat],
  );

  const flagged = products.filter((p) => p.stock <= p.reorderAt).length;
  const close = () => {
    setCreating(false);
    setEditing(null);
    if (params.get('new')) setParams({});
  };

  return (
    <div>
      <PageTitle
        title="Product Catalog & Inventory Management"
        sub="Manage mobiles, accessories and audio. Changes appear on the storefront instantly."
        actions={<AButton onClick={() => setCreating(true)}>+ Add New Product</AButton>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        <Kpi icon="grid" label="Total products" value={products.length} delay={0} />
        <Kpi icon="phone" label="Smartphones" value={products.filter((p) => p.category === 'phone').length} delay={70} />
        <Kpi icon="headphones" label="Accessories & audio" value={products.filter((p) => p.category !== 'phone').length} delay={140} />
        <Kpi icon="alert" label="Flagged low stock" value={flagged} tone={flagged ? 'red' : 'green'} delay={210} />
      </div>

      <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .2s both' }}>
        <div style={{ display: 'flex', gap: 10, padding: 16, alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, brand or SKU…" style={{ ...field, maxWidth: 340 }} />
          {(['all', 'phone', 'accessory', 'audio'] as const).map((c) => (
            <button key={c} className="tap" onClick={() => setCat(c)} style={{ padding: '8px 14px', borderRadius: 99, fontWeight: 700, fontSize: 12.5, textTransform: 'capitalize', background: cat === c ? C.primary : C.tint, color: cat === c ? '#fff' : C.primary, transition: 'all .25s ease' }}>
              {c === 'all' ? 'All products' : c === 'phone' ? 'Smartphones' : c === 'audio' ? 'Audio' : 'Accessories'}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12.5, color: C.muted, fontWeight: 600 }}>{list.length} shown</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['PRODUCT', 'BRAND', 'SKU', 'PRICE', 'DISCOUNT', 'STOCK', 'STATUS', 'ACTIONS'].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((p, i) => (
              <tr key={p.id} className="row-hover" style={{ animation: `fadeUp .35s ease ${Math.min(i, 10) * 30}ms both` }}>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 11, background: C.tint, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      <ProductArt category={p.category} color={p.color} size={40} image={p.image} alt={p.name} />
                    </div>
                    <div style={{ fontWeight: 700, maxWidth: 260 }}>{p.name}</div>
                  </div>
                </td>
                <td style={td}>{p.brand}</td>
                <td style={{ ...td, color: C.muted, fontSize: 12 }}>{p.sku}</td>
                <td style={{ ...td, fontWeight: 800 }}>{money(p.price)}<div style={{ fontSize: 11, color: C.muted, fontWeight: 500, textDecoration: 'line-through' }}>{money(p.mrp)}</div></td>
                <td style={td}><Tag tone="green">{discount(p.price, p.mrp)}% off</Tag></td>
                <td style={{ ...td, fontWeight: 800, color: p.stock <= p.reorderAt ? C.danger : C.text }}>{p.stock}</td>
                <td style={td}>{p.stock === 0 ? <Tag tone="red">Out of stock</Tag> : p.stock <= p.reorderAt ? <Tag tone="amber">Low stock</Tag> : <Tag tone="green">In stock</Tag>}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <AButton small variant="soft" onClick={() => setEditing(p)}>Edit</AButton>
                    <AButton small variant="danger" onClick={() => setConfirmDel(p)}>Delete</AButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No products match.</div>}
      </div>

      {creating && (
        <ProductForm
          title="Add New Product"
          initial={EMPTY}
          submitLabel="Publish to Catalog"
          onClose={close}
          onSubmit={(d) => {
            addProduct(toProduct(d));
            close();
          }}
        />
      )}
      {editing && (
        <ProductForm
          title={`Edit · ${editing.name}`}
          initial={{
            name: editing.name,
            brand: editing.brand,
            category: editing.category,
            price: String(editing.price),
            mrp: String(editing.mrp),
            stock: String(editing.stock),
            reorderAt: String(editing.reorderAt),
            sku: editing.sku,
            color: editing.color,
            description: editing.description,
            specs: editing.specs.join('\n'),
            image: editing.image || '',
          }}
          submitLabel="Save Changes"
          onClose={close}
          onSubmit={(d) => {
            const { ...rest } = toProduct(d);
            updateProduct(editing.id, rest);
            close();
          }}
        />
      )}
      {confirmDel && (
        <Modal title="Confirm deletion" onClose={() => setConfirmDel(null)} width={420}>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>
            Are you sure you want to delete <strong>{confirmDel.name}</strong>? This removes it from the store catalog.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <AButton variant="ghost" onClick={() => setConfirmDel(null)}>Cancel</AButton>
            <AButton
              variant="danger"
              onClick={() => {
                deleteProduct(confirmDel.id);
                setConfirmDel(null);
              }}
            >
              Delete
            </AButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function toProduct(d: Draft): Omit<Product, 'id'> {
  const price = Number(d.price) || 0;
  return {
    name: d.name.trim(),
    brand: d.brand.trim() || 'Generic',
    category: d.category,
    price,
    mrp: Math.max(Number(d.mrp) || price, price),
    rating: 4.5,
    reviews: 0,
    color: d.color,
    badge: 'New',
    specs: d.specs.split('\n').map((s) => s.trim()).filter(Boolean),
    stock: Number(d.stock) || 0,
    reorderAt: Number(d.reorderAt) || 0,
    sku: d.sku.trim() || 'SKU-' + Date.now().toString(36).toUpperCase(),
    description: d.description.trim() || 'Genuine product with Sastika warranty.',
    image: d.image.trim() || undefined,
  };
}

function ProductForm({
  title,
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: Draft;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (d: Draft) => void;
}) {
  const { products } = useStore();
  const existingBrands = useMemo(() => getUniqueProductBrands(products), [products]);
  const [d, setD] = useState<Draft>(initial);
  const [error, setError] = useState('');
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        set('image', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (d.name.trim().length < 3) return setError('Product name is required');
    if (!(Number(d.price) > 0)) return setError('Enter a valid selling price');
    if (Number(d.stock) < 0 || d.stock === '') return setError('Enter the opening stock quantity');
    onSubmit(d);
  };

  return (
    <Modal title={title} onClose={onClose} width={740}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="PRODUCT NAME">
            <input style={field} value={d.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. OnePlus 12 5G (16GB + 512GB)" />
          </FieldRow>
        </div>

        {/* Product Photo Upload Section */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="PRODUCT PHOTO / PICTURE">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: C.tint2, padding: 12, borderRadius: 14, border: `1px solid ${C.border}` }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: '#fff',
                  border: `1.5px dashed ${C.border}`,
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <ProductArt category={d.category} color={d.color} size={64} image={d.image} alt={d.name} />
              </div>

              <div style={{ flex: 1, minWidth: 240, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: C.primary,
                      color: '#fff',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📁 Choose Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  {d.image && (
                    <AButton small variant="ghost" onClick={() => set('image', '')}>
                      ✕ Remove
                    </AButton>
                  )}
                  <span style={{ fontSize: 11.5, color: C.muted }}>PNG, JPG or WebP</span>
                </div>

                <input
                  style={{ ...field, fontSize: 12.5, padding: '7px 11px' }}
                  value={d.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="Or paste direct image URL (https://...)"
                />
              </div>
            </div>
          </FieldRow>
        </div>

        <FieldRow label="BRAND">
          <input
            style={field}
            value={d.brand}
            onChange={(e) => set('brand', e.target.value)}
            placeholder="OnePlus, Apple, Samsung..."
            list="existing-brands-list"
          />
          <datalist id="existing-brands-list">
            {existingBrands.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </FieldRow>

        <FieldRow label="CATEGORY">
          <select style={field} value={d.category} onChange={(e) => set('category', e.target.value as Category)}>
            <option value="phone">Smartphone</option>
            <option value="accessory">Accessory</option>
            <option value="audio">Audio</option>
          </select>
        </FieldRow>

        <FieldRow label="SELLING PRICE (₹)">
          <input style={field} type="number" min={0} value={d.price} onChange={(e) => set('price', e.target.value)} />
        </FieldRow>

        <FieldRow label="MRP (₹)">
          <input style={field} type="number" min={0} value={d.mrp} onChange={(e) => set('mrp', e.target.value)} />
        </FieldRow>

        <FieldRow label="OPENING STOCK">
          <input style={field} type="number" min={0} value={d.stock} onChange={(e) => set('stock', e.target.value)} />
        </FieldRow>

        <FieldRow label="REORDER LEVEL">
          <input style={field} type="number" min={0} value={d.reorderAt} onChange={(e) => set('reorderAt', e.target.value)} />
        </FieldRow>

        <FieldRow label="SKU / MODEL CODE">
          <input style={field} value={d.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Auto-generated if empty" />
        </FieldRow>

        <FieldRow label="FINISH COLOUR">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="color" value={d.color} onChange={(e) => set('color', e.target.value)} style={{ width: 52, height: 42, border: 'none', background: 'none', padding: 0 }} />
            <div style={{ width: 52, height: 42, display: 'grid', placeItems: 'center', background: C.tint, borderRadius: 10 }}>
              <ProductArt category={d.category} color={d.color} size={34} image={d.image} />
            </div>
          </div>
        </FieldRow>

        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="KEY SPECS (one per line)">
            <textarea style={{ ...field, minHeight: 74, resize: 'vertical' }} value={d.specs} onChange={(e) => set('specs', e.target.value)} placeholder={'Snapdragon 8 Gen 3\n50MP OIS Camera\n5400mAh • 100W Charging'} />
          </FieldRow>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="DESCRIPTION">
            <textarea style={{ ...field, minHeight: 58, resize: 'vertical' }} value={d.description} onChange={(e) => set('description', e.target.value)} />
          </FieldRow>
        </div>
      </div>

      {error && <div style={{ color: C.danger, fontWeight: 700, fontSize: 13, marginTop: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
        <AButton variant="ghost" onClick={onClose}>Discard</AButton>
        <AButton onClick={submit}>{submitLabel}</AButton>
      </div>
    </Modal>
  );
}
