import { useState, useEffect, useRef, useMemo } from 'react';
import { C, money } from '../theme';
import type { Product } from '../types';

export function CustomProductSelect({
  products,
  selectedId,
  onSelect,
  placeholder = '-- Click to Pick a Store Product --',
}: {
  products: Product[];
  selectedId: string;
  onSelect: (productId: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = products.find((p) => p.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        String(p.price).includes(q)
    );
  }, [products, search]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="tap"
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          padding: '11px 36px 11px 14px',
          borderRadius: 10,
          border: `1.5px solid ${open ? C.primary : C.border}`,
          background: '#fff',
          textAlign: 'left',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          boxShadow: open ? `0 0 0 3px ${C.primarySoft}` : 'none',
          transition: 'all .2s ease',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 13,
            fontWeight: 700,
            color: selectedProduct ? C.primaryDark : C.muted,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
          }}
        >
          {selectedProduct ? (
            <>
              <span style={{ color: C.primary, fontWeight: 800 }}>📦 {selectedProduct.name}</span>
              <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>
                ({selectedProduct.brand} · {money(selectedProduct.price)})
              </span>
            </>
          ) : (
            `${placeholder} (${products.length} Available)`
          )}
        </span>
        <span
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: 'transform .2s ease',
            color: C.primary,
            fontSize: 11,
            pointerEvents: 'none',
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Panel: Strictly 100% width, stays inside container & screen! */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            background: '#ffffff',
            borderRadius: 14,
            border: `1.5px solid ${C.primary}`,
            boxShadow: '0 14px 40px rgba(0,0,0,0.25)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeUp .18s ease both',
          }}
        >
          {/* Quick Search Header */}
          <div
            style={{
              padding: '8px 10px',
              background: C.tint,
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: 13 }}>🔍</span>
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, or price..."
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 12.5,
                fontWeight: 600,
                color: C.text,
                padding: '4px 0',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: C.muted,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Scrollable Products List */}
          <div
            style={{
              maxHeight: 280,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: '4px 0',
            }}
          >
            {/* Clear Selection Option */}
            <div
              onClick={() => {
                onSelect('');
                setOpen(false);
              }}
              style={{
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: C.muted,
                cursor: 'pointer',
                borderBottom: `1px dashed ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: !selectedId ? C.tint2 : 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.tint2)}
              onMouseLeave={(e) => (e.currentTarget.style.background = !selectedId ? C.tint2 : 'transparent')}
            >
              <span>✕</span>
              <span>-- Clear Selection (Enter Manually) --</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: 12.5, color: C.muted }}>
                No products found matching "{search}"
              </div>
            ) : (
              filtered.map((p) => {
                const isSelected = p.id === selectedId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelect(p.id);
                      setOpen(false);
                      setSearch('');
                    }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: `1px solid rgba(0,0,0,0.04)`,
                      background: isSelected ? C.tint2 : 'transparent',
                      transition: 'background .15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.tint)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? C.tint2 : 'transparent')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isSelected ? C.primary : C.text,
                          wordBreak: 'break-word',
                          lineHeight: 1.35,
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: '#f1f5f9',
                            color: C.muted,
                          }}
                        >
                          {p.brand}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>
                          Regular: {money(p.price)}
                        </span>
                        {p.stock !== undefined && (
                          <span style={{ fontSize: 10.5, color: C.muted }}>
                            Stock: {p.stock}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ color: C.primary, fontWeight: 900, fontSize: 16 }}>✓</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
