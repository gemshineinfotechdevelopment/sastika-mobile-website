import fs from 'fs';

const productsRaw = fs.readFileSync(new URL('./products.json', import.meta.url), 'utf-8');
export const SEED_PRODUCTS = JSON.parse(productsRaw);

export const SEED_ORDERS = [
  {
    id: '#SM-884220',
    customer: 'Rajesh Kumar',
    phone: '+91 98401 23456',
    city: 'Sivakasi',
    address: '42 Gandhi Road, Sivakasi',
    items: [
      { productId: 'p3', name: 'OPPO K14x 5G (6GB + 128GB) Blue', qty: 1, price: 14499 }
    ],
    total: 14499,
    status: 'Packed',
    payment: 'UPI',
    date: '2026-10-17'
  },
  {
    id: '#SM-884219',
    customer: 'Ananya Sundaram',
    phone: '+91 99620 11223',
    city: 'Sithurajapuram',
    address: 'Sri Renga Complex, Sithurajapuram',
    items: [
      { productId: 'p1', name: 'Redmi A7 Pro 5G (4GB + 64GB) Orange', qty: 1, price: 9999 }
    ],
    total: 9999,
    status: 'Shipped',
    payment: 'Credit Card',
    date: '2026-10-16'
  },
  {
    id: '#SM-884218',
    customer: 'M. Selvaraj',
    phone: '+91 97890 55677',
    city: 'Sivakasi',
    address: 'Near Bus Stand, Sivakasi',
    items: [
      { productId: 'p9', name: 'Nothing 4b 5G (8GB + 256GB) White', qty: 1, price: 27999 }
    ],
    total: 27999,
    status: 'Placed',
    payment: 'COD',
    date: '2026-10-16'
  },
  {
    id: '#SM-884217',
    customer: 'R. Priya',
    phone: '+91 90030 99881',
    city: 'Sivakasi',
    address: 'Police Station Road, Sivakasi',
    items: [
      { productId: 'p7', name: 'Vivo Y11 5G (4GB + 64GB) Gold', qty: 1, price: 9499 }
    ],
    total: 9499,
    status: 'Delivered',
    payment: 'UPI',
    date: '2026-10-15'
  },
  {
    id: '#SM-884216',
    customer: 'Karthik N.',
    phone: '+91 98945 66120',
    city: 'Sithurajapuram',
    address: 'Kennedy Medical Road, Sithurajapuram',
    items: [
      { productId: 'p17', name: 'OPPO Reno 16c 5G (12GB + 256GB) Twilight Violet', qty: 1, price: 29999 }
    ],
    total: 29999,
    status: 'Delivered',
    payment: 'Net Banking',
    date: '2026-10-14'
  },
  {
    id: '#SM-884215',
    customer: 'Divya S.',
    phone: '+91 98400 44556',
    city: 'Sivakasi',
    address: 'South Car Street, Sivakasi',
    items: [
      { productId: 'p14', name: 'Poco C85x 5G (4GB + 64GB) Green', qty: 1, price: 8999 }
    ],
    total: 8999,
    status: 'Placed',
    payment: 'UPI',
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
