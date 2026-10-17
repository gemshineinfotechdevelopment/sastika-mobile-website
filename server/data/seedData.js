import fs from 'fs';

const productsRaw = fs.readFileSync(new URL('./products.json', import.meta.url), 'utf-8');
export const SEED_PRODUCTS = JSON.parse(productsRaw);

export const SEED_ORDERS = [
  {
    id: '#SM-884220',
    customer: 'Rajesh Kumar',
    phone: '+91 98401 23456',
    city: 'Chennai',
    address: 'Flat 402, Lotus Residency, Anna Salai',
    items: [
      { productId: 'p4', name: 'OnePlus Nord CE4 5G', qty: 1, price: 24999 },
      { productId: 'a4', name: 'Anker 65W GaN Fast Charger', qty: 1, price: 2299 }
    ],
    total: 27298,
    status: 'Packed',
    payment: 'UPI',
    date: '2026-10-17'
  },
  {
    id: '#SM-884219',
    customer: 'Ananya Sundaram',
    phone: '+91 99620 11223',
    city: 'Chennai',
    address: 'T. Nagar, Chennai',
    items: [
      { productId: 'p2', name: 'iPhone 15 Pro Max 256GB', qty: 1, price: 134900 }
    ],
    total: 134900,
    status: 'Shipped',
    payment: 'Credit Card',
    date: '2026-10-16'
  },
  {
    id: '#SM-884218',
    customer: 'M. Selvaraj',
    phone: '+91 97890 55677',
    city: 'Madurai',
    address: 'KK Nagar, Madurai',
    items: [
      { productId: 'p4', name: 'OnePlus Nord CE4 5G', qty: 1, price: 24999 }
    ],
    total: 24999,
    status: 'Placed',
    payment: 'COD',
    date: '2026-10-16'
  },
  {
    id: '#SM-884217',
    customer: 'R. Priya',
    phone: '+91 90030 99881',
    city: 'Coimbatore',
    address: 'RS Puram, Coimbatore',
    items: [
      { productId: 'a3', name: 'Spigen Ultra Hybrid MagFit Case', qty: 2, price: 1699 }
    ],
    total: 3398,
    status: 'Delivered',
    payment: 'UPI',
    date: '2026-10-15'
  },
  {
    id: '#SM-884216',
    customer: 'Karthik N.',
    phone: '+91 98945 66120',
    city: 'Chennai',
    address: 'OMR, Chennai',
    items: [
      { productId: 'p3', name: 'Samsung Galaxy S24 Ultra 512GB', qty: 1, price: 129999 }
    ],
    total: 129999,
    status: 'Delivered',
    payment: 'Net Banking',
    date: '2026-10-14'
  },
  {
    id: '#SM-884215',
    customer: 'Divya S.',
    phone: '+91 98400 44556',
    city: 'Trichy',
    address: 'Thillai Nagar, Trichy',
    items: [
      { productId: 'a2', name: 'Sony WF-1000XM5 Earbuds', qty: 1, price: 19990 }
    ],
    total: 19990,
    status: 'Cancelled',
    payment: 'Credit Card',
    date: '2026-10-13'
  }
];

export const SEED_TICKETS = [
  {
    id: 'SR-5521',
    customer: 'Arun K.',
    phone: '+91 98400 12345',
    device: 'OnePlus 11 5G (Eternal Green)',
    issue: 'Fluid AMOLED display panel assembly',
    status: 'In Progress',
    tech: 'Mahesh (Certified)',
    eta: 'Today, 5:30 PM',
    cost: 8499
  },
  {
    id: 'SR-5520',
    customer: 'Meena P.',
    phone: '+91 98410 22334',
    device: 'Apple iPhone 14',
    issue: 'Battery replacement',
    status: 'Open',
    tech: 'Unassigned',
    eta: 'Tomorrow',
    cost: 6499
  },
  {
    id: 'SR-5519',
    customer: 'Sathish B.',
    phone: '+91 97910 88776',
    device: 'Samsung Galaxy S23 Ultra',
    issue: 'Camera lens repair',
    status: 'Ready',
    tech: 'Imran',
    eta: 'Ready for pickup',
    cost: 3299
  },
  {
    id: 'SR-5518',
    customer: 'Lakshmi V.',
    phone: '+91 98940 11992',
    device: 'Xiaomi Redmi Note 13 Pro',
    issue: 'Software & OS fix',
    status: 'Closed',
    tech: 'Mahesh (Certified)',
    eta: 'Delivered',
    cost: 499
  },
  {
    id: 'SR-5517',
    customer: 'Vignesh T.',
    phone: '+91 90030 77881',
    device: 'OnePlus Nord CE4',
    issue: 'Charging port repair',
    status: 'In Progress',
    tech: 'Imran',
    eta: 'Today, 7:00 PM',
    cost: 1299
  }
];
