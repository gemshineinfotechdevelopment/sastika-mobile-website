import type { CSSProperties } from 'react';

export const C = {
  primary: '#0b4a43',
  primaryDark: '#06332e',
  primarySoft: '#14695f',
  tint: '#e4f3ef',
  tint2: '#f0f8f6',
  accent: '#f6c445',
  accentDark: '#d9a521',
  bg: '#f2f8f7',
  text: '#10211e',
  muted: '#6a7f7a',
  border: '#d8e8e4',
  danger: '#e5484d',
  dangerSoft: '#fdecec',
  success: '#1f9d6b',
  successSoft: '#e1f6ec',
  warn: '#d98a0b',
  warnSoft: '#fff3dc',
  info: '#2f6fed',
  infoSoft: '#e6eeff',
  white: '#ffffff',
};

export const FONT = "'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',sans-serif";

export const money = (n: number): string => '₹' + Math.round(n).toLocaleString('en-IN');

export const card: CSSProperties = {
  background: '#fff',
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  boxShadow: '0 4px 18px rgba(11,74,67,.06)',
};

export const discount = (price: number, mrp: number): number =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
