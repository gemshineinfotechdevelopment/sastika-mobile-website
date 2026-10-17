import { useMemo, useState } from 'react';
import { BRANDS } from '../data';
import { C } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import { Reveal } from '../components/anim';
import ProductCard from './ProductCard';
import { Pill } from './ui';

type Sort = 'popular' | 'low' | 'high' | 'rating';

export default function Catalog({ kind }: { kind: 'phones' | 'accessories' }) {
  const { products } = useStore();
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('All');
  const [sort, setSort] = useState<Sort>('popular');
  const [limit, setLimit] = useState(6);

  const base = useMemo(
    () => products.filter((p) => (kind === 'phones' ? p.category === 'phone' : p.category !== 'phone')),
    [products, kind],
  );
  const brands = useMemo(() => ['All', ...Array.from(new Set(base.map((p) => p.brand)))], [base]);

  const list = useMemo(() => {
    let l = base.filter((p) => (brand === 'All' || p.brand === brand) && (p.name + p.brand).toLowerCase().includes(q.toLowerCase()));
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
    <div style={{ padding: '18px 0 20px' }}>
      <div style={{ padding: '0 18px' }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.primarySoft }}>{kind === 'phones' ? 'MOBILES CATALOGUE' : 'ACCESSORIES & AUDIO'}</div>
        <h1 style={{ margin: '4px 0 4px', fontSize: 28, fontWeight: 800, letterSpacing: -0.8 }}>{kind === 'phones' ? 'Flagship & Budget Smartphones' : 'Original Accessories & Audio'}</h1>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <Pill tone="success">{list.length} FOUND</Pill>
          <Pill>OFFICIAL STORE</Pill>
        </div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 13, top: 13, color: C.muted }}><Icon name="search" size={18} /></span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={kind === 'phones' ? 'Search iPhone, Galaxy, OnePlus…' : 'Search chargers, cases, earbuds…'}
            style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff' }}
          />
        </div>
      </div>

      <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 10px' }}>
        {brands.map((b) => (
          <button
            key={b}
            className="tap"
            onClick={() => {
              setBrand(b);
              setLimit(6);
            }}
            style={{ padding: '8px 16px', borderRadius: 99, fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', background: brand === b ? C.primary : '#fff', color: brand === b ? '#fff' : C.text, border: `1px solid ${brand === b ? C.primary : C.border}`, transition: 'all .25s ease' }}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 14px', alignItems: 'center' }}>
        <Icon name="filter" size={15} color={C.muted} />
        {sorts.map((s) => (
          <button key={s.k} onClick={() => setSort(s.k)} style={{ padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', background: sort === s.k ? C.accent : C.tint, color: sort === s.k ? C.primaryDark : C.primary, transition: 'all .25s ease' }}>
            {s.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: C.muted, animation: 'fadeUp .4s ease' }}>
          <Icon name="search" size={34} />
          <div style={{ fontWeight: 700, marginTop: 8 }}>No products match your search</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 18px' }}>
          {list.slice(0, limit).map((p, i) => (
            <Reveal key={p.id + brand + sort} delay={(i % 2) * 80} dir="up">
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      )}

      {limit < list.length && (
        <div style={{ padding: '18px 18px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Showing {Math.min(limit, list.length)} of {list.length}</div>
          <button className="tap" onClick={() => setLimit((n) => n + 6)} style={{ width: '100%', padding: 14, borderRadius: 14, background: C.primary, color: '#fff', fontWeight: 700 }}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
