import type { Order, Product, Testimonial, Ticket } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'OnePlus 12 5G (16GB RAM + 512GB)', brand: 'OnePlus', category: 'phone',
    price: 64999, mrp: 69999, rating: 4.8, reviews: 1470, color: '#2f7d6d', badge: 'Flowy Emerald', stock: 38, reorderAt: 10, sku: 'OP12-16-512-EM',
    storage: ['128GB', '256GB', '512GB'],
    specs: ['Snapdragon 8 Gen 3', '50MP Sony LYT-808 camera', '5400mAh • 100W SUPERVOOC', '2K 120Hz ProXDR LTPO AMOLED', 'IP65 splash & dust proofing', 'OxygenOS 14 based on Android 14'],
    description: 'Hasselblad-tuned triple camera, flagship Snapdragon performance and 100W charging in a flowing emerald finish.',
  },
  {
    id: 'p2', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', category: 'phone',
    price: 134900, mrp: 159900, rating: 4.9, reviews: 2210, color: '#8b8f96', badge: 'Natural Titanium', stock: 22, reorderAt: 8, sku: 'IP15PM-256-NT',
    storage: ['256GB', '512GB', '1TB'],
    specs: ['A17 Pro chip', '48MP main + 5x telephoto', 'Titanium design • USB-C', '6.7" Super Retina XDR ProMotion', 'Action button', 'iOS 17'],
    description: 'Titanium build, A17 Pro chip and a 5x telephoto camera system.',
  },
  {
    id: 'p3', name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', category: 'phone',
    price: 129999, mrp: 149999, rating: 4.8, reviews: 1980, color: '#6b5b45', badge: 'Titanium Gray', stock: 4, reorderAt: 8, sku: 'S24U-512-TG',
    storage: ['256GB', '512GB', '1TB'],
    specs: ['Snapdragon 8 Gen 3 for Galaxy', '200MP quad camera', 'Built-in S Pen', '6.8" QHD+ Dynamic AMOLED 2X', '5000mAh • 45W', 'Galaxy AI features'],
    description: 'Galaxy AI, a 200MP camera and the built-in S Pen on a flat titanium frame.',
  },
  {
    id: 'p4', name: 'OnePlus Nord CE4 5G', brand: 'OnePlus', category: 'phone',
    price: 24999, mrp: 26999, rating: 4.5, reviews: 1245, color: '#4b6b5a', badge: 'Dark Chrome', stock: 64, reorderAt: 15, sku: 'NCE4-8-128-DC',
    storage: ['128GB', '256GB'],
    specs: ['Snapdragon 7 Gen 3', '50MP Sony LYT-600 OIS', '5500mAh • 100W', '6.7" 120Hz AMOLED', 'Android 14'],
    description: 'Fast, smooth and built for all-day use.',
  },
  {
    id: 'p5', name: 'Redmi Note 13 Pro+ 5G', brand: 'Xiaomi', category: 'phone',
    price: 31999, mrp: 33999, rating: 4.6, reviews: 980, color: '#3a4a7a', badge: 'Fusion Purple', stock: 41, reorderAt: 12, sku: 'RN13P-12-256',
    storage: ['256GB', '512GB'],
    specs: ['Dimensity 7200 Ultra', '200MP OIS camera', '5000mAh • 120W HyperCharge', '1.5K curved AMOLED', 'IP68'],
    description: 'A 200MP camera and 120W charging in a curved-glass body.',
  },
  {
    id: 'p6', name: 'Vivo X100 Pro 5G', brand: 'Vivo', category: 'phone',
    price: 89999, mrp: 99999, rating: 4.7, reviews: 640, color: '#2a2f3a', badge: 'Asteroid Black', stock: 17, reorderAt: 6, sku: 'VX100P-16-512',
    storage: ['256GB', '512GB'],
    specs: ['Dimensity 9300', 'ZEISS APO telephoto', '5400mAh • 100W', '6.78" LTPO AMOLED', 'IP68'],
    description: 'ZEISS-tuned imaging with a flagship Dimensity 9300 chip.',
  },
  {
    id: 'p7', name: 'iQOO 12 5G', brand: 'iQOO', category: 'phone',
    price: 52999, mrp: 59999, rating: 4.6, reviews: 720, color: '#c0392b', badge: 'Legend Edition', stock: 29, reorderAt: 10, sku: 'IQ12-12-256',
    storage: ['256GB', '512GB'],
    specs: ['Snapdragon 8 Gen 3', '50MP OIS main camera', '5000mAh • 120W', '6.78" 144Hz AMOLED', 'Dedicated Q1 gaming chip'],
    description: 'Gaming-first flagship with a dedicated Q1 chip.',
  },
  {
    id: 'p8', name: 'Samsung Galaxy S24 5G', brand: 'Samsung', category: 'phone',
    price: 74999, mrp: 79999, rating: 4.5, reviews: 860, color: '#7a6fa8', badge: 'Marble Gray', stock: 31, reorderAt: 10, sku: 'S24-8-256',
    storage: ['128GB', '256GB', '512GB'],
    specs: ['Exynos 2400', '50MP triple camera', '4000mAh • 25W', '6.2" Dynamic AMOLED 2X', 'Galaxy AI'],
    description: 'Compact flagship with Galaxy AI.',
  },
  {
    id: 'a1', name: 'Apple MagSafe Wireless Charger', brand: 'Apple', category: 'accessory',
    price: 3900, mrp: 4500, rating: 4.7, reviews: 540, color: '#e8ecef', badge: '15W Fast Charge', stock: 120, reorderAt: 25, sku: 'AC-MSC-15',
    specs: ['15W MagSafe charging', 'USB-C cable', 'Works with iPhone 12 and later'],
    description: 'Snap-on magnetic wireless charging.',
  },
  {
    id: 'a2', name: 'Sony WF-1000XM5 Earbuds', brand: 'Sony', category: 'audio',
    price: 19990, mrp: 24990, rating: 4.8, reviews: 1100, color: '#2b2b2f', badge: 'Noise Cancelling', stock: 7, reorderAt: 10, sku: 'AU-SNY-XM5',
    specs: ['Industry-leading ANC', '8h battery (24h with case)', 'LDAC hi-res audio', 'IPX4'],
    description: 'Compact earbuds with best-in-class noise cancelling.',
  },
  {
    id: 'a3', name: 'Spigen Ultra Hybrid MagFit Case', brand: 'Spigen', category: 'accessory',
    price: 1699, mrp: 2299, rating: 4.7, reviews: 1890, color: '#cfd8dc', badge: 'Clear', stock: 210, reorderAt: 40, sku: 'AC-SPG-UH',
    specs: ['Crystal-clear back', 'MagSafe compatible', 'Military-grade drop protection'],
    description: 'Slim, clear and magnetic.',
  },
  {
    id: 'a4', name: 'Anker 65W GaN Fast Charger', brand: 'Anker', category: 'accessory',
    price: 2299, mrp: 3299, rating: 4.8, reviews: 2390, color: '#37474f', badge: 'Best Seller', stock: 88, reorderAt: 20, sku: 'AC-ANK-65',
    specs: ['65W GaN technology', '3 ports (2 USB-C + 1 USB-A)', 'Foldable plug'],
    description: 'Charge a laptop and two phones from one tiny brick.',
  },
  {
    id: 'a5', name: 'Galaxy Buds2 Pro', brand: 'Samsung', category: 'audio',
    price: 8999, mrp: 17999, rating: 4.6, reviews: 1540, color: '#7e57c2', badge: '50% OFF', stock: 45, reorderAt: 12, sku: 'AU-SAM-B2P',
    specs: ['24-bit Hi-Fi audio', 'Intelligent ANC', 'IPX7'],
    description: 'Hi-Fi earbuds with intelligent noise control.',
  },
  {
    id: 'a6', name: 'Tempered Glass 9H (2-Pack)', brand: 'Sastika', category: 'accessory',
    price: 999, mrp: 1499, rating: 4.6, reviews: 870, color: '#b0bec5', badge: 'Installation Kit', stock: 340, reorderAt: 60, sku: 'AC-SAS-TG',
    specs: ['9H hardness', 'Anti-fingerprint coating', 'Free alignment frame'],
    description: 'Scratch-proof screen cover with an easy install frame.',
  },
  {
    id: 'a7', name: 'Anker 20000mAh Power Bank', brand: 'Anker', category: 'accessory',
    price: 2799, mrp: 3999, rating: 4.7, reviews: 1320, color: '#455a64', badge: '30W PD', stock: 56, reorderAt: 15, sku: 'AC-ANK-PB20',
    specs: ['20000mAh capacity', '30W PD output', 'Dual USB-C'],
    description: 'Two full phone charges in your pocket.',
  },
  {
    id: 'a8', name: 'OnePlus Buds Pro 2', brand: 'OnePlus', category: 'audio',
    price: 8999, mrp: 11999, rating: 4.6, reviews: 910, color: '#2f7d6d', badge: 'Dual Drivers', stock: 33, reorderAt: 10, sku: 'AU-OP-BP2',
    specs: ['Dual drivers with Dynaudio tuning', 'Adaptive ANC', '39h total battery'],
    description: 'Dynaudio-tuned buds with adaptive noise cancelling.',
  },
];

export const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Vivo', 'Xiaomi', 'iQOO'];

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Kavitha R.', meta: 'Bought iPhone 15 Pro Max', text: 'Upgraded to the iPhone 15 Pro Max at Sastika. Their technician helped migrate my WhatsApp data seamlessly without losing a single message.' },
  { name: 'Dr. Rajeshwari S.', meta: 'Verified • T. Nagar', text: 'The staff transferred 128GB of my medical photos and clinic chats without losing a single file. Genuinely warm customer care.' },
  { name: 'Arun K.', meta: 'Bought OnePlus 12', text: 'Genuine product, GST invoice and a same-day delivery. Cleanest buying experience I have had.' },
  { name: 'Meena P.', meta: 'Screen repair customer', text: 'Original display fitted in one afternoon with a 1-year warranty card. Honest pricing, no surprises.' },
];

export const SEED_ORDERS: Order[] = [
  { id: '#SM-884220', customer: 'Rajesh Kumar', phone: '+91 98401 23456', city: 'Chennai', address: 'Flat 402, Lotus Residency, Anna Salai', items: [{ productId: 'p4', name: 'OnePlus Nord CE4 5G', qty: 1, price: 24999 }, { productId: 'a4', name: 'Anker 65W GaN Fast Charger', qty: 1, price: 2299 }], total: 27298, status: 'Packed', payment: 'UPI', date: '2026-10-17' },
  { id: '#SM-884219', customer: 'Ananya Sundaram', phone: '+91 99620 11223', city: 'Chennai', address: 'T. Nagar, Chennai', items: [{ productId: 'p2', name: 'iPhone 15 Pro Max 256GB', qty: 1, price: 134900 }], total: 134900, status: 'Shipped', payment: 'Credit Card', date: '2026-10-16' },
  { id: '#SM-884218', customer: 'M. Selvaraj', phone: '+91 97890 55677', city: 'Madurai', address: 'KK Nagar, Madurai', items: [{ productId: 'p4', name: 'OnePlus Nord CE4 5G', qty: 1, price: 24999 }], total: 24999, status: 'Placed', payment: 'COD', date: '2026-10-16' },
  { id: '#SM-884217', customer: 'R. Priya', phone: '+91 90030 99881', city: 'Coimbatore', address: 'RS Puram, Coimbatore', items: [{ productId: 'a3', name: 'Spigen Ultra Hybrid MagFit Case', qty: 2, price: 1699 }], total: 3398, status: 'Delivered', payment: 'UPI', date: '2026-10-15' },
  { id: '#SM-884216', customer: 'Karthik N.', phone: '+91 98945 66120', city: 'Chennai', address: 'OMR, Chennai', items: [{ productId: 'p3', name: 'Samsung Galaxy S24 Ultra 512GB', qty: 1, price: 129999 }], total: 129999, status: 'Delivered', payment: 'Net Banking', date: '2026-10-14' },
  { id: '#SM-884215', customer: 'Divya S.', phone: '+91 98400 44556', city: 'Trichy', address: 'Thillai Nagar, Trichy', items: [{ productId: 'a2', name: 'Sony WF-1000XM5 Earbuds', qty: 1, price: 19990 }], total: 19990, status: 'Cancelled', payment: 'Credit Card', date: '2026-10-13' },
];

export const SEED_TICKETS: Ticket[] = [
  { id: 'SR-5521', customer: 'Arun K.', phone: '+91 98400 12345', device: 'OnePlus 11 5G (Eternal Green)', issue: 'Fluid AMOLED display panel assembly', status: 'In Progress', tech: 'Mahesh (Certified)', eta: 'Today, 5:30 PM', cost: 8499 },
  { id: 'SR-5520', customer: 'Meena P.', phone: '+91 98410 22334', device: 'Apple iPhone 14', issue: 'Battery replacement', status: 'Open', tech: 'Unassigned', eta: 'Tomorrow', cost: 6499 },
  { id: 'SR-5519', customer: 'Sathish B.', phone: '+91 97910 88776', device: 'Samsung Galaxy S23 Ultra', issue: 'Camera lens repair', status: 'Ready', tech: 'Imran', eta: 'Ready for pickup', cost: 3299 },
  { id: 'SR-5518', customer: 'Lakshmi V.', phone: '+91 98940 11992', device: 'Xiaomi Redmi Note 13 Pro', issue: 'Software & OS fix', status: 'Closed', tech: 'Mahesh (Certified)', eta: 'Delivered', cost: 499 },
  { id: 'SR-5517', customer: 'Vignesh T.', phone: '+91 90030 77881', device: 'OnePlus Nord CE4', issue: 'Charging port repair', status: 'In Progress', tech: 'Imran', eta: 'Today, 7:00 PM', cost: 1299 },
];

export const SERVICES = [
  { id: 'screen', icon: 'phone', title: 'Screen Replacement', desc: 'Original OEM display, 1-year warranty', price: 1499 },
  { id: 'battery', icon: 'zap', title: 'Battery Replacement', desc: 'Certified cell, same-day fitting', price: 899 },
  { id: 'software', icon: 'cpu', title: 'Software & OS Fix', desc: 'Bootloop, update and recovery fixes', price: 499 },
  { id: 'data', icon: 'refresh', title: 'Data Migration', desc: 'WhatsApp, photos and contacts moved safely', price: 299 },
  { id: 'diag', icon: 'search', title: '42-Point Diagnostics', desc: 'Mic, speaker, thermals, motherboard and more', price: 0 },
  { id: 'cloud', icon: 'shield', title: 'Setup & Cloud Sync', desc: 'Backup, app setup and account sync', price: 299 },
] as const;

export const STORES = [
  { name: 'T. Nagar Flagship', addr: 'Usman Road, T. Nagar, Chennai 600017', hours: '10:00 AM – 09:30 PM', tag: 'Flagship Experience' },
  { name: 'OMR Tech Hub', addr: 'Sholinganallur, OMR, Chennai 600119', hours: '10:00 AM – 09:00 PM', tag: 'Service Lab' },
  { name: 'Anna Nagar', addr: '2nd Avenue, Anna Nagar, Chennai 600040', hours: '10:30 AM – 09:00 PM', tag: 'Express Lounge' },
];

export const REVENUE_SERIES = [
  { label: 'Mon', value: 82 }, { label: 'Tue', value: 96 }, { label: 'Wed', value: 74 },
  { label: 'Thu', value: 118 }, { label: 'Fri', value: 134 }, { label: 'Sat', value: 168 }, { label: 'Sun', value: 142 },
];
