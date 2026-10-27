import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { useStore } from '../store';
import { isAppliance } from '../categoryUtils';
import Icon from '../components/Icon';
import { Reveal } from '../components/anim';
import ProductCard from './ProductCard';
import { Pill } from './ui';

type ApplianceCategory = string;
type Sort = 'popular' | 'low' | 'high' | 'rating';

const PRESET_SUB_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Appliances', icon: '✨' },
  { id: 'tv', label: 'Smart TVs', icon: '📺' },
  { id: 'fridge', label: 'Refrigerators', icon: '❄️' },
  { id: 'washing', label: 'Washing Machines', icon: '🧺' },
  { id: 'ac', label: 'Air Conditioners', icon: '💨' },
  { id: 'kitchen', label: 'Kitchen & Home', icon: '🍳' },
];

export default function HomeAppliances() {
  const { products } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [subCat, setSubCat] = useState<string>(params.get('type') || 'all');
  const [brand, setBrand] = useState<string>(params.get('brand') || 'All');
  const [sort, setSort] = useState<Sort>('popular');
  const [limit, setLimit] = useState(12);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    left: 0,
    right: 'auto',
    width: 260,
  });

  const toggleBrandMenu = () => {
    if (!brandMenuOpen && brandRef.current) {
      const rect = brandRef.current.getBoundingClientRect();
      const popoverWidth = Math.min(270, window.innerWidth - 24);
      // Keep at least 12px margin from viewport left and right
      const idealViewportLeft = Math.max(12, Math.min(rect.left, window.innerWidth - popoverWidth - 12));
      const relativeLeft = idealViewportLeft - rect.left;
      setPopoverStyle({
        left: `${relativeLeft}px`,
        right: 'auto',
        width: `${popoverWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
      });
    }
    setBrandMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter only appliances
  const allAppliances = useMemo(() => products.filter((p) => isAppliance(p.category)), [products]);

  // Extract unique brands from appliances (including any brand typed in admin!)
  const applianceBrands = useMemo(() => {
    const set = new Set<string>();
    allAppliances.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        set.add(p.brand.trim());
      }
    });
    return Array.from(set);
  }, [allAppliances]);

  const brands = useMemo(() => ['All', ...applianceBrands], [applianceBrands]);

  // Repeated for smooth continuous running marquee banner
  const marqueeBrands = useMemo(() => {
    if (applianceBrands.length === 0) return [];
    let list = [...applianceBrands];
    while (list.length < 10) {
      list = [...list, ...applianceBrands];
    }
    return [...list, ...list];
  }, [applianceBrands]);

  // Unique manually typed categories from appliances
  const customCategories = useMemo(() => {
    const set = new Set<string>();
    allAppliances.forEach((p) => {
      const cat = p.subCategory?.trim();
      if (cat) {
        const matchesExisting = PRESET_SUB_CATEGORIES.some(
          (pre) => pre.id !== 'all' && (pre.label.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(pre.id))
        );
        if (!matchesExisting) {
          set.add(cat);
        }
      }
    });
    return Array.from(set);
  }, [allAppliances]);

  const matchesSubCat = (p: typeof allAppliances[0], cat: string): boolean => {
    if (cat === 'all') return true;
    const text = (
      (p.subCategory || '') + ' ' +
      p.name + ' ' +
      (p.specs?.join(' ') || '') + ' ' +
      (p.badge || '') + ' ' +
      (p.description || '')
    ).toLowerCase();
    if (cat === 'tv') return text.includes('tv') || text.includes('led') || text.includes('screen') || text.includes('ultra hd');
    if (cat === 'fridge') return text.includes('refrigerator') || text.includes('fridge') || text.includes('frost free');
    if (cat === 'washing') return text.includes('wash') || text.includes('laundry');
    if (cat === 'ac') return text.includes(' ac') || text.includes('air conditioner') || text.includes('split ac');
    if (cat === 'kitchen') return text.includes('grinder') || text.includes('mixer') || text.includes('oven') || text.includes('microwave') || text.includes('cooker') || text.includes('purifier');
    return (p.subCategory || '').toLowerCase().trim() === cat.toLowerCase().trim() || text.includes(cat.toLowerCase().trim());
  };

  const filtered = useMemo(() => {
    let list = allAppliances.filter((p) => {
      const matchBrand = brand === 'All' || p.brand.toLowerCase() === brand.toLowerCase();
      const matchCat = matchesSubCat(p, subCat);
      const query = q.trim().toLowerCase();
      const matchQuery = !query || (p.name + ' ' + p.brand + ' ' + (p.description || '')).toLowerCase().includes(query);
      return matchBrand && matchCat && matchQuery;
    });

    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === 'popular') list = [...list].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));

    return list;
  }, [allAppliances, brand, subCat, q, sort]);

  const sorts: { k: Sort; label: string }[] = [
    { k: 'popular', label: 'Popular' },
    { k: 'low', label: 'Price ↑' },
    { k: 'high', label: 'Price ↓' },
    { k: 'rating', label: 'Top Rated' },
  ];

  return (
    <div className="site-page-container" style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #042f2e 50%, #0f172a 100%)',
          borderRadius: 24,
          padding: '28px 24px',
          color: '#fff',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(6, 78, 59, 0.25)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.8,
              color: '#34d399',
              marginBottom: 12,
            }}
          >
            <span>🏠</span>
            <span>SASTIKA HOME ELECTRONICS & APPLIANCES</span>
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 10px' }}>
            Smart Home Appliances for Modern Living
          </h1>
          <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', lineHeight: 1.6 }}>
            Upgrade your home with 4K Smart TVs, Inverter Refrigerators, Washing Machines &amp; Air Conditioners from top brands. Free express doorstep delivery &amp; installation across Sivakasi.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 10 }}>
              <span>🚚</span> Free Sivakasi Delivery
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 10 }}>
              <span>🛡️</span> 100% Brand Warranty
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 10 }}>
              <span>💳</span> Easy No-Cost EMI
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 10 }}>
              <span>💵</span> Cash on Delivery in Sivakasi
            </span>
          </div>
        </div>

        {/* Decorative background element */}
        <div
          style={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Running Brand Marquee Section */}
      {marqueeBrands.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          {/* Top Brands Heading placed ABOVE the running ticker! */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              padding: '0 4px',
              flexWrap: 'wrap',
              gap: 8,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: C.text,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ color: C.primary, fontSize: 16 }}>⚡</span>
                <span>TOP BRANDS</span>
              </span>
              <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 700 }}>
                (Official Warranty Partners • Tap any brand to filter)
              </span>
            </div>

            {brand !== 'All' && (
              <button
                type="button"
                onClick={() => {
                  setBrand('All');
                  setParams({ type: subCat, brand: 'All' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.primary,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '2px 0',
                }}
              >
                Show All Brands ✕
              </button>
            )}
          </div>

          {/* Running Brand Ticker Track */}
          <div
            className="marquee-wrap"
            style={{
              overflow: 'hidden',
              background: 'linear-gradient(90deg, #022c22 0%, #064e3b 50%, #042f2e 100%)',
              borderRadius: 14,
              padding: '10px 0',
              border: '1.5px solid rgba(52,211,153,0.3)',
              boxShadow: '0 6px 20px rgba(2,44,34,0.3)',
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              className="marquee-track"
              style={{
                animation: 'marquee 22s linear infinite',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                paddingLeft: 16,
              }}
            >
              {marqueeBrands.map((b, i) => {
                const isSelected = brand.toLowerCase() === b.toLowerCase();
                return (
                  <button
                    key={`${b}-${i}`}
                    type="button"
                    onClick={() => {
                      const next = isSelected ? 'All' : b;
                      setBrand(next);
                      setParams({ type: subCat, brand: next });
                    }}
                    style={{
                      background: isSelected ? '#10b981' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${isSelected ? '#34d399' : 'rgba(255,255,255,0.18)'}`,
                      color: '#fff',
                      padding: '5px 14px',
                      borderRadius: 20,
                      fontSize: 12.5,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      transition: 'all .2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: '#34d399', fontSize: 13 }}>★</span>
                    <span>{b}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Official</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Pills (Preset + Any Custom Typed Categories) */}
      <div
        className="hide-scroll"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 6,
          marginBottom: 16,
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {PRESET_SUB_CATEGORIES.map((cat) => {
          const active = subCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSubCat(cat.id);
                setParams({ type: cat.id, brand });
              }}
              className="tap"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 99,
                background: active ? C.primary : '#fff',
                color: active ? '#fff' : C.text,
                border: `1.5px solid ${active ? C.primary : C.border}`,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 4px 12px rgba(6, 78, 59, 0.2)' : 'none',
                transition: 'all .2s ease',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* Custom typed categories from Admin */}
        {customCategories.map((cName) => {
          const active = subCat.toLowerCase() === cName.toLowerCase();
          return (
            <button
              key={cName}
              onClick={() => {
                setSubCat(cName);
                setParams({ type: cName, brand });
              }}
              className="tap"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 99,
                background: active ? C.primary : '#fff',
                color: active ? '#fff' : C.text,
                border: `1.5px solid ${active ? C.primary : C.border}`,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 4px 12px rgba(6, 78, 59, 0.2)' : 'none',
                transition: 'all .2s ease',
              }}
            >
              <span>🏷️</span>
              <span>{cName}</span>
            </button>
          );
        })}
      </div>

      {/* Brand Quick Filter Pills Reel (Instant 1-Tap Filtering) */}
      <div
        className="hide-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          overflowX: 'auto',
          paddingBottom: 6,
          marginBottom: 16,
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: C.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            flexShrink: 0,
            marginRight: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>🏷️</span>
          <span>BRANDS:</span>
        </span>

        {/* All Brands Pill */}
        <button
          type="button"
          onClick={() => {
            setBrand('All');
            setParams({ type: subCat, brand: 'All' });
          }}
          className="tap"
          style={{
            padding: '6px 14px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 800,
            background: brand === 'All' ? C.primary : '#fff',
            color: brand === 'All' ? '#fff' : C.text,
            border: `1.5px solid ${brand === 'All' ? C.primary : C.border}`,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: brand === 'All' ? '0 3px 10px rgba(6, 78, 59, 0.22)' : 'none',
            transition: 'all .2s ease',
            flexShrink: 0,
          }}
        >
          ✨ All Brands ({allAppliances.length})
        </button>

        {/* Individual Brand Pills */}
        {applianceBrands.map((b) => {
          const isSelected = brand.toLowerCase() === b.toLowerCase();
          const count = allAppliances.filter((p) => p.brand.toLowerCase() === b.toLowerCase()).length;
          return (
            <button
              key={b}
              type="button"
              onClick={() => {
                const next = isSelected ? 'All' : b;
                setBrand(next);
                setParams({ type: subCat, brand: next });
              }}
              className="tap"
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 800,
                background: isSelected ? C.primary : '#fff',
                color: isSelected ? '#fff' : C.text,
                border: `1.5px solid ${isSelected ? C.primary : C.border}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 3px 10px rgba(6, 78, 59, 0.22)' : 'none',
                transition: 'all .2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span>{b}</span>
              <span
                style={{
                  fontSize: 10.5,
                  padding: '1px 6px',
                  borderRadius: 99,
                  background: isSelected ? 'rgba(255,255,255,0.22)' : '#f1f5f9',
                  color: isSelected ? '#fff' : C.muted,
                  fontWeight: 800,
                }}
              >
                {count}
              </span>
              {isSelected && <span style={{ fontSize: 11, fontWeight: 900 }}>✕</span>}
            </button>
          );
        })}
      </div>

      {/* Brand & Search Filter Bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          border: `1px solid ${C.border}`,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
            <Icon name="search" size={16} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search TV, Fridge, Washing Machine, AC..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              boxSizing: 'border-box',
              outline: 'none',
            }}
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

        {/* Custom Brand Dropdown Selector (No native OS select!) */}
        <div ref={brandRef} style={{ position: 'relative', flex: '0 0 auto' }}>
          <button
            type="button"
            onClick={toggleBrandMenu}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              borderRadius: 12,
              border: `1.5px solid ${brand !== 'All' ? C.primary : C.border}`,
              background: brand !== 'All' ? C.tint2 : '#fff',
              color: brand !== 'All' ? C.primary : C.text,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: brand !== 'All' ? `0 0 0 2px ${C.primarySoft}` : 'none',
              transition: 'all .2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 14 }}>🏷️</span>
            <span>
              {brand === 'All' ? 'Filter Brand ▾' : `Brand: ${brand}`}
            </span>
            <span
              style={{
                fontSize: 10,
                color: brand !== 'All' ? C.primary : C.muted,
                transform: brandMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform .2s ease',
              }}
            >
              ▼
            </span>
          </button>

          {/* Custom Popover Dropdown Card */}
          {brandMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                ...popoverStyle,
                maxHeight: 330,
                overflowY: 'auto',
                background: '#fff',
                borderRadius: 16,
                border: `1.5px solid ${C.border}`,
                boxShadow: '0 14px 40px rgba(0,0,0,0.18)',
                padding: 8,
                zIndex: 60,
                animation: 'bounceIn .2s ease both',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px 8px',
                  borderBottom: `1px solid ${C.border}`,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Filter By Brand
                </span>
                {brand !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setBrand('All');
                      setParams({ type: subCat, brand: 'All' });
                      setBrandMenuOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: C.primary,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* All Brands Option */}
              <button
                type="button"
                onClick={() => {
                  setBrand('All');
                  setParams({ type: subCat, brand: 'All' });
                  setBrandMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: brand === 'All' ? C.tint2 : 'transparent',
                  color: brand === 'All' ? C.primary : C.text,
                  fontWeight: brand === 'All' ? 800 : 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>✨</span>
                  <span>All Brands</span>
                </div>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>
                  ({allAppliances.length})
                </span>
              </button>

              {/* Brand list */}
              {applianceBrands.map((b) => {
                const isSelected = brand.toLowerCase() === b.toLowerCase();
                const count = allAppliances.filter((p) => p.brand.toLowerCase() === b.toLowerCase()).length;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setBrand(b);
                      setParams({ type: subCat, brand: b });
                      setBrandMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: isSelected ? C.tint2 : 'transparent',
                      color: isSelected ? C.primary : C.text,
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: 2,
                      transition: 'all .15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: isSelected ? C.primary : '#f1f5f9',
                          color: isSelected ? '#fff' : C.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        {b.charAt(0)}
                      </span>
                      <span>{b}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: isSelected ? C.primary : C.muted, fontWeight: 700 }}>
                        ({count})
                      </span>
                      {isSelected && <span style={{ color: C.primary, fontSize: 13, fontWeight: 900 }}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {sorts.map((s) => (
            <button
              key={s.k}
              onClick={() => setSort(s.k)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                background: sort === s.k ? C.primary : 'transparent',
                color: sort === s.k ? '#fff' : C.muted,
                border: 'none',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Tags */}
      {(brand !== 'All' || subCat !== 'all' || q) && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: C.muted }}>Active Filter:</span>
          {brand !== 'All' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 99,
                background: C.tint2,
                border: `1.5px solid ${C.primary}`,
                color: C.primary,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span>Brand: <strong>{brand}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setBrand('All');
                  setParams({ type: subCat, brand: 'All' });
                }}
                style={{ background: 'none', border: 'none', color: C.primary, cursor: 'pointer', fontWeight: 900, fontSize: 13, padding: 0 }}
                title="Clear brand filter"
              >
                ✕
              </button>
            </span>
          )}
          {subCat !== 'all' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 99,
                background: '#e0f2fe',
                border: '1.5px solid #0284c7',
                color: '#0369a1',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span>Category: <strong>{PRESET_SUB_CATEGORIES.find((c) => c.id === subCat)?.label || subCat}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setSubCat('all');
                  setParams({ type: 'all', brand });
                }}
                style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', fontWeight: 900, fontSize: 13, padding: 0 }}
                title="Clear category filter"
              >
                ✕
              </button>
            </span>
          )}
          {q && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 99,
                background: '#fef3c7',
                border: '1.5px solid #d97706',
                color: '#b45309',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span>Search: "{q}"</span>
              <button
                type="button"
                onClick={() => setQ('')}
                style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', fontWeight: 900, fontSize: 13, padding: 0 }}
                title="Clear search"
              >
                ✕
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setBrand('All');
              setSubCat('all');
              setQ('');
              setParams({ type: 'all', brand: 'All' });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: C.danger,
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              marginLeft: 4,
            }}
          >
            Clear All ✕
          </button>
        </div>
      )}

      {/* Results Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.muted }}>
          Showing <strong>{filtered.length}</strong> home {filtered.length === 1 ? 'appliance' : 'appliances'}
          {brand !== 'All' && <span> for <strong>{brand}</strong></span>}
          {subCat !== 'all' && <span> in <strong>{PRESET_SUB_CATEGORIES.find((c) => c.id === subCat)?.label || subCat}</strong></span>}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.slice(0, limit).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>No appliances match your search</h3>
          <p style={{ margin: '0 0 16px', color: C.muted, fontSize: 13 }}>
            Try changing the filter or search keyword, or browse all appliances.
          </p>
          <button
            onClick={() => {
              setQ('');
              setBrand('All');
              setSubCat('all');
            }}
            className="tap"
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              background: C.primary,
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Load More Button */}
      {filtered.length > limit && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            onClick={() => setLimit((l) => l + 12)}
            className="tap"
            style={{
              padding: '10px 24px',
              borderRadius: 99,
              background: '#fff',
              border: `1.5px solid ${C.primary}`,
              color: C.primary,
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            Load More Appliances ({filtered.length - limit} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
