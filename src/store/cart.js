// Cart state: localStorage-backed external store, read by React through useSyncExternalStore
// (see hooks/useCart.js). The snapshot is recomputed once per change, so it is referentially stable.
import { byId } from '../data/menu.js';
import { PROMOS, priceItems } from '../lib/pricing.js';

const KEY = 'smak-cart-v1';
const listeners = new Set();

const empty = () => ({ items: [], promo: null, zone: null });

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && Array.isArray(raw.items)) return { ...empty(), ...raw, items: raw.items.filter((i) => byId(i.id)) };
  } catch { /* storage blocked or corrupted */ }
  return empty();
}

let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

let snap = null;
let lastChange = { type: 'init' };

function emit(change) {
  save();
  snap = compute();
  lastChange = change;
  listeners.forEach((fn) => fn());
}

// Cross-tab sync
window.addEventListener('storage', (e) => {
  if (e.key === KEY) { state = load(); snap = compute(); lastChange = { type: 'sync' }; listeners.forEach((fn) => fn()); }
});

const addonKey = (addons) => (addons ? Object.entries(addons).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).sort().join('|') : '');

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** What caused the latest snapshot: add / qty / remove / promo / zone / replace / clear / sync */
export const getLastChange = () => lastChange;

export function add(id, qty = 1, addons = null) {
  const key = `${id}#${addonKey(addons)}`;
  const line = state.items.find((i) => i.key === key);
  if (line) line.qty += qty;
  else state.items.push({ key, id, qty, addons });
  emit({ type: 'add', id });
}

export function setQty(key, qty) {
  const line = state.items.find((i) => i.key === key);
  if (!line) return;
  if (qty <= 0) state.items = state.items.filter((i) => i.key !== key);
  else line.qty = qty;
  emit({ type: qty <= 0 ? 'remove' : 'qty', id: line.id });
}

/** Decrement for a dish id (plain line first) — used by dish-row steppers */
export function decrement(id) {
  const lines = state.items.filter((i) => i.id === id);
  const line = lines.find((i) => i.key === `${id}#`) || lines[lines.length - 1];
  if (line) setQty(line.key, line.qty - 1);
}

export const qtyOf = (id) => state.items.filter((i) => i.id === id).reduce((s, i) => s + i.qty, 0);

export function clear() { state.items = []; state.promo = null; emit({ type: 'clear' }); }

export function replaceItems(items) {
  state.items = items.filter((i) => byId(i.id)).map((i) => ({ ...i }));
  emit({ type: 'replace' });
}

export function applyPromo(code) {
  const c = code.trim().toUpperCase();
  if (!PROMOS[c]) return false;
  state.promo = c; emit({ type: 'promo' }); return true;
}

export function setZone(zoneId) { state.zone = zoneId; emit({ type: 'zone' }); }

const compute = () => priceItems({ items: state.items, promo: state.promo, zoneId: state.zone });

snap = compute();
export const totals = () => snap;

export const snapshot = () => JSON.parse(JSON.stringify(state.items));
