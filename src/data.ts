import type { Order, Product, Testimonial, Ticket } from './types';

export const PRODUCTS: Product[] = [];

export const BRANDS: string[] = [];

/** Extract unique brand names from products without duplicates, case-insensitively */
export function getUniqueProductBrands(products: { brand?: string }[]): string[] {
  const map = new Map<string, string>();
  products.forEach((p) => {
    const raw = (p.brand || '').trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    if (!map.has(key)) {
      map.set(key, raw);
    }
  });
  return Array.from(map.values());
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Kavitha R.', meta: 'Customer', text: 'Purchased smartphone at Sastikaa Mobiles Sivakasi. The staff helped migrate my WhatsApp data seamlessly without losing a single message.' },
  { name: 'Dr. Rajeshwari S.', meta: 'Verified • Sivakasi', text: 'The staff transferred 128GB of my medical photos and clinic chats without losing a single file. Genuinely warm customer care.' },
  { name: 'Arun K.', meta: 'Customer', text: 'Genuine product, GST invoice and same-day delivery in Sithurajapuram. Cleanest buying experience I have had.' },
  { name: 'Meena P.', meta: 'Screen repair customer', text: 'Original display fitted in one afternoon with a 1-year warranty card. Honest pricing, no surprises.' },
];

export const SEED_ORDERS: Order[] = [];

export const SEED_TICKETS: Ticket[] = [];

export const SERVICES = [
  { id: 'screen', icon: 'phone', title: 'Screen Replacement', desc: 'Original OEM display, 1-year warranty', price: 1499 },
  { id: 'battery', icon: 'zap', title: 'Battery Replacement', desc: 'Certified cell, same-day fitting', price: 899 },
  { id: 'software', icon: 'cpu', title: 'Software & OS Fix', desc: 'Bootloop, update and recovery fixes', price: 499 },
  { id: 'data', icon: 'refresh', title: 'Data Migration', desc: 'WhatsApp, photos and contacts moved safely', price: 299 },
  { id: 'diag', icon: 'search', title: '42-Point Diagnostics', desc: 'Mic, speaker, thermals, motherboard and more', price: 0 },
  { id: 'cloud', icon: 'shield', title: 'Setup & Cloud Sync', desc: 'Backup, app setup and account sync', price: 299 },
] as const;

export const STORES = [
  {
    name: 'Sastikaa Mobiles - Main Store',
    addr: 'Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189',
    hours: '09:30 AM – 09:30 PM (Mon - Sun)',
    tag: 'Flagship Showroom & Service Center',
  },
];

export const REVENUE_SERIES: { label: string; value: number }[] = [];
