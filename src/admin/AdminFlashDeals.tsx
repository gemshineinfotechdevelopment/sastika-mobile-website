import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { Btn, Pill } from '../site/ui';
import { FillBar, useCountdown } from '../components/anim';
import type { Category, FlashDealItem } from '../types';

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
  const [activeTab, setActiveTab] = useState<'upload' | 'catalog'>('upload');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [category, setCategory] = useState<Category>('phone');
  const [price, setPrice] = useState<number | ''>('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [badge, setBadge] = useState('Festival Offer');
  const [stock, setStock] = useState<number>(15);
  const [claimedPct, setClaimedPct] = useState<number>(68);
  const [color, setColor] = useState('#2f7d6d');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(products[0]?.id || '');
  const [catalogDealPrice, setCatalogDealPrice] = useState<number | ''>('');
  const [catalogBadge, setCatalogBadge] = useState('Special Festival Drop');

  // Handle file upload for custom product image
  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
    if (confirm('Are you sure you want to delete this Flash Deal campaign? This will turn off the campaign and clear it from the storefront.')) {
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

  // Add custom festival product
  const handleAddCustomProduct = (e: FormEvent) => {
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
      description: `${festivalName} exclusive deal.`,
    });

    // Reset form
    setName('');
    setPrice('');
    setMrp('');
    setImagePreview('');
    alert('Product added to Flash Deal Drop successfully! It is now live on the home page.');
  };

  // Add from catalog
  const handleAddFromCatalog = (e: FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedCatalogId);
    if (!prod) return;

    const dealPrice = catalogDealPrice ? Number(catalogDealPrice) : Math.round(prod.price * 0.85);

    addFlashDealItem({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      price: dealPrice,
      mrp: prod.mrp,
      color: prod.color,
      badge: catalogBadge || 'Festival Special',
      stock: prod.stock || 15,
      claimedPct: Math.floor(55 + Math.random() * 30),
      description: prod.description,
    });

    setCatalogDealPrice('');
    alert(`"${prod.name}" added to Flash Deal Drop!`);
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

            <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
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

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 12, color: C.success, fontWeight: 700 }}>
                  {savedMsg && '✓ Festival settings saved and updated on storefront!'}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={handleDeleteCampaign}
                    className="tap"
                    style={{
                      background: '#fee2e2',
                      color: C.danger,
                      border: `1.5px solid ${C.dangerSoft || '#fca5a5'}`,
                      borderRadius: 12,
                      padding: '10px 18px',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon name="trash" size={15} /> Delete Campaign
                  </button>
                  <Btn type="submit" variant="primary">Save Campaign Settings</Btn>
                </div>
              </div>
            </form>
          </div>

          {/* 2. Add Deal Product Form */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="tag" size={19} color={C.danger} />
                <div style={{ fontWeight: 800, fontSize: 16 }}>Add Product to Flash Deal Drop</div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', background: C.tint2, borderRadius: 10, padding: 3 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    background: activeTab === 'upload' ? '#fff' : 'transparent',
                    boxShadow: activeTab === 'upload' ? '0 2px 6px rgba(0,0,0,.08)' : 'none',
                    color: activeTab === 'upload' ? C.primary : C.muted,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Upload New Item
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    background: activeTab === 'catalog' ? '#fff' : 'transparent',
                    boxShadow: activeTab === 'catalog' ? '0 2px 6px rgba(0,0,0,.08)' : 'none',
                    color: activeTab === 'catalog' ? C.primary : C.muted,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  From Catalog
                </button>
              </div>
            </div>

            {activeTab === 'upload' ? (
              <form onSubmit={handleAddCustomProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      PRODUCT NAME *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. iPhone 15 Pro 128GB Festival Pack"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      BRAND
                    </label>
                    <input
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Apple, OnePlus..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      CATEGORY
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, background: '#fff' }}
                    >
                      <option value="smartphones">Smartphones</option>
                      <option value="iphones">iPhones</option>
                      <option value="accessories">Accessories</option>
                      <option value="home-appliances">Home Appliances</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
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
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.primary }}
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
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      FESTIVAL BADGE
                    </label>
                    <input
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="50% OFF, Diwali Deal"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13 }}
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
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13 }}
                    />
                  </div>
                </div>

                {/* Image upload and Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      UPLOAD PRODUCT IMAGE (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      style={{ width: '100%', padding: '8px', borderRadius: 10, border: `1.5px dashed ${C.border}`, fontSize: 12, background: C.tint2 }}
                    />
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      If no image is uploaded, a smart 3D device mockup in selected theme color will be displayed.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      THEME / COLOR SWATCH
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ width: 44, height: 38, padding: 0, borderRadius: 8, border: `1.5px solid ${C.border}`, cursor: 'pointer' }}
                      />
                      <input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <Btn type="submit" variant="primary" style={{ padding: '12px 24px', fontSize: 13, background: C.danger }}>
                    ⚡ Upload & Place into Flash Deal Drop
                  </Btn>
                </div>
              </form>
            ) : (
              /* Add from Catalog */
              <form onSubmit={handleAddFromCatalog} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                    SELECT PRODUCT FROM STORE
                  </label>
                  <select
                    value={selectedCatalogId}
                    onChange={(e) => setSelectedCatalogId(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, background: '#fff' }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) — Regular: {money(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      SPECIAL FESTIVAL DEAL PRICE (₹)
                    </label>
                    <input
                      type="number"
                      value={catalogDealPrice}
                      onChange={(e) => setCatalogDealPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Leave empty for automatic 15% discount"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                      FESTIVAL BADGE
                    </label>
                    <input
                      value={catalogBadge}
                      onChange={(e) => setCatalogBadge(e.target.value)}
                      placeholder="Special Festival Drop"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <Btn type="submit" variant="primary" style={{ padding: '12px 24px', fontSize: 13, background: C.danger }}>
                    ⚡ Feature in Flash Deal Drop
                  </Btn>
                </div>
              </form>
            )}
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
    </div>
  );
}
