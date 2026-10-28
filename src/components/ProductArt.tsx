import { useState, type CSSProperties } from 'react';
import type { Category } from '../types';

interface Props {
  category: Category;
  color: string;
  size?: number;
  style?: CSSProperties;
  float?: boolean;
  image?: string;
  alt?: string;
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export default function ProductArt({ category, color, size = 120, style, image, alt }: Props) {
  const [imgError, setImgError] = useState(false);
  const id = 'g' + color.replace('#', '') + category;
  const anim: CSSProperties = {};

  // If real picture is provided and loads without error, render the photo
  if (image && !imgError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          ...anim,
          ...style,
        }}
      >
        <img
          src={image}
          alt={alt || 'Product Image'}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>
    );
  }

  // Fallback to procedurally drawn SVG artwork
  if (category === 'phone') {
    return (
      <svg width={size * 0.55} height={size} viewBox="0 0 110 200" style={{ ...anim, ...style }} aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={shade(color, 50)} />
            <stop offset="1" stopColor={shade(color, -40)} />
          </linearGradient>
        </defs>
        <rect x="6" y="4" width="98" height="192" rx="20" fill="#14181c" />
        <rect x="10" y="8" width="90" height="184" rx="17" fill={`url(#${id})`} />
        <rect x="18" y="16" width="52" height="56" rx="14" fill="rgba(0,0,0,.28)" />
        <circle cx="34" cy="32" r="9" fill="#0d1013" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
        <circle cx="56" cy="32" r="9" fill="#0d1013" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
        <circle cx="34" cy="56" r="9" fill="#0d1013" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
        <circle cx="56" cy="54" r="5" fill="#f6e7b0" />
        <circle cx="34" cy="32" r="3" fill="rgba(120,180,255,.7)" />
        <circle cx="56" cy="32" r="3" fill="rgba(120,180,255,.7)" />
        <path d="M20 150 Q55 120 90 160" stroke="rgba(255,255,255,.18)" strokeWidth="14" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === 'audio') {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" style={{ ...anim, ...style }} aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={shade(color, 60)} />
            <stop offset="1" stopColor={shade(color, -30)} />
          </linearGradient>
        </defs>
        <rect x="26" y="70" width="108" height="64" rx="28" fill="#eef3f2" stroke="#d6e2df" strokeWidth="2" />
        <path d="M26 102 H134" stroke="#d6e2df" strokeWidth="2" />
        <circle cx="64" cy="60" r="20" fill={`url(#${id})`} />
        <rect x="58" y="70" width="12" height="26" rx="6" fill={`url(#${id})`} />
        <circle cx="106" cy="60" r="20" fill={`url(#${id})`} />
        <rect x="100" y="70" width="12" height="26" rx="6" fill={`url(#${id})`} />
        <circle cx="64" cy="60" r="7" fill="rgba(255,255,255,.35)" />
        <circle cx="106" cy="60" r="7" fill="rgba(255,255,255,.35)" />
      </svg>
    );
  }

  if (category === 'appliance') {
    return (
      <svg width={size} height={size * 0.82} viewBox="0 0 160 130" style={{ ...anim, ...style }} aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={shade(color, 45)} />
            <stop offset="1" stopColor={shade(color, -35)} />
          </linearGradient>
        </defs>
        <rect x="10" y="8" width="140" height="96" rx="8" fill="#1e293b" />
        <rect x="15" y="13" width="130" height="86" rx="4" fill={`url(#${id})`} />
        <path d="M72 104 L62 122 H98 L88 104 Z" fill="#475569" />
        <rect x="52" y="122" width="56" height="4" rx="2" fill="#334155" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" style={{ ...anim, ...style }} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(color, 55)} />
          <stop offset="1" stopColor={shade(color, -35)} />
        </linearGradient>
      </defs>
      <rect x="44" y="34" width="72" height="92" rx="16" fill={`url(#${id})`} />
      <rect x="54" y="46" width="52" height="68" rx="10" fill="rgba(255,255,255,.22)" />
      <path d="M86 52 L72 84 H82 L76 110 L96 76 H85 Z" fill="#f6c445" />
      <rect x="70" y="124" width="20" height="10" rx="3" fill="#9aa8a5" />
      <path d="M80 134 Q80 150 104 150" stroke="#9aa8a5" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
