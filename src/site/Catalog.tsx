import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUniqueProductBrands } from '../data';
import { C } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import { Reveal } from '../components/anim';
import ProductCard from './ProductCard';
import { Pill } from './ui';

type Sort = 'popular' | 'low' | 'high' | 'rating';

export default function Catalog({ kind }: { kind: 'phones' | 'accessories' }) {
  const { products } = useStore();
  const [searchParams] = useSearchParams();
  const urlBrand = searchParams.get('brand');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState(urlBrand || 'All');
  const [sort, setSort] = useState<Sort>('popular');
  const [limit, setLimit] = useState(6);

  useEffect(() => {
    if (urlBrand) {
      setBrand(urlBrand);
    }
  }, [urlBrand]);

  const base = useMemo(
    () => products.filter((p) => (kind === 'phones' ? p.category === 'phone' : p.category !== 'phone')),
    [products, kind],
  );
  const brands = useMemo(() => ['All', ...getUniqueProductBrands(base)], [base]);

  const list = useMemo(() => {
    let l = base.filter(
      (p) =>
        (brand === 'All' || p.brand.toLowerCase() === brand.toLowerCase()) &&
        (p.name + p.brand).toLowerCase().includes(q.toLowerCase()),
    );
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price);
    if (sort === 'rating') l = [...l].sort((a, b) => b.rating - a.rating);
    if (sort === 'popular') l = [...l].sort((a, b) => b.reviews - a.reviews);
    return l;
  }, [base, brand, q, sort]);

  const sorts: { k: Sort; label: string }[] = [
    { k: 'popular', label: 'Popular' },
    { k: 'low', label: 'Price ↑' },
    { k: 'high', label: 'Price ↓' },
    { k: 'rating', label: 'Top Rated' },
  ];

  return (
    <div className="site-page-container" style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.primarySoft }}>
          {kind === 'phones' ? 'INVENTORY MOBILES CATALOGUE' : 'ACCESSORIES & AUDIO'}
        </div>
        <h1 style={{ margin: '6px 0 8px', fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>
          {kind === 'phones' ? 'Available 5G Smartphones' : 'Original Accessories & Audio'}
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <Pill tone="success">{list.length} IN STOCK</Pill>
          <Pill>100% BRAND WARRANTY</Pill>
          <Pill tone="accent">SIVAKASI TAX INVOICE</Pill>
        </div>

        <div style={{ position: 'relative', maxWidth: 640, marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: 13, color: C.muted }}>
            <Icon name="search" size={18} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={kind === 'phones' ? 'Search Redmi, OPPO, Vivo, Nothing, Samsung, Poco…' : 'Search chargers, cases, earbuds…'}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Brand Selector Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {brands.map((b) => (
          <button
            key={b}
            className="tap"
            onClick={() => {
              setBrand(b);
              setLimit(18);
            }}
            style={{
              padding: '7px 16px',
              borderRadius: 99,
              fontWeight: 700,
              fontSize: 12.5,
              background: brand === b ? C.primary : '#fff',
              color: brand === b ? '#fff' : C.text,
              border: `1.5px solid ${brand === b ? C.primary : C.border}`,
              boxShadow: brand === b ? '0 4px 12px rgba(11,74,67,0.18)' : 'none',
              transition: 'all .2s ease',
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Sorting Bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="filter" size={14} color={C.muted} /> Sort By:
        </span>
        {sorts.map((s) => (
          <button
            key={s.k}
            onClick={() => setSort(s.k)}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: sort === s.k ? C.accent : C.tint,
              color: sort === s.k ? C.primaryDark : C.primary,
              transition: 'all .2s ease',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted, background: '#fff', borderRadius: 20, border: `1px solid ${C.border}` }}>
          <Icon name="search" size={40} />
          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 12 }}>No products match your search</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing the search query or selecting a different brand</div>
        </div>
      ) : (
        <div className="product-cards-grid">
          {list.slice(0, limit).map((p, i) => (
            <Reveal key={p.id + brand + sort} delay={(i % 4) * 60} dir="up">
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      )}

      {limit < list.length && (
        <div style={{ padding: '24px 0 0', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 12 }}>
            Showing {Math.min(limit, list.length)} of {list.length} products
          </div>
          <button
            className="tap"
            onClick={() => setLimit((n) => n + 12)}
            style={{
              padding: '12px 32px',
              borderRadius: 14,
              background: C.primary,
              color: '#fff',
              fontWeight: 800,
              fontSize: 13.5,
              boxShadow: '0 4px 14px rgba(11,74,67,0.2)',
            }}
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
}
