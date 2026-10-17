import type { CartLine, Product } from '../types';

export const COUPONS: Record<string, { amount: number; label: string }> = {
  FESTIVAL2000: { amount: 2000, label: 'Festive offer' },
  WELCOME500: { amount: 500, label: 'Welcome offer' },
};

export interface Totals {
  lines: { product: Product; qty: number }[];
  mrpTotal: number;
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  delivery: number;
  payable: number;
  saved: number;
}

export function computeTotals(
  cart: CartLine[],
  products: Product[],
  coupon: string,
  getProduct?: (id: string) => Product | undefined,
): Totals {
  const lines = cart
    .map((l) => ({ product: getProduct ? getProduct(l.id) : products.find((p) => p.id === l.id), qty: l.qty }))
    .filter((l): l is { product: Product; qty: number } => !!l.product);
  const mrpTotal = lines.reduce((n, l) => n + l.product.mrp * l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0);
  const productDiscount = mrpTotal - subtotal;
  const c = COUPONS[coupon.toUpperCase()];
  const couponDiscount = c && subtotal > 0 ? Math.min(c.amount, subtotal) : 0;
  const payable = Math.max(0, subtotal - couponDiscount);
  return { lines, mrpTotal, subtotal, productDiscount, couponDiscount, delivery: 0, payable, saved: productDiscount + couponDiscount };
}
