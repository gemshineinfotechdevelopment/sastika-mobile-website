import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { C, discount, money } from '../theme';
import { useStore } from '../store';
import Icon from '../components/Icon';
import ProductArt from '../components/ProductArt';
import { Stars } from './ui';

export default function ProductCard({ p, width, compact }: { p: Product; width?: number; compact?: boolean }) {
  const nav = useNavigate();
  const { addToCart, wishlist, toggleWish } = useStore();
  const [added, setAdded] = useState(false);
  const [beat, setBeat] = useState(false);
  const wished = wishlist.includes(p.id);
  const off = discount(p.price, p.mrp);

  const add = () => {
    addToCart(p.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      className="lift"
      style={{
        width,
        flexShrink: 0,
        background: '#fff',
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: 12,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {off > 0 && (
        <span style={{ position: 'absolute', top: 10, left: 10, background: C.accent, color: C.primaryDark, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 8, zIndex: 2 }}>
          {off}% OFF
        </span>
      )}
      <button
        aria-label="Wishlist"
        onClick={() => {
          toggleWish(p.id);
          setBeat(true);
          window.setTimeout(() => setBeat(false), 400);
        }}
        style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.1)', zIndex: 2, animation: beat ? 'pop .4s ease' : undefined }}
      >
        <Icon name="heart" size={16} color={wished ? C.danger : C.muted} fill={wished ? C.danger : 'none'} />
      </button>

      <div onClick={() => nav(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
        <div style={{ height: compact ? 110 : 140, borderRadius: 14, background: `linear-gradient(160deg, ${C.tint2}, ${C.tint})`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
          <ProductArt category={p.category} color={p.color} size={compact ? 92 : 118} />
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, marginTop: 10 }}>{p.brand.toUpperCase()}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, minHeight: 34, marginTop: 2 }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11, color: C.muted }}>
          <Stars value={p.rating} size={11} /> {p.rating}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 16.5, fontWeight: 800 }}>{money(p.price)}</span>
          {p.mrp > p.price && <span style={{ fontSize: 11, color: C.muted, textDecoration: 'line-through' }}>{money(p.mrp)}</span>}
        </div>
        {p.stock <= p.reorderAt && p.stock > 0 && <div style={{ fontSize: 10.5, color: C.danger, fontWeight: 700, marginTop: 3 }}>Only {p.stock} left</div>}
        {p.stock === 0 && <div style={{ fontSize: 10.5, color: C.danger, fontWeight: 700, marginTop: 3 }}>Out of stock</div>}
      </div>

      <button
        className="tap"
        disabled={p.stock === 0}
        onClick={add}
        style={{
          marginTop: 10,
          padding: '10px 0',
          borderRadius: 12,
          background: added ? C.success : C.primary,
          color: '#fff',
          fontWeight: 700,
          fontSize: 12.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'background .3s ease',
          opacity: p.stock === 0 ? 0.5 : 1,
        }}
      >
        <Icon name={added ? 'check' : 'cart'} size={15} />
        {added ? 'Added' : 'Add to Cart'}
      </button>
    </div>
  );
}
