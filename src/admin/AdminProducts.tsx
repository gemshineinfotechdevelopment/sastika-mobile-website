import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import { getUniqueProductBrands } from '../data';
import type { Category, Product } from '../types';
import {
  isSmartphone,
  isIPhone,
  isAccessory,
  isAppliance,
  getCategoryLabel,
  CATEGORY_OPTIONS,
} from '../categoryUtils';
import ProductArt from '../components/ProductArt';
import { AButton, AdminTableScroll, FieldRow, Kpi, Modal, PageTitle, Tag, field, panel, td, th } from './ui';

export function generateSku(brand?: string, name?: string): string {
  const b = (brand || 'SAS')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4) || 'SAS';
  const n = (name || '')
    .trim()
    .split(' ')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SKU-${b}${n ? '-' + n : ''}-${rand}`;
}

const SMARTPHONE_COLORS = [
  { name: 'Phantom Black', hex: '#18181b' },
  { name: 'Titanium Silver', hex: '#cbd5e1' },
  { name: 'Emerald Green', hex: '#2f7d6d' },
  { name: 'Deep Ocean Blue', hex: '#1d4ed8' },
  { name: 'Sunset Orange', hex: '#ea580c' },
  { name: 'Sunrise Gold', hex: '#eab308' },
  { name: 'Cosmic Violet', hex: '#7c3aed' },
  { name: 'Glacier White', hex: '#f8fafc' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Desert Titanium', hex: '#9a7b56' },
];

const STORAGE_PRESETS = [
  '4GB + 64GB',
  '6GB + 128GB',
  '8GB + 128GB',
  '8GB + 256GB',
  '12GB + 256GB',
  '12GB + 512GB',
  '16GB + 512GB',
  '1TB',
];

type Draft = {
  name: string;
  brand: string;
  category: Category;
  price: string;
  mrp: string;
  emi: string;
  enableEmi: boolean;
  stock: string;
  rating: string;
  sku: string;
  color: string;
  colors: string[];
  storage: string[];
  description: string;
  specs: string;
  image: string;
  reorderAt: string;
};

const getFreshDraft = (): Draft => ({
  name: '',
  brand: '',
  category: 'smartphones',
  price: '',
  mrp: '',
  emi: '',
  enableEmi: true,
  stock: '',
  rating: '4.8',
  sku: generateSku(),
  color: '#2f7d6d',
  colors: ['#2f7d6d', '#18181b'],
  storage: ['6GB + 128GB', '8GB + 256GB'],
  description: '',
  specs: '',
  image: '',
  reorderAt: '2',
});

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [cat, setCat] = useState<'all' | 'smartphones' | 'iphones' | 'accessories' | 'home-appliances'>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(params.get('new') === '1');
  const [confirmDel, setConfirmDel] = useState<Product | null>(null);

  useEffect(() => {
    setQ(params.get('q') ?? '');
    if (params.get('new') === '1') setCreating(true);
  }, [params]);

  const list = useMemo(
    () =>
      products.filter((p) => {
        const matchesCat =
          cat === 'all'
            ? true
            : cat === 'smartphones'
            ? isSmartphone(p.category, p.brand)
            : cat === 'iphones'
            ? isIPhone(p.category, p.brand)
            : cat === 'accessories'
            ? isAccessory(p.category)
            : isAppliance(p.category);
        const matchesQuery = (p.name + p.brand + p.sku).toLowerCase().includes(q.toLowerCase());
        return matchesCat && matchesQuery;
      }),
    [products, q, cat],
  );

  const flagged = products.filter((p) => p.stock <= (p.reorderAt ?? 2)).length;
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

      <div className="admin-kpi-grid">
        <Kpi icon="grid" label="Total products" value={products.length} delay={0} />
        <Kpi icon="phone" label="Smartphones" value={products.filter((p) => isSmartphone(p.category, p.brand)).length} delay={50} />
        <Kpi icon="phone" label="iPhones" value={products.filter((p) => isIPhone(p.category, p.brand)).length} delay={90} />
        <Kpi icon="headphones" label="Accessories" value={products.filter((p) => isAccessory(p.category)).length} delay={130} />
        <Kpi icon="tv" label="Home Appliances" value={products.filter((p) => isAppliance(p.category)).length} delay={170} />
        <Kpi icon="alert" label="Flagged low stock" value={flagged} tone={flagged ? 'red' : 'green'} delay={210} />
      </div>

      <div style={{ ...panel, padding: 0, animation: 'fadeUp .5s ease .2s both' }}>
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', alignItems: 'center', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, brand or SKU…" style={{ ...field, flex: '1 1 200px', maxWidth: '100%' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {([
              { k: 'all', label: 'All' },
              { k: 'smartphones', label: 'Smartphones' },
              { k: 'iphones', label: 'iPhones' },
              { k: 'accessories', label: 'Accessories' },
              { k: 'home-appliances', label: 'Home Appliances' },
            ] as const).map((c) => (
              <button
                key={c.k}
                className="tap"
                onClick={() => setCat(c.k as any)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 99,
                  fontWeight: 700,
                  fontSize: 12,
                  background: cat === c.k ? C.primary : C.tint,
                  color: cat === c.k ? '#fff' : C.primary,
                  transition: 'all .25s ease',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: C.muted, fontWeight: 700 }}>{list.length} shown</div>
        </div>
        <AdminTableScroll>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>{['PRODUCT', 'BRAND', 'SKU', 'PRICE & EMI', 'DISCOUNT', 'STOCK', 'STATUS', 'ACTIONS'].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((p, i) => {
              const pColors = p.colors && p.colors.length > 0 ? p.colors : [p.color];
              const emiVal = p.emi && p.emi > 0 ? p.emi : Math.round(p.price / 12);
              return (
                <tr key={p.id} className="row-hover" style={{ animation: `fadeUp .35s ease ${Math.min(i, 10) * 30}ms both` }}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 11, background: C.tint, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        <ProductArt category={p.category} color={p.color} size={40} image={p.image} alt={p.name} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, maxWidth: 260 }}>{p.name}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: 6 }}>
                            ★ {p.rating || 4.8}
                          </span>
                          {pColors.length > 0 && (
                            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                              {pColors.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  style={{ width: 9, height: 9, borderRadius: 99, background: c, border: '1px solid rgba(0,0,0,0.15)' }}
                                />
                              ))}
                              <span style={{ fontSize: 10.5, color: C.muted }}>{pColors.length} col</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{p.brand}</div>
                    <div style={{ marginTop: 3 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: C.tint, color: C.primary }}>
                        {getCategoryLabel(p.category, p.brand)}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...td, color: C.muted, fontSize: 12 }}>
                    <span style={{ background: '#f1f5f9', padding: '3px 7px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 600 }}>
                      {p.sku}
                    </span>
                  </td>
                  <td style={{ ...td }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{money(p.price)}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, textDecoration: 'line-through' }}>{money(p.mrp)}</div>
                    {p.emi && p.emi > 0 ? (
                      <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, marginTop: 1 }}>
                        EMI: ₹{p.emi.toLocaleString('en-IN')}/mo
                      </div>
                    ) : (
                      <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, marginTop: 1 }}>
                        No EMI
                      </div>
                    )}
                  </td>
                  <td style={td}><Tag tone="green">{discount(p.price, p.mrp)}% off</Tag></td>
                  <td style={{ ...td, fontWeight: 800, color: p.stock <= (p.reorderAt ?? 2) ? C.danger : C.text }}>{p.stock}</td>
                  <td style={td}>{p.stock === 0 ? <Tag tone="red">Out of stock</Tag> : p.stock <= (p.reorderAt ?? 2) ? <Tag tone="amber">Low stock</Tag> : <Tag tone="green">In stock</Tag>}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <AButton small variant="soft" onClick={() => setEditing(p)}>Edit</AButton>
                      <AButton small variant="danger" onClick={() => setConfirmDel(p)}>Delete</AButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </AdminTableScroll>
        {list.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No products match.</div>}
      </div>

      {creating && (
        <ProductForm
          title="Add New Product"
          initial={getFreshDraft()}
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
            emi: editing.emi && editing.emi > 0 ? String(editing.emi) : '',
            enableEmi: editing.emi !== undefined && editing.emi !== null ? Number(editing.emi) > 0 : true,
            stock: String(editing.stock),
            rating: String(editing.rating ?? 4.8),
            sku: editing.sku,
            color: editing.color,
            colors: editing.colors && editing.colors.length > 0 ? editing.colors : [editing.color],
            storage: editing.storage || (editing.category === 'phone' ? ['8GB + 128GB'] : []),
            description: editing.description,
            specs: editing.specs.join('\n'),
            image: editing.image || '',
            reorderAt: String(editing.reorderAt ?? 2),
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
  const mrp = Number(d.mrp) || price;
  const defaultEmi = price > 0 ? Math.round(price / 12) : 0;
  const customEmi = Number(d.emi);
  const finalEmi = d.enableEmi ? (customEmi > 0 ? customEmi : defaultEmi) : 0;
  const primaryColor = d.colors[0] || d.color || '#2f7d6d';
  return {
    name: d.name.trim(),
    brand: d.brand.trim() || 'Generic',
    category: d.category,
    price,
    mrp: Math.max(mrp, price),
    rating: Math.min(5, Math.max(1, parseFloat(d.rating) || 4.8)),
    reviews: 142,
    color: primaryColor,
    colors: d.colors.length > 0 ? d.colors : [primaryColor],
    badge: 'New',
    specs: d.specs.split('\n').map((s) => s.trim()).filter(Boolean),
    stock: Number(d.stock) || 0,
    reorderAt: Number(d.reorderAt) || 2,
    sku: d.sku.trim() || generateSku(d.brand, d.name),
    description: d.description.trim() || 'Genuine product with Sastikaa warranty.',
    image: d.image.trim() || undefined,
    storage: d.storage && d.storage.length > 0 ? d.storage : (isSmartphone(d.category, d.brand) || isIPhone(d.category, d.brand) ? ['8GB + 128GB'] : undefined),
    emi: finalEmi,
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
  const [customStorage, setCustomStorage] = useState('');
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  // Live discount calculations
  const priceNum = parseFloat(d.price) || 0;
  const mrpNum = parseFloat(d.mrp) || 0;
  const calculatedDiscount = (mrpNum > priceNum && priceNum > 0)
    ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
    : 0;
  const savedAmount = (mrpNum > priceNum && priceNum > 0) ? (mrpNum - priceNum) : 0;

  // Auto-calculated default EMI
  const defaultEmi = priceNum > 0 ? Math.round(priceNum / 12) : 0;

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

  // Color management (up to 3 colors)
  const addColor = () => {
    if (d.colors.length >= 3) return;
    const available = SMARTPHONE_COLORS.find((sc) => !d.colors.includes(sc.hex))?.hex || '#18181b';
    const nextColors = [...d.colors, available];
    set('colors', nextColors);
    setActiveColorIdx(nextColors.length - 1);
    set('color', available);
  };

  const updateColorAt = (idx: number, hex: string) => {
    const next = [...d.colors];
    next[idx] = hex;
    set('colors', next);
    if (idx === activeColorIdx || idx === 0) {
      set('color', hex);
    }
  };

  const removeColorAt = (idx: number) => {
    if (d.colors.length <= 1) return;
    const next = d.colors.filter((_, i) => i !== idx);
    set('colors', next);
    setActiveColorIdx(0);
    set('color', next[0]);
  };

  const handlePresetColorClick = (hex: string) => {
    if (d.colors.includes(hex)) {
      const existingIdx = d.colors.indexOf(hex);
      setActiveColorIdx(existingIdx);
      set('color', hex);
      return;
    }
    if (d.colors.length < 3) {
      const next = [...d.colors, hex];
      set('colors', next);
      setActiveColorIdx(next.length - 1);
      set('color', hex);
    } else {
      updateColorAt(activeColorIdx, hex);
    }
  };

  // Storage variant management
  const toggleStorage = (variant: string) => {
    const exists = d.storage.includes(variant);
    if (exists) {
      set('storage', d.storage.filter((s) => s !== variant));
    } else {
      set('storage', [...d.storage, variant]);
    }
  };

  const removeStorage = (variant: string) => {
    set('storage', d.storage.filter((s) => s !== variant));
  };

  const addCustomStorage = () => {
    const clean = customStorage.trim();
    if (!clean) return;
    if (!d.storage.includes(clean)) {
      set('storage', [...d.storage, clean]);
    }
    setCustomStorage('');
  };

  const submit = () => {
    if (d.name.trim().length < 3) return setError('Product name is required');
    if (!(Number(d.price) > 0)) return setError('Enter a valid selling price');
    if (Number(d.stock) < 0 || d.stock === '') return setError('Enter the opening stock quantity');
    const r = parseFloat(d.rating);
    if (isNaN(r) || r < 1 || r > 5) return setError('Enter a valid rating between 1.0 and 5.0 (e.g. 4.8)');
    onSubmit(d);
  };

  return (
    <Modal title={title} onClose={onClose} width={760}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="PRODUCT NAME *">
            <input
              style={field}
              value={d.name}
              onChange={(e) => {
                const newName = e.target.value;
                set('name', newName);
                if (!initial.name) {
                  // Only auto-update SKU on brand/name if creating fresh product
                  set('sku', generateSku(d.brand, newName));
                }
              }}
              placeholder="e.g. OnePlus 12 5G (16GB + 512GB)"
            />
          </FieldRow>
        </div>

        {/* Product Photo Upload Section */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="PRODUCT PHOTO / PICTURE">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: C.tint2, padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
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

              <div style={{ flex: '1 1 240px', minWidth: 0, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
                  style={{ ...field, fontSize: 12.5, padding: '7px 11px', width: '100%', boxSizing: 'border-box' }}
                  value={d.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="Or paste direct image URL (https://...)"
                />
              </div>
            </div>
          </FieldRow>
        </div>

        <FieldRow label="BRAND *">
          <input
            style={field}
            value={d.brand}
            onChange={(e) => {
              const newBrand = e.target.value;
              set('brand', newBrand);
              if (!initial.name) {
                set('sku', generateSku(newBrand, d.name));
              }
            }}
            placeholder="OnePlus, Apple, Samsung..."
            list="existing-brands-list"
          />
          <datalist id="existing-brands-list">
            {existingBrands.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </FieldRow>

        <FieldRow label="CATEGORY *">
          <select
            style={field}
            value={d.category}
            onChange={(e) => {
              const nextCat = e.target.value as Category;
              set('category', nextCat);
              if (nextCat === 'iphones' && !d.brand) {
                set('brand', 'Apple');
              }
            }}
          >
            <option value="smartphones">Smartphones</option>
            <option value="iphones">iPhones</option>
            <option value="accessories">Accessories</option>
            <option value="home-appliances">Home Appliances</option>
          </select>
        </FieldRow>

        {/* Pricing, Discount & EMI Section */}
        <div style={{ gridColumn: '1 / -1', background: '#fafdfb', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 12 }}>
            <FieldRow label="SELLING PRICE (₹) *">
              <input
                style={{ ...field, fontWeight: 700, fontSize: 15 }}
                type="number"
                min={0}
                value={d.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="e.g. 10009"
              />
            </FieldRow>

            <FieldRow label="MRP (₹) *">
              <input
                style={{ ...field, fontWeight: 700, fontSize: 15 }}
                type="number"
                min={0}
                value={d.mrp}
                onChange={(e) => set('mrp', e.target.value)}
                placeholder="e.g. 12999"
              />
            </FieldRow>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Monthly EMI Option
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !d.enableEmi;
                    set('enableEmi', next);
                    if (next && !d.emi && defaultEmi > 0) {
                      set('emi', String(defaultEmi));
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 99,
                    border: `1.5px solid ${d.enableEmi ? C.primary : '#cbd5e1'}`,
                    background: d.enableEmi ? C.primary : '#f1f5f9',
                    color: d.enableEmi ? '#fff' : '#64748b',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                  title="Toggle monthly EMI on/off"
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: d.enableEmi ? '#34d399' : '#94a3b8',
                      boxShadow: d.enableEmi ? '0 0 6px #34d399' : 'none',
                    }}
                  />
                  {d.enableEmi ? 'EMI ON' : 'EMI OFF'}
                </button>
              </div>

              {d.enableEmi ? (
                <div>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...field, paddingRight: 45, fontWeight: 700 }}
                      type="number"
                      min={0}
                      value={d.emi !== '' ? d.emi : defaultEmi > 0 ? String(defaultEmi) : ''}
                      onChange={(e) => set('emi', e.target.value)}
                      placeholder={defaultEmi > 0 ? String(defaultEmi) : 'e.g. 1099'}
                    />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.muted, fontWeight: 700 }}>
                      /mo
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: C.primary, marginTop: 4, fontWeight: 600 }}>
                    {d.emi && Number(d.emi) !== defaultEmi
                      ? `✓ Custom EMI: ₹${Number(d.emi).toLocaleString('en-IN')}/mo (Static default was ₹${defaultEmi.toLocaleString('en-IN')})`
                      : defaultEmi > 0
                      ? `✓ Static default: ₹${defaultEmi.toLocaleString('en-IN')}/mo (Type to change if needed)`
                      : 'Active on storefront'}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    color: '#64748b',
                    fontSize: 11.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>🚫</span>
                  <span><strong>EMI is OFF</strong> · No EMI badge will be shown to users.</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Live Calculated Discount Banner */}
          {calculatedDiscount > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                background: C.successSoft,
                border: `1.5px solid ${C.success}`,
                color: C.success,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800 }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <span>
                  Calculated Discount: <strong style={{ fontSize: 15, textDecoration: 'underline' }}>{calculatedDiscount}% DISCOUNT</strong>
                  <span style={{ fontWeight: 600, marginLeft: 8, color: '#166534' }}>
                    (Customer saves ₹{savedAmount.toLocaleString('en-IN')})
                  </span>
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#166534' }}>
                MRP ₹{mrpNum.toLocaleString('en-IN')} → Offer ₹{priceNum.toLocaleString('en-IN')}
              </div>
            </div>
          ) : priceNum > mrpNum && mrpNum > 0 ? (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                background: C.dangerSoft,
                border: `1px solid ${C.danger}`,
                color: C.danger,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ⚠️ Selling price (₹{priceNum}) is higher than MRP (₹{mrpNum}). Please verify amounts.
            </div>
          ) : (
            <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
              💡 Enter Selling Price & MRP above to see real-time calculated discount percentage and savings.
            </div>
          )}
        </div>

        <FieldRow label="OPENING STOCK *">
          <input style={field} type="number" min={0} value={d.stock} onChange={(e) => set('stock', e.target.value)} />
        </FieldRow>

        {/* Rating instead of Reorder Level */}
        <FieldRow label="RATING (★ 1.0 - 5.0) *">
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...field, paddingRight: 40, fontWeight: 700 }}
              type="number"
              step="0.1"
              min={1.0}
              max={5.0}
              value={d.rating}
              onChange={(e) => set('rating', e.target.value)}
              placeholder="e.g. 4.8"
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#f59e0b', fontSize: 16 }}>
              ★
            </span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            Directly controls the star rating shown on the website storefront
          </div>
        </FieldRow>

        {/* SKU / Model Code: Non-editable & Auto-generated */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="SKU / MODEL CODE (Auto-generated & Non-editable)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
                <input
                  style={{
                    ...field,
                    background: '#f8fafc',
                    color: '#334155',
                    fontWeight: 700,
                    cursor: 'not-allowed',
                    border: '1.5px dashed #cbd5e1',
                    paddingLeft: 34,
                    letterSpacing: 0.8,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  value={d.sku}
                  readOnly
                  tabIndex={-1}
                  placeholder="Auto-generated"
                />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#64748b' }}>
                  🔒
                </span>
              </div>
              <AButton
                small
                variant="ghost"
                type="button"
                onClick={() => set('sku', generateSku(d.brand, d.name))}
                title="Regenerate a new unique SKU"
              >
                🔄 Regenerate
              </AButton>
              <Tag tone="gray">Locked</Tag>
            </div>
          </FieldRow>
        </div>

        {/* Finish Colours Section: Mobile Colours + Select 2 or 3 colors */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="FINISH COLOURS (Select & Add up to 2-3 mobile shades)">
            <div style={{ background: C.tint2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
              {/* Selected colors active row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>
                  Selected Colours ({d.colors.length}/3):
                </div>
                {d.colors.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 10px',
                      borderRadius: 10,
                      background: '#fff',
                      border: `2px solid ${activeColorIdx === idx ? C.primary : C.border}`,
                      boxShadow: activeColorIdx === idx ? `0 0 0 2px ${C.tint}` : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setActiveColorIdx(idx);
                      set('color', c);
                    }}
                  >
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => updateColorAt(idx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      title="Fine-tune with color picker"
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{c.toUpperCase()}</span>
                    {idx === 0 && <span style={{ fontSize: 9.5, background: C.primary, color: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>Primary</span>}
                    {d.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColorAt(idx);
                        }}
                        style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 13, padding: '0 2px' }}
                        title="Remove this colour"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {d.colors.length < 3 && (
                  <button
                    type="button"
                    className="tap"
                    onClick={addColor}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: `1.5px dashed ${C.primary}`,
                      background: '#fff',
                      color: C.primary,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    + Add Colour ({d.colors.length}/3)
                  </button>
                )}
              </div>

              {/* Curated Popular Smartphone Color Finishes */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: 0.4 }}>
                  POPULAR MOBILE FINISHES (Click to apply / add to phone):
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {SMARTPHONE_COLORS.map((sc) => {
                    const isSelected = d.colors.includes(sc.hex);
                    return (
                      <button
                        key={sc.hex}
                        type="button"
                        className="tap"
                        onClick={() => handlePresetColorClick(sc.hex)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 10px',
                          borderRadius: 99,
                          background: isSelected ? C.primary : '#fff',
                          color: isSelected ? '#fff' : C.text,
                          border: `1.5px solid ${isSelected ? C.primary : C.border}`,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all .2s ease',
                        }}
                      >
                        <span style={{ width: 12, height: 12, borderRadius: 99, background: sc.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                        {sc.name}
                        {isSelected && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </FieldRow>
        </div>

        {/* Storage Variants Section */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="STORAGE VARIANTS (Select or add phone storage options)">
            <div style={{ background: C.tint2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
              {/* Selected variants badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>
                  Active Storage Variants:
                </div>
                {d.storage && d.storage.length > 0 ? (
                  d.storage.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 10px',
                        borderRadius: 8,
                        background: C.primary,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeStorage(s)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}
                        title="Remove variant"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                    No variants selected yet (click presets below)
                  </span>
                )}
              </div>

              {/* Presets */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: 0.4 }}>
                  COMMON SMARTPHONE STORAGE PRESETS:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {STORAGE_PRESETS.map((preset) => {
                    const hasIt = d.storage.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        className="tap"
                        onClick={() => toggleStorage(preset)}
                        style={{
                          padding: '5px 11px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: hasIt ? C.primary : '#fff',
                          color: hasIt ? '#fff' : C.text,
                          border: `1.5px solid ${hasIt ? C.primary : C.border}`,
                          transition: 'all .2s ease',
                        }}
                      >
                        {preset} {hasIt ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom variant entry */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  style={{ ...field, maxWidth: 220, padding: '7px 11px', fontSize: 12.5 }}
                  value={customStorage}
                  onChange={(e) => setCustomStorage(e.target.value)}
                  placeholder="e.g. 16GB + 1TB"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomStorage();
                    }
                  }}
                />
                <AButton small variant="soft" onClick={addCustomStorage}>
                  + Add Custom Variant
                </AButton>
              </div>
            </div>
          </FieldRow>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="KEY SPECS (one per line)">
            <textarea
              style={{ ...field, minHeight: 74, resize: 'vertical' }}
              value={d.specs}
              onChange={(e) => set('specs', e.target.value)}
              placeholder={'Snapdragon 8 Gen 3\n50MP OIS Camera\n5400mAh • 100W Charging'}
            />
          </FieldRow>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="DESCRIPTION">
            <textarea
              style={{ ...field, minHeight: 58, resize: 'vertical' }}
              value={d.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </FieldRow>
        </div>
      </div>

      {error && <div style={{ color: C.danger, fontWeight: 700, fontSize: 13, marginTop: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap', paddingBottom: 8 }}>
        <AButton variant="ghost" onClick={onClose}>Discard</AButton>
        <AButton onClick={submit}>{submitLabel}</AButton>
      </div>
    </Modal>
  );
}
