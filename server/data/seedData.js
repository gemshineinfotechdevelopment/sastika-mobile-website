import fs from 'fs';

const productsRaw = fs.readFileSync(new URL('./products.json', import.meta.url), 'utf-8');
export const SEED_PRODUCTS = JSON.parse(productsRaw);

const getPastDateStr = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const SEED_ORDERS = [];

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
