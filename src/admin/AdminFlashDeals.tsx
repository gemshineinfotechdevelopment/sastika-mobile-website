import { useState, useEffect, useRef, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { Btn, Pill } from '../site/ui';
import { FillBar, useCountdown } from '../components/anim';
import type { Category, FlashDealItem, Product } from '../types';

import { CustomProductSelect } from './ProductSelect';


function CustomCategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (val: Category) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options: { id: Category; label: string; icon: string }[] = [
    { id: 'phone', label: 'Smartphones (5G)', icon: '📱' },
    { id: 'audio', label: 'Audio & Accessories', icon: '🎧' },
    { id: 'appliance', label: 'Home Appliances', icon: '📺' },
  ];

  const current = options.find((o) => o.id === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="tap"
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          padding: '10px 32px 10px 12px',
          borderRadius: 10,
          border: `1.5px solid ${open ? C.primary : C.border}`,
          background: '#fff',
          fontSize: 13,
          fontWeight: 600,
          color: C.text,
          textAlign: 'left',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: open ? `0 0 0 3px ${C.primarySoft}` : 'none',
        }}
      >
        <span>{current.icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.label}</span>
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, color: C.muted, fontSize: 10 }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            background: '#fff',
            borderRadius: 12,
            border: `1.5px solid ${C.primary}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              style={{
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: opt.id === value ? C.primary : C.text,
                background: opt.id === value ? C.tint2 : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.tint)}
              onMouseLeave={(e) => (e.currentTarget.style.background = opt.id === value ? C.tint2 : 'transparent')}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminFlashDeals() {
  const { flashDeal, updateFlashDeal, addFlashDealItem, removeFlashDealItem, products } = useStore();

  // Campaign settings state
  const [isActive, setIsActive] = useState(flashDeal.isActive);
  const [title, setTitle] = useState(flashDeal.title || 'Flash Deal Drop');
  const [subtitle, setSubtitle] = useState(flashDeal.subtitle || 'LIMITED STOCK LEFT');
  const [festivalName, setFestivalName] = useState(flashDeal.festivalName || 'Festival Mega Drop');
  const [endTime, setEndTime] = useState<string>(
    flashDeal.endTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  );
  const [savedMsg, setSavedMsg] = useState(false);

  // Sync state if flashDeal updates from store
  useEffect(() => {
    setIsActive(flashDeal.isActive);
    if (flashDeal.title) setTitle(flashDeal.title);
    if (flashDeal.subtitle) setSubtitle(flashDeal.subtitle);
    if (flashDeal.festivalName) setFestivalName(flashDeal.festivalName);
    if (flashDeal.endTime) setEndTime(flashDeal.endTime);
  }, [flashDeal.isActive, flashDeal.title, flashDeal.subtitle, flashDeal.festivalName, flashDeal.endTime]);

  // Live countdown timer driven by current endTime
  const countdown = useCountdown(endTime);

  // Helper to format ISO to datetime-local input
  const toLocalDatetime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  // Quick preset button handler
  const applyPresetHours = (hours: number) => {
    const target = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    setEndTime(target);
    setIsActive(true);
    updateFlashDeal({ endTime: target, isActive: true });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  // New product form state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [category, setCategory] = useState<Category>('phone');
  const [price, setPrice] = useState<number | ''>('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [badge, setBadge] = useState('Festival Offer');
  const [stock, setStock] = useState<number>(15);
  const [claimedPct, setClaimedPct] = useState<number>(68);
  const [color, setColor] = useState('#2f7d6d');
  const [storageVariant, setStorageVariant] = useState<string>('128GB, 256GB');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUploading, setImageUploading] = useState<boolean>(false);

  // Auto-fill form when selecting an existing store product
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setName(prod.name);
    setBrand(prod.brand || 'Apple');
    setCategory(prod.category);
    // Automatic 15% discount for festival flash drop
    setPrice(Math.round(prod.price * 0.85));
    setMrp(prod.mrp || prod.price);
    setColor(prod.color || '#2f7d6d');
    setStock(prod.stock || 15);
    setBadge('Special Festival Deal');
    const storageStr =
      prod.storage && prod.storage.length > 0
        ? prod.storage.join(', ')
        : prod.category === 'phone'
        ? '128GB, 256GB'
        : '';
    setStorageVariant(storageStr);

    const existingImg = prod.image || (prod.images && prod.images[0]) || '';
    setImagePreview(existingImg);
  };

  // Handle file upload with high-quality fast canvas compression
  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1000;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.88);
            setImagePreview(compressed);
          } else {
            setImagePreview(event.target?.result as string);
          }
          setImageUploading(false);
        };
        img.onerror = () => {
          setImagePreview(event.target?.result as string);
          setImageUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Save campaign settings
  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    const finalEnd = endTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    setEndTime(finalEnd);
    updateFlashDeal({
      isActive: true,
      title,
      subtitle,
      festivalName,
      endTime: finalEnd,
    });
    setIsActive(true);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  // Delete / Reset Flash Deal campaign
  const handleDeleteCampaign = () => {
    if (
      confirm(
        'Are you sure you want to delete this Flash Deal campaign? This will turn off the campaign and clear it from the storefront.'
      )
    ) {
      setTitle('Flash Deal Drop');
      setSubtitle('');
      setFestivalName('');
      setEndTime('');
      setIsActive(false);
      updateFlashDeal({
        isActive: false,
        title: 'Flash Deal Drop',
        subtitle: '',
        festivalName: '',
        endTime: '',
        items: [],
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  // Add product to Flash Deal Drop
  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !mrp) {
      alert('Please fill in Product Name, Deal Price, and MRP');
      return;
    }

    addFlashDealItem({
      name: name.trim(),
      brand: brand.trim(),
      category,
      price: Number(price),
      mrp: Number(mrp),
      color,
      image: imagePreview,
      badge: badge.trim(),
      stock: Number(stock) || 10,
      claimedPct: Number(claimedPct) || 60,
      description: `${festivalName || 'Festival'} exclusive deal on ${name.trim()}.`,
    });

    // Reset form
    setSelectedProductId('');
    setName('');
    setPrice('');
    setMrp('');
    setImagePreview('');
    alert('Product added to Flash Deal Drop successfully! It is now live on the storefront with your uploaded image.');
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.danger, display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(220,53,69,.3)' }}>
              <Icon name="zap" size={20} color="#fff" fill="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 800, color: C.primary, letterSpacing: -0.5 }}>
                Flash Deal Drop Manager
              </h1>
              <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>
                Control festival campaigns and products displayed in the home page's "Flash Deal Drop" section
              </div>
            </div>
          </div>
        </div>

        {/* Global Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => {
              const next = !isActive;
              setIsActive(next);
              updateFlashDeal({ isActive: next });
            }}
            style={{
              padding: '9px 16px',
              borderRadius: 99,
              background: isActive ? '#e8f5e9' : '#ffebee',
              color: isActive ? '#2e7d32' : '#c62828',
              border: `1.5px solid ${isActive ? '#a5d6a7' : '#ef9a9a'}`,
              fontWeight: 800,
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: isActive ? '#2e7d32' : '#c62828' }} />
            {isActive ? 'Section Active on Home Page' : 'Section Hidden from Home Page'}
          </button>
        </div>
      </div>

      <div className="admin-split-grid" style={{ gap: 20 }}>
        {/* Left Column: Festival Settings & Add Product Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. Campaign Settings Card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icon name="award" size={19} color={C.primary} />
              <div style={{ fontWeight: 800, fontSize: 16 }}>Festival / Campaign Settings</div>
            </div>

            <form id="campaignSettingsForm" onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 6 }}>
                  FESTIVAL / CAMPAIGN NAME
                </label>
                <input
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  placeholder="e.g. Diwali Mega Drop, Pongal Festival"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 6 }}>
                  SECTION HEADER TITLE
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Flash Deal Drop"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 6 }}>
                  SUBTITLE / URGENCY BADGE
                </label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="LIMITED STOCK LEFT • 48 HOURS ONLY"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                />
              </div>

              {/* Campaign Countdown Timer Control */}
              <div
                style={{
                  gridColumn: 'span 2',
                  borderRadius: 14,
                  padding: '16px 18px',
                  background: countdown.isExpired
                    ? '#fef2f2'
                    : `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                  color: countdown.isExpired ? '#991b1b' : '#fff',
                  border: countdown.isExpired ? '1px solid #fecaca' : `1px solid ${C.primary}`,
                  boxShadow: countdown.isExpired ? 'none' : '0 6px 20px rgba(6,51,46,.18)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                      <Icon name="clock" size={15} color={countdown.isExpired ? '#ef4444' : C.accent} />
                      <span style={{ color: countdown.isExpired ? '#991b1b' : C.accent }}>Live Flash Deal Timer</span>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: countdown.isExpired ? '#ef4444' : '#22c55e',
                          animation: 'pulseDot 1.4s infinite',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                      {countdown.isExpired
                        ? 'Campaign timer has expired! Choose a preset below or pick a new end time to reactivate.'
                        : 'Timer ticks in real time on the website homepage for all shoppers'}
                    </div>
                  </div>

                  {/* Big Live Countdown Display */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {countdown.days > 0 && (
                      <>
                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              background: 'rgba(255,255,255,.16)',
                              padding: '6px 10px',
                              borderRadius: 8,
                              fontWeight: 800,
                              fontSize: 18,
                              minWidth: 40,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {countdown.d}
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', opacity: 0.75, marginTop: 2 }}>Days</div>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 16 }}>:</span>
                      </>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          background: 'rgba(255,255,255,.16)',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontWeight: 800,
                          fontSize: 18,
                          minWidth: 40,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {countdown.days > 0 ? countdown.hh : countdown.h}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', opacity: 0.75, marginTop: 2 }}>Hours</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>:</span>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          background: 'rgba(255,255,255,.16)',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontWeight: 800,
                          fontSize: 18,
                          minWidth: 40,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {countdown.m}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', opacity: 0.75, marginTop: 2 }}>Mins</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>:</span>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          background: countdown.isExpired ? '#fee2e2' : C.accent,
                          color: countdown.isExpired ? '#991b1b' : C.primaryDark,
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontWeight: 900,
                          fontSize: 18,
                          minWidth: 40,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {countdown.s}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', opacity: 0.75, marginTop: 2 }}>Secs</div>
                    </div>
                  </div>
                </div>

                {/* Quick Presets & Custom Picker */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,.14)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.9, marginBottom: 8 }}>
                    Quick Timer Presets (Single Click to Set):
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {[
                      { label: '+4 Hours', hrs: 4 },
                      { label: '+8 Hours', hrs: 8 },
                      { label: '+12 Hours', hrs: 12 },
                      { label: '+24 Hours (1 Day)', hrs: 24 },
                      { label: '+48 Hours (2 Days)', hrs: 48 },
                      { label: '+7 Days (1 Week)', hrs: 168 },
                    ].map((p) => (
                      <button
                        key={p.hrs}
                        type="button"
                        onClick={() => applyPresetHours(p.hrs)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,.18)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,.25)',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          transition: 'all .15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.3)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
                      >
                        ⚡ {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom End Datetime Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.9 }}>
                      OR SET CUSTOM END DATE &amp; TIME:
                    </label>
                    <input
                      type="datetime-local"
                      value={toLocalDatetime(endTime)}
                      onChange={(e) => {
                        if (e.target.value) {
                          const d = new Date(e.target.value);
                          if (!isNaN(d.getTime())) {
                            setEndTime(d.toISOString());
                          }
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1.5px solid rgba(255,255,255,.4)',
                        background: '#fff',
                        color: C.text,
                        fontWeight: 700,
                        fontSize: 12.5,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                  💡 Use the Action Bar at the bottom of the page to Save or Delete this campaign.
                </div>
                {savedMsg && (
                  <div style={{ fontSize: 12, color: C.success, fontWeight: 700 }}>
                    ✓ Festival settings saved and updated on storefront!
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* 2. Add Deal Product Form */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px 16px', border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,.03)', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Icon name="tag" size={19} color={C.danger} />
              <div style={{ fontWeight: 800, fontSize: 16 }}>Add Product to Flash Deal Drop</div>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              {/* Custom Dropdown: Choose from added store products (Never overflows mobile screen!) */}
              <div style={{ background: C.tint2, borderRadius: 14, padding: '12px 14px', border: `1.5px solid ${C.primarySoft}`, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 6 }}>
                  📦 SELECT EXISTING STORE PRODUCT (Auto-fills Details, Price &amp; Photo):
                </label>
                <CustomProductSelect
                  products={products}
                  selectedId={selectedProductId}
                  onSelect={handleSelectProduct}
                />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.4 }}>
                  Selecting a product automatically fills its brand, category, colors, storage variant, pricing and official photo.
                </div>
              </div>

              {/* Product Name, Brand, Category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    PRODUCT NAME *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S24 Ultra 5G"
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    BRAND
                  </label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Samsung, Apple..."
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    CATEGORY
                  </label>
                  <CustomCategorySelect
                    value={category}
                    onChange={(cat) => setCategory(cat)}
                  />
                </div>
              </div>

              {/* Deal Price, Original MRP, Badge, Claimed % */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    DEAL PRICE (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="49999"
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.primary }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    ORIGINAL MRP (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="69999"
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    FESTIVAL BADGE
                  </label>
                  <input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Festival Offer, 50% OFF"
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    CLAIMED %
                  </label>
                  <input
                    type="number"
                    max={98}
                    min={10}
                    value={claimedPct}
                    onChange={(e) => setClaimedPct(Number(e.target.value))}
                    placeholder="65"
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Finish Colour & Storage Variant & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    FINISH COLOUR
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: '100%' }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width: 44, height: 38, padding: 0, borderRadius: 8, border: `1.5px solid ${C.border}`, cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 12, fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    STORAGE VARIANT(S)
                  </label>
                  <input
                    value={storageVariant}
                    onChange={(e) => setStorageVariant(e.target.value)}
                    placeholder="128GB, 256GB"
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    STOCK (Units)
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="15"
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Upload Product Image & Preview */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                  📸 UPLOAD PRODUCT IMAGE (Displayed directly on User Website):
                </label>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  {imagePreview ? (
                    <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 12, background: '#fff', border: `2px solid ${C.primarySoft}`, display: 'grid', placeItems: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                      <button
                        type="button"
                        onClick={() => setImagePreview('')}
                        title="Remove image"
                        style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: C.tint2, border: `1.5px dashed ${C.border}`, display: 'grid', placeItems: 'center', color: C.muted, fontSize: 10, textAlign: 'center', padding: 4 }}>
                      No Image Uploaded
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      style={{ width: '100%', padding: '8px', borderRadius: 10, border: `1.5px dashed ${C.border}`, fontSize: 12, background: '#fff' }}
                    />
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      {imageUploading
                        ? 'Optimizing and processing image...'
                        : imagePreview
                        ? '✓ Image ready! This exact image will be shown on the home page Flash Deal Drop.'
                        : 'Upload an image file (PNG/JPG/WebP). If left empty, default high-definition theme artwork is shown.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <Btn type="submit" variant="primary" style={{ padding: '12px 26px', fontSize: 13.5, background: C.danger }}>
                  ⚡ Add Product to Flash Deal Drop
                </Btn>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Home Preview & Current Active Deals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Live Mobile Storefront Preview */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: `1.5px solid ${C.primary}`, boxShadow: '0 8px 30px rgba(6,51,46,.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, letterSpacing: 1.2 }}>
                STOREFRONT LIVE PREVIEW
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: C.tint, color: C.primary }}>
                Mobile View
              </span>
            </div>

            {/* Mock Div matching Home.tsx */}
            <div style={{ borderRadius: 18, padding: 14, background: `linear-gradient(160deg, ${C.tint}, #fff)`, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: C.danger, display: 'grid', placeItems: 'center' }}>
                    <Icon name="zap" size={15} color="#fff" fill="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{title || 'Flash Deal Drop'}</div>
                    <div style={{ fontSize: 9.5, color: C.danger, fontWeight: 700 }}>
                      {festivalName ? `${festivalName.toUpperCase()} • ` : ''}{subtitle || 'LIMITED STOCK LEFT'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {countdown.days > 0 && (
                    <>
                      <span style={{ background: C.primary, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 5px', borderRadius: 4, minWidth: 20, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        {countdown.d}d
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 800 }}>:</span>
                    </>
                  )}
                  <span style={{ background: C.primary, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 5px', borderRadius: 4, minWidth: 20, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                    {countdown.days > 0 ? countdown.hh : countdown.h}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800 }}>:</span>
                  <span style={{ background: C.primary, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 5px', borderRadius: 4, minWidth: 20, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                    {countdown.m}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800 }}>:</span>
                  <span style={{ background: countdown.isExpired ? '#dc2626' : C.danger, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 5px', borderRadius: 4, minWidth: 20, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                    {countdown.s}
                  </span>
                </div>
              </div>

              {/* Grid of preview items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {flashDeal.items && flashDeal.items.slice(0, 2).map((item) => (
                  <div key={item.id} style={{ background: '#fff', borderRadius: 12, padding: 8, border: `1px solid ${C.border}`, position: 'relative' }}>
                    {item.badge && (
                      <span style={{ position: 'absolute', top: 6, left: 6, background: C.danger, color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 99, zIndex: 1 }}>
                        {item.badge}
                      </span>
                    )}
                    <div style={{ height: 60, borderRadius: 8, background: C.tint2, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ maxHeight: 52, maxWidth: '90%', objectFit: 'contain' }} />
                      ) : (
                        <ProductArt category={item.category} color={item.color} size={50} />
                      )}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, margin: '4px 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                      <b style={{ fontSize: 12 }}>{money(item.price)}</b>
                      <span style={{ fontSize: 8.5, color: C.success, fontWeight: 800 }}>{discount(item.price, item.mrp)}% off</span>
                    </div>
                    <FillBar pct={item.claimedPct || 65} color={`linear-gradient(90deg, ${C.accent}, ${C.danger})`} bg={C.tint} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Active Deals List */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 22, border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Current Flash Deal Items ({flashDeal.items?.length || 0})</div>
            </div>

            {flashDeal.items && flashDeal.items.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
                No products in Flash Deal Drop yet. Add festival products using the form on the left!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {flashDeal.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: `1px solid ${C.border}`,
                      background: '#fff',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: C.tint2, display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ maxHeight: 38, maxWidth: '90%', objectFit: 'contain' }} />
                      ) : (
                        <ProductArt category={item.category} color={item.color} size={36} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        {item.badge && (
                          <span style={{ fontSize: 9.5, fontWeight: 800, background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: 99 }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Deal Price: <b style={{ color: C.primary }}>{money(item.price)}</b> (MRP: {money(item.mrp)}) · {item.claimedPct || 60}% claimed
                      </div>
                    </div>

                    <button
                      onClick={() => removeFlashDealItem(item.id)}
                      title="Remove product from Flash Deal"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#fee2e2',
                        border: 'none',
                        color: '#dc2626',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform .15s ease',
                      }}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ACTION BAR: DELETE CAMPAIGN & SAVE CAMPAIGN (Placed at the end)   */}
      {/* ========================================================================= */}
      <div
        style={{
          marginTop: 28,
          background: '#fff',
          borderRadius: 20,
          padding: '18px 24px',
          border: `1.5px solid ${C.border}`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
            Campaign Management Actions
          </div>
          {savedMsg && (
            <span
              style={{
                fontSize: 12.5,
                color: C.success,
                fontWeight: 700,
                background: '#dcfce7',
                padding: '4px 12px',
                borderRadius: 99,
              }}
            >
              ✓ Festival settings saved & active on storefront!
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={handleDeleteCampaign}
            className="tap"
            style={{
              background: '#fee2e2',
              color: C.danger,
              border: `1.5px solid ${C.dangerSoft || '#fca5a5'}`,
              borderRadius: 12,
              padding: '11px 22px',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all .15s ease',
            }}
          >
            <Icon name="trash" size={16} /> Delete Campaign
          </button>
          <Btn
            type="button"
            variant="primary"
            onClick={(e) => handleSaveSettings(e as any)}
            style={{
              padding: '11px 26px',
              fontSize: 14,
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(11,74,67,0.25)',
            }}
          >
            Save Campaign Settings
          </Btn>
        </div>
      </div>
    </div>
  );
}
