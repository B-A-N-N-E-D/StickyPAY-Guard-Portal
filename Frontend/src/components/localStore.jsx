// ─── StickyPAY Local Data Store ───────────────────────────────────────────────
// All data lives in localStorage. No database. No SDK.

const GUARDS_KEY = 'stickypay_guards';
const ORDERS_KEY = 'stickypay_orders';

// ── Seed Data ────────────────────────────────────────────────────────────────

const SEED_GUARDS = [
  { id: 'g1', guard_name: 'Ravi Kumar',  guard_id: 'GRD-001', pin: '1234', credits: 100, total_verified: 0,  is_active: false, shift_start: null, shift_end: null },
  { id: 'g2', guard_name: 'Meena Singh', guard_id: 'GRD-002', pin: '5678', credits: 88,  total_verified: 12, is_active: false, shift_start: null, shift_end: null },
  { id: 'g3', guard_name: 'Admin Guard', guard_id: 'ADMIN',   pin: '0000', credits: 100, total_verified: 0,  is_active: false, shift_start: null, shift_end: null },
];

const _now = Date.now();
const SEED_ORDERS = [
  {
    id: 'ord1', transaction_id: 'TXN-10001', store_name: 'Big Bazaar',
    customer_name: 'Arjun Sharma', total_amount: 1250.00, currency: 'INR',
    payment_method: 'upi', status: 'paid',
    created_date: new Date(_now - 3_600_000).toISOString(), verified_date: null,
    items: [
      { name: 'Rice 5kg',    quantity: 2, price: 300 },
      { name: 'Cooking Oil', quantity: 1, price: 350 },
      { name: 'Sugar 1kg',   quantity: 3, price: 100 },
    ],
  },
  {
    id: 'ord2', transaction_id: 'TXN-10002', store_name: 'Reliance Fresh',
    customer_name: 'Priya Patel', total_amount: 875.50, currency: 'INR',
    payment_method: 'card', status: 'verified',
    created_date: new Date(_now - 7_200_000).toISOString(),
    verified_date: new Date(_now - 5_000_000).toISOString(),
    items: [
      { name: 'Vegetables Assorted', quantity: 1, price: 450 },
      { name: 'Mixed Fruits',        quantity: 1, price: 425.50 },
    ],
  },
  {
    id: 'ord3', transaction_id: 'TXN-10003', store_name: 'DMart',
    customer_name: 'Suresh Iyer', total_amount: 3420.00, currency: 'INR',
    payment_method: 'cash', status: 'paid',
    created_date: new Date(_now - 10_800_000).toISOString(), verified_date: null,
    items: [
      { name: 'Washing Machine (small)', quantity: 1, price: 2800 },
      { name: 'Detergent 2kg',           quantity: 3, price: 140 },
    ],
  },
  {
    id: 'ord4', transaction_id: 'TXN-10004', store_name: 'Big Bazaar',
    customer_name: 'Anjali Verma', total_amount: 560.00, currency: 'INR',
    payment_method: 'wallet', status: 'verified',
    created_date: new Date(_now - 14_400_000).toISOString(),
    verified_date: new Date(_now - 13_000_000).toISOString(),
    items: [
      { name: 'Biscuits Pack', quantity: 4, price: 50 },
      { name: 'Juice 1L',      quantity: 6, price: 60 },
    ],
  },
  {
    id: 'ord5', transaction_id: 'TXN-10005', store_name: "Spencer's",
    customer_name: 'Rahul Mehta', total_amount: 210.00, currency: 'INR',
    payment_method: 'upi', status: 'cancelled',
    created_date: new Date(_now - 18_000_000).toISOString(), verified_date: null,
    items: [{ name: 'Coffee Jar', quantity: 1, price: 210 }],
  },
];

// ── Init / Seed ───────────────────────────────────────────────────────────────

function seedIfEmpty() {
  if (!localStorage.getItem(GUARDS_KEY)) {
    localStorage.setItem(GUARDS_KEY, JSON.stringify(SEED_GUARDS));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
  }
}

// ── Guards ────────────────────────────────────────────────────────────────────

function getGuards() {
  seedIfEmpty();
  return JSON.parse(localStorage.getItem(GUARDS_KEY) || '[]');
}

function saveGuards(guards) {
  localStorage.setItem(GUARDS_KEY, JSON.stringify(guards));
}

export function findGuard(guard_id) {
  return getGuards().find(g => g.guard_id === guard_id) || null;
}

export function updateGuard(id, data) {
  const guards = getGuards();
  const idx = guards.findIndex(g => g.id === id);
  if (idx === -1) return null;
  guards[idx] = { ...guards[idx], ...data };
  saveGuards(guards);
  return guards[idx];
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function getOrders() {
  seedIfEmpty();
  const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  return raw.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function findOrder(txnOrId) {
  const orders = getOrders();
  return (
    orders.find(o => o.transaction_id === txnOrId) ||
    orders.find(o => o.id === txnOrId) ||
    null
  );
}

export function updateOrder(id, data) {
  const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const idx = raw.findIndex(o => o.id === id);
  if (idx === -1) return null;
  raw[idx] = { ...raw[idx], ...data };
  saveOrders(raw);
  return raw[idx];
}