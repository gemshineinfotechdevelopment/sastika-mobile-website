import type { Category } from './types';

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'iphones', label: 'iPhones' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'home-appliances', label: 'Home Appliances' },
];

export function isIPhone(cat?: string, brand?: string): boolean {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  if (c === 'iphones' || c === 'iphone') return true;
  if ((c === 'phone' || c === 'smartphones' || c === 'smartphone') && brand?.toLowerCase().trim() === 'apple') {
    return true;
  }
  return false;
}

export function isSmartphone(cat?: string, brand?: string): boolean {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  if (isIPhone(cat, brand)) return false;
  return c === 'smartphones' || c === 'smartphone' || c === 'phone';
}

export function isAccessory(cat?: string): boolean {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  return c === 'accessories' || c === 'accessory' || c === 'audio';
}

export function isAppliance(cat?: string): boolean {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  return (
    c === 'home-appliances' ||
    c === 'home appliances' ||
    c === 'appliance' ||
    c === 'appliances'
  );
}

export function getCanonicalCategory(
  cat?: string,
  brand?: string
): 'smartphones' | 'iphones' | 'accessories' | 'home-appliances' {
  if (isIPhone(cat, brand)) return 'iphones';
  if (isAppliance(cat)) return 'home-appliances';
  if (isAccessory(cat)) return 'accessories';
  return 'smartphones';
}

export function getCategoryLabel(cat?: string, brand?: string): string {
  const canonical = getCanonicalCategory(cat, brand);
  switch (canonical) {
    case 'iphones':
      return 'iPhones';
    case 'accessories':
      return 'Accessories';
    case 'home-appliances':
      return 'Home Appliances';
    default:
      return 'Smartphones';
  }
}
