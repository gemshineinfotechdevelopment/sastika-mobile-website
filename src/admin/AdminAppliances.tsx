import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import type { Product } from '../types';
import { isAppliance } from '../categoryUtils';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { AButton, AdminTableScroll, FieldRow, Kpi, Modal, PageTitle, Tag, field, panel, td, th } from './ui';
import { generateSku } from './AdminProducts';

const COMMON_BRANDS = ['LG', 'Samsung', 'Whirlpool', 'Daikin', 'Philips', 'IFB', 'Haier', 'Godrej', 'Sony', 'Prestige', 'Voltas', 'Bosch'];

type ApplianceDraft = {
  name: string;
  brand: string;
  subCategory: string;
  price: string;
  mrp: string;
  emi: string;
  stock: string;
  rating: string;
  sku: string;
  color: string;
  badge: string;
  image: string;
  images: string[];
  description: string;
  specs: string;
  reorderAt: string;
};

const getFreshDraft = (): ApplianceDraft => ({
  name: '',
  brand: '',
  subCategory: '',
  price: '',
  mrp: '',
  emi: '',
  stock: '5',
  rating: '4.8',
  sku: generateSku('APP', 'ITEM'),
  color: '#1e293b',
  badge: '',
  image: '',
  images: [],
  description: '',
  specs: 'Doorstep Free Express Delivery in Sivakasi\n100% Brand Manufacturer Warranty\nEnergy Efficient Inverter Technology',
  reorderAt: '2',
});

export default function AdminAppliances() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [brandFilter, setBrandFilter] = useState('All');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDel, setConfirmDel] = useState<Product | null>(null);

  // Filter only appliances
  const appliances = useMemo(() => products.filter((p) => isAppliance(p.category)), [products]);

  // Extract unique brands
  const brands = useMemo(() => {
    const s = new Set<string>();
    appliances.forEach((a) => {
      if (a.brand) s.add(a.brand.trim());
    });
    return ['All', ...Array.from(s)];
  }, [appliances]);

  const list = useMemo(() => {
    return appliances.filter((a) => {
      const matchBrand = brandFilter === 'All' || a.brand.toLowerCase() === brandFilter.toLowerCase();
      const matchQuery =
        !q.trim() ||
        (a.name + ' ' + a.brand + ' ' + a.sku + ' ' + (a.description || '')).toLowerCase().includes(q.trim().toLowerCase());
      return matchBrand && matchQuery;
    });
  }, [appliances, brandFilter, q]);

  const inStockCount = appliances.filter((a) => a.stock > 0).length;
  const lowStockCount = appliances.filter((a) => a.stock <= (a.reorderAt ?? 2)).length;
  const totalValue = appliances.reduce((sum, a) => sum + a.price * a.stock, 0);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div>
      <PageTitle
        title="Home Appliances Management"
        sub="Publish and manage Smart TVs, Refrigerators, Washing Machines, ACs and Kitchen Appliances."
        actions={
          <AButton onClick={() => setCreating(true)}>
            <span style={{ fontSize: 16 }}>+</span> Add New Appliance
          </AButton>
        }
      />

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <Kpi icon="tv" label="Total Appliances" value={appliances.length} tone="green" delay={0} />
        <Kpi icon="box" label="Available in Stock" value={inStockCount} tone="green" delay={70} />
        <Kpi icon="alert" label="Low / Reorder Stock" value={lowStockCount} tone="amber" delay={140} />
        <Kpi icon="chart" label="Total Inventory Value" value={Math.round(totalValue / 1000)} prefix="₹" suffix="k" tone="green" delay={210} />
      </div>

      {/* Main Panel */}
      <div style={{ ...panel, padding: 0 }}>
        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: '14px 16px',
            alignItems: 'center',
            borderBottom: `1px solid ${C.border}`,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
              <Icon name="search" size={15} />
            </span>
            <input
              style={{ ...field, paddingLeft: 32, fontSize: 13 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by appliance name, brand, or SKU..."
            />
            {q && (
              <button
                onClick={() => setQ('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: C.muted,
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div
            className="admin-appliances-brand-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: '1 1 300px',
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: C.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                flexShrink: 0,
              }}
            >
              Brand:
            </span>
            <div
              className="admin-appliances-brand-scroll"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                flex: 1,
                minWidth: 0,
                paddingBottom: 6,
                paddingTop: 3,
              }}
            >
              {brands.map((b) => (
                <button
                  key={b}
                  className="tap"
                  onClick={() => setBrandFilter(b)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    background: brandFilter === b ? C.tint2 : '#fff',
                    color: brandFilter === b ? C.primary : C.muted,
                    border: `1.5px solid ${brandFilter === b ? C.primary : C.border}`,
                    transition: 'all .2s ease',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appliances Table */}
        <AdminTableScroll>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 840 }}>
            <thead>
              <tr>
                <th style={th}>Appliance</th>
                <th style={th}>Brand</th>
                <th style={th}>Price / MRP</th>
                <th style={th}>Stock</th>
                <th style={th}>Rating</th>
                <th style={th}>Specs Preview</th>
                <th style={{ ...th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const off = discount(a.price, a.mrp);
                const isLow = a.stock <= (a.reorderAt ?? 2);
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background .15s ease' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            background: '#f8fafc',
                            border: `1px solid ${C.border}`,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ProductArt category="appliance" color={a.color || '#1e293b'} image={a.image} size={42} alt={a.name} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: C.text }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: C.muted, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span>SKU: {a.sku}</span>
                            {a.badge && (
                              <span style={{ background: C.tint2, color: C.primary, padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
                                {a.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <Tag tone="blue">{a.brand}</Tag>
                    </td>
                    <td style={td}>
                      <div>
                        <b style={{ fontSize: 14 }}>{money(a.price)}</b>
                        {off > 0 && (
                          <div style={{ fontSize: 11, color: C.muted }}>
                            <span style={{ textDecoration: 'line-through' }}>{money(a.mrp)}</span> ·{' '}
                            <span style={{ color: C.success, fontWeight: 700 }}>{off}% off</span>
                          </div>
                        )}
                        {a.emi ? (
                          <div style={{ fontSize: 10.5, color: C.primary, fontWeight: 700 }}>EMI: {money(a.emi)}/mo</div>
                        ) : null}
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 800,
                            background: a.stock === 0 ? C.dangerSoft : isLow ? '#fef3c7' : C.successSoft,
                            color: a.stock === 0 ? C.danger : isLow ? '#92400e' : C.success,
                          }}
                        >
                          {a.stock === 0 ? 'Out of Stock' : `${a.stock} in stock`}
                        </span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button
                            onClick={() => updateProduct(a.id, { stock: Math.max(0, a.stock - 1) })}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 4,
                              background: '#f1f5f9',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 800,
                            }}
                            title="Decrease stock"
                          >
                            −
                          </button>
                          <button
                            onClick={() => updateProduct(a.id, { stock: a.stock + 1 })}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 4,
                              background: '#f1f5f9',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 800,
                            }}
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 12.5 }}>
                        <span style={{ color: '#f59e0b' }}>★</span>
                        <span>{a.rating?.toFixed(1) ?? '4.8'}</span>
                        <span style={{ color: C.muted, fontSize: 11 }}>({a.reviews ?? 0})</span>
                      </div>
                    </td>
                    <td style={{ ...td, maxWidth: 220 }}>
                      <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.specs && a.specs.length > 0 ? a.specs.slice(0, 2).join(' • ') : a.description || 'No specs added'}
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <AButton small variant="ghost" onClick={() => setEditing(a)}>
                          Edit
                        </AButton>
                        <AButton small variant="danger" onClick={() => setConfirmDel(a)}>
                          Delete
                        </AButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTableScroll>

        {list.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📺</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>No home appliances match your filter</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Click "+ Add New Appliance" above to publish your first appliance.</div>
          </div>
        )}
      </div>

      {/* Add Appliance Modal */}
      {creating && (
        <ApplianceFormModal
          title="Add New Home Appliance"
          initial={getFreshDraft()}
          submitLabel="Publish to Storefront"
          onClose={closeForm}
          onSubmit={(draft) => {
            const allImages = (draft.images && draft.images.length > 0 ? draft.images : [draft.image]).filter(Boolean);
            addProduct({
              name: draft.name.trim(),
              brand: draft.brand.trim(),
              subCategory: draft.subCategory.trim() || 'Appliance',
              category: 'home-appliances',
              price: Number(draft.price) || 0,
              mrp: Number(draft.mrp) || Number(draft.price) || 0,
              emi: Number(draft.emi) || (Number(draft.price) ? Math.round(Number(draft.price) / 12) : undefined),
              stock: Number(draft.stock) || 0,
              reorderAt: Number(draft.reorderAt) || 2,
              rating: Number(draft.rating) || 4.8,
              reviews: 12,
              sku: draft.sku || generateSku(draft.brand, draft.name),
              color: draft.color || '#1e293b',
              badge: draft.badge || draft.subCategory || 'Home Appliance',
              image: allImages[0] || draft.image,
              images: allImages,
              description: draft.description.trim(),
              specs: draft.specs
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            });
            closeForm();
          }}
        />
      )}

      {/* Edit Appliance Modal */}
      {editing && (
        <ApplianceFormModal
          title={`Edit Appliance · ${editing.name}`}
          initial={{
            name: editing.name,
            brand: editing.brand,
            subCategory: editing.subCategory || editing.badge || 'Smart TV',
            price: String(editing.price),
            mrp: String(editing.mrp),
            emi: editing.emi ? String(editing.emi) : '',
            stock: String(editing.stock),
            rating: String(editing.rating ?? 4.8),
            sku: editing.sku,
            color: editing.color || '#1e293b',
            badge: editing.badge || '',
            image: editing.image || '',
            images: editing.images && editing.images.length > 0 ? editing.images : [editing.image || ''].filter(Boolean),
            description: editing.description || '',
            specs: (editing.specs || []).join('\n'),
            reorderAt: String(editing.reorderAt ?? 2),
          }}
          submitLabel="Save Changes"
          onClose={closeForm}
          onSubmit={(draft) => {
            const allImages = (draft.images && draft.images.length > 0 ? draft.images : [draft.image]).filter(Boolean);
            updateProduct(editing.id, {
              name: draft.name.trim(),
              brand: draft.brand.trim(),
              subCategory: draft.subCategory.trim() || 'Appliance',
              price: Number(draft.price) || 0,
              mrp: Number(draft.mrp) || Number(draft.price) || 0,
              emi: Number(draft.emi) || (Number(draft.price) ? Math.round(Number(draft.price) / 12) : undefined),
              stock: Number(draft.stock) || 0,
              reorderAt: Number(draft.reorderAt) || 2,
              rating: Number(draft.rating) || 4.8,
              sku: draft.sku,
              color: draft.color || '#1e293b',
              badge: draft.badge || draft.subCategory || 'Home Appliance',
              image: allImages[0] || draft.image,
              images: allImages,
              description: draft.description.trim(),
              specs: draft.specs
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            });
            closeForm();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDel && (
        <Modal title="Confirm Deletion" onClose={() => setConfirmDel(null)} width={420}>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>
            Are you sure you want to remove <strong>{confirmDel.name}</strong> from home appliances? This will remove it from the customer storefront.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <AButton variant="ghost" onClick={() => setConfirmDel(null)}>
              Cancel
            </AButton>
            <AButton
              variant="danger"
              onClick={() => {
                deleteProduct(confirmDel.id);
                setConfirmDel(null);
              }}
            >
              Delete Appliance
            </AButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ----------------- Appliance Form Modal Component -----------------
function ApplianceFormModal({
  title,
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: ApplianceDraft;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (d: ApplianceDraft) => void;
}) {
  const [d, setD] = useState<ApplianceDraft>(initial);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [images, setImages] = useState<string[]>(() => {
    return (initial.images && initial.images.length > 0 ? initial.images : [initial.image || ''])
      .filter((s) => s && s.trim().length > 0)
      .slice(0, 3);
  });
  const [urlInput, setUrlInput] = useState('');

  const set = (k: keyof ApplianceDraft, v: string) => {
    if (error) setError('');
    setD((prev) => ({ ...prev, [k]: v }));
  };

  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList).slice(0, 3);
    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        setError('Please select valid image files (PNG, JPG, WebP)');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError(`Image "${file.name}" is too large (maximum 8MB allowed)`);
        return;
      }
    }

    setUploadLoading(true);
    const readers = filesArray.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error('Failed reading file'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((dataUrls) => {
        const valid = dataUrls.filter(Boolean).slice(0, 3);
        setImages(valid);
        setD((prev) => ({
          ...prev,
          images: valid,
          image: valid[0] || '',
        }));
        setUploadLoading(false);
        setError('');
      })
      .catch(() => {
        setError('Failed to upload image files');
        setUploadLoading(false);
      });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    setD((prev) => ({
      ...prev,
      images: next,
      image: next[0] || '',
    }));
  };

  const addImageUrl = () => {
    const clean = urlInput.trim();
    if (!clean) return;
    if (images.length >= 3) {
      setError('Maximum 3 images allowed for 1 product');
      return;
    }
    const next = [...images, clean].slice(0, 3);
    setImages(next);
    setD((prev) => ({
      ...prev,
      images: next,
      image: next[0] || '',
    }));
    setUrlInput('');
    setError('');
  };

  const priceNum = Number(d.price) || 0;
  const mrpNum = Number(d.mrp) || 0;
  const calculatedDiscount = discount(priceNum, mrpNum);
  const savedAmount = Math.max(0, mrpNum - priceNum);
  const autoEmi = priceNum > 0 ? Math.round(priceNum / 12) : 0;

  const submit = () => {
    const validImgs = images.filter((s) => s && s.trim().length > 0);
    if (!d.name.trim()) return setError('Please enter appliance name / model title');
    if (!d.brand.trim()) return setError('Please enter brand name');
    if (!d.subCategory.trim()) return setError('Please type appliance category / type (e.g. Smart TV, Refrigerator, Washing Machine)');
    if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0) return setError('Please enter valid selling price');
    if (!d.mrp || isNaN(Number(d.mrp)) || Number(d.mrp) <= 0) return setError('Please enter valid MRP');
    if (Number(d.price) > Number(d.mrp)) return setError('Selling price cannot be greater than MRP');
    if (validImgs.length === 0 && !d.image.trim()) return setError('Please upload at least 1 product image');

    onSubmit({
      ...d,
      image: validImgs[0] || d.image,
      images: validImgs,
    });
  };

  return (
    <Modal title={title} onClose={onClose} width={760}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {/* Name / Title */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="APPLIANCE NAME & MODEL *">
            <input
              style={field}
              value={d.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. LG 43-inch 4K Ultra HD Smart LED TV (43UR7500PSC)"
              autoFocus
            />
          </FieldRow>
        </div>

        {/* Brand - Manual Type with datalist */}
        <FieldRow label="BRAND NAME (Type Any Brand) *">
          <input
            style={field}
            value={d.brand}
            onChange={(e) => set('brand', e.target.value)}
            placeholder="Type brand name (e.g. Samsung, LG, Bosch, Sony, Haier...)"
            list="appliance-brands-list"
          />
          <datalist id="appliance-brands-list">
            {COMMON_BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </FieldRow>

        {/* Highlight Badge */}
        <FieldRow label="PROMO BADGE">
          <input
            style={field}
            value={d.badge}
            onChange={(e) => set('badge', e.target.value)}
            placeholder="e.g. 4K Ultra HD, 5-Star EcoWash, Frost Free"
          />
        </FieldRow>

        {/* Multi-Image Section (Select up to 3 images at once, no presets!) */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: '#f8fafc',
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: 0.3 }}>
                PRODUCT IMAGES (Upload 1, 2, or 3 Images at Once) *
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                1 time-le 3 images varai select panni upload pannalam. Only uploaded images will be attached to this product.
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                color: images.length > 0 ? C.primary : C.muted,
                fontWeight: 800,
                background: images.length > 0 ? C.tint2 : '#f1f5f9',
                padding: '4px 10px',
                borderRadius: 8,
              }}
            >
              {images.length} / 3 Images Uploaded
            </div>
          </div>

          {/* Big Upload Area (allows selecting up to 3 files at once) */}
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '18px 20px',
              borderRadius: 14,
              border: `2px dashed ${uploadLoading ? C.muted : C.primary}`,
              background: uploadLoading ? '#f1f5f9' : '#f0fdf4',
              cursor: uploadLoading ? 'wait' : 'pointer',
              textAlign: 'center',
              marginBottom: 14,
              transition: 'all .2s ease',
            }}
          >
            <span style={{ fontSize: 30 }}>{uploadLoading ? '⏳' : '📁'}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.primary }}>
                {uploadLoading
                  ? 'Processing and uploading your images...'
                  : 'Click Here to Upload Images (Select up to 3 photos together)'}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                PNG, JPG, WebP supported · Shift/Ctrl key hold panni 2 or 3 images select pannalam
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleMultipleFileUpload}
              style={{ display: 'none' }}
              disabled={uploadLoading}
            />
          </label>

          {/* Uploaded Images Preview Cards */}
          {images.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {[0, 1, 2].map((slotIdx) => {
                const imgUrl = images[slotIdx];
                if (imgUrl) {
                  return (
                    <div
                      key={slotIdx}
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        border: `2px solid ${slotIdx === 0 ? C.primary : C.border}`,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        boxShadow: slotIdx === 0 ? `0 2px 8px ${C.primarySoft}` : '0 1px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          fontSize: 10,
                          fontWeight: 800,
                          background: slotIdx === 0 ? C.primary : '#475569',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: 6,
                          letterSpacing: 0.4,
                        }}
                      >
                        {slotIdx === 0 ? '★ Image 1 (Cover)' : `Image ${slotIdx + 1} (Slide)`}
                      </span>

                      <div
                        style={{
                          width: '100%',
                          height: 120,
                          borderRadius: 8,
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginTop: 20,
                          marginBottom: 8,
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Uploaded ${slotIdx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(slotIdx)}
                        style={{
                          width: '100%',
                          padding: '5px 0',
                          background: '#fee2e2',
                          color: C.danger,
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Remove Photo
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={slotIdx}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      border: '1.5px dashed #cbd5e1',
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 160,
                      color: C.muted,
                    }}
                  >
                    <span style={{ fontSize: 24, marginBottom: 4 }}>📷</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700 }}>Slot {slotIdx + 1} Empty</span>
                    <span style={{ fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 2 }}>
                      Upload 3 images to fill
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 20px',
                background: '#fff',
                borderRadius: 12,
                border: '1px dashed #cbd5e1',
                color: C.muted,
                fontSize: 12,
              }}
            >
              ⚠️ No images uploaded yet. Click the green upload box above to select 1 to 3 images from your computer.
            </div>
          )}

          {/* Optional Direct URL Input if needed */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
              Or add image via URL:
            </span>
            <input
              style={{ ...field, fontSize: 12, padding: '7px 10px', flex: 1 }}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste direct https:// image URL..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={addImageUrl}
              disabled={!urlInput.trim() || images.length >= 3}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                background: urlInput.trim() && images.length < 3 ? C.primary : '#cbd5e1',
                color: '#fff',
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: urlInput.trim() && images.length < 3 ? 'pointer' : 'default',
              }}
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Category / Sub-category Manual Typing Field (Right below image section!) */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="APPLIANCE CATEGORY / TYPE (Type Manually) *">
            <input
              style={{ ...field, fontWeight: 700 }}
              value={d.subCategory}
              onChange={(e) => set('subCategory', e.target.value)}
              placeholder="e.g. Smart TV, Double Door Refrigerator, Front Load Washing Machine, Split AC, Microwave Oven, Mixer Grinder..."
              required
            />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Type any category manually (select dropdown venam, type pannikalam). This will be saved and shown on the website.
            </div>
          </FieldRow>
        </div>


        {/* Pricing, Discount & Savings */}
        <div style={{ gridColumn: '1 / -1', background: '#fafdfb', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 10 }}>
            <FieldRow label="SELLING PRICE (₹) *">
              <input
                style={{ ...field, fontWeight: 700, fontSize: 15 }}
                type="number"
                min={0}
                value={d.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="e.g. 28990"
              />
            </FieldRow>

            <FieldRow label="MRP (₹) *">
              <input
                style={{ ...field, fontWeight: 700, fontSize: 15 }}
                type="number"
                min={0}
                value={d.mrp}
                onChange={(e) => set('mrp', e.target.value)}
                placeholder="e.g. 49990"
              />
            </FieldRow>

            <FieldRow label="MONTHLY EMI (₹ / month)">
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...field, paddingRight: 45, fontWeight: 700 }}
                  type="number"
                  min={0}
                  value={d.emi}
                  onChange={(e) => set('emi', e.target.value)}
                  placeholder={autoEmi > 0 ? String(autoEmi) : 'e.g. 2415'}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.muted, fontWeight: 700 }}>
                  /mo
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4 }}>
                {d.emi ? `Custom EMI: ₹${Number(d.emi).toLocaleString('en-IN')}/mo` : autoEmi > 0 ? `Auto: ₹${autoEmi.toLocaleString('en-IN')}/mo (12 mo)` : 'Auto-calculated'}
              </div>
            </FieldRow>
          </div>

          {/* Live Discount Calculation Banner */}
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
                <span>🎉</span>
                <span>Calculated Discount: <strong>{calculatedDiscount}% OFF</strong> (Customer saves ₹{savedAmount.toLocaleString('en-IN')})</span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#166534' }}>
                MRP ₹{mrpNum.toLocaleString('en-IN')} → Offer ₹{priceNum.toLocaleString('en-IN')}
              </div>
            </div>
          ) : priceNum > mrpNum && mrpNum > 0 ? (
            <div style={{ padding: '8px 12px', borderRadius: 10, background: C.dangerSoft, color: C.danger, fontSize: 12, fontWeight: 700 }}>
              ⚠️ Selling price cannot be higher than MRP.
            </div>
          ) : null}
        </div>

        {/* Stock & Rating */}
        <FieldRow label="OPENING STOCK *">
          <input
            style={field}
            type="number"
            min={0}
            value={d.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="Units available"
          />
        </FieldRow>

        <FieldRow label="STOREFRONT RATING (★ 1.0 - 5.0)">
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...field, paddingRight: 36, fontWeight: 700 }}
              type="number"
              step="0.1"
              min={1.0}
              max={5.0}
              value={d.rating}
              onChange={(e) => set('rating', e.target.value)}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#f59e0b', fontSize: 16 }}>
              ★
            </span>
          </div>
        </FieldRow>

        {/* Auto-generated SKU */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="SKU / INVENTORY CODE (Auto-generated)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                style={{ ...field, background: '#f8fafc', color: '#334155', fontWeight: 700, flex: 1, cursor: 'not-allowed' }}
                value={d.sku}
                readOnly
              />
              <AButton small variant="ghost" type="button" onClick={() => set('sku', generateSku(d.brand, d.name))}>
                🔄 Regenerate
              </AButton>
            </div>
          </FieldRow>
        </div>

        {/* Features / Specifications */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="FEATURES & SPECIFICATIONS (One per line) *">
            <textarea
              style={{ ...field, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
              value={d.specs}
              onChange={(e) => set('specs', e.target.value)}
              placeholder={'4K Ultra HD (3840x2160) Resolution\nDigital Inverter Technology (50% Less Power)\n5 Star Energy Efficiency Rating\nDoorstep Express Delivery in Sivakasi'}
            />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Enter key bullet points to highlight on the product page and cards.
            </div>
          </FieldRow>
        </div>

        {/* Description */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldRow label="PRODUCT DESCRIPTION *">
            <textarea
              style={{ ...field, minHeight: 70, resize: 'vertical' }}
              value={d.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detailed description of the appliance, dimensions, warranty, and special highlights..."
            />
          </FieldRow>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            background: C.dangerSoft,
            color: C.danger,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="alert" size={16} />
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap', paddingBottom: 8 }}>
        <AButton variant="ghost" onClick={onClose}>
          Cancel
        </AButton>
        <AButton onClick={submit}>{submitLabel}</AButton>
      </div>
    </Modal>
  );
}
