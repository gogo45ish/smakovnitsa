// Order pricing — shared by the cart store (browser) and the order API (server/index.js),
// so the total a customer sees is the total they are charged. Pure: no DOM, no storage.
import { byId } from '../data/menu.js';
import { ZONES, DEFAULT_FREE_FROM } from '../data/zones.js';

export const PROMOS = { 'СМАК10': 0.1, 'SMAK10': 0.1 };

/** items: [{ id, qty, ... }] (unknown ids must be filtered out first); pickup drops the delivery fee */
export function priceItems({ items, promo = null, zoneId = null, pickup = false }) {
  const lines = items.map((i) => {
    const dish = byId(i.id);
    return { ...i, dish, sum: dish.price * i.qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.sum, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const zone = ZONES.find((z) => z.id === zoneId) || null;
  const freeFrom = zone ? zone.freeFrom : DEFAULT_FREE_FROM;
  const baseFee = zone ? zone.fee : 290;
  const delivery = !count || pickup ? 0 : freeFrom != null && subtotal >= freeFrom ? 0 : baseFee;
  const discount = promo && PROMOS[promo] ? Math.round(subtotal * PROMOS[promo]) : 0;
  return {
    lines, count, subtotal, delivery, discount, freeFrom, zone,
    promo: promo && PROMOS[promo] ? promo : null,
    toFree: freeFrom != null ? Math.max(0, freeFrom - subtotal) : null,
    total: subtotal + delivery - discount,
  };
}
