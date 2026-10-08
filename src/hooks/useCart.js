import { useSyncExternalStore } from 'react';
import { subscribe, totals, qtyOf } from '../store/cart.js';

/** Live cart totals: { lines, count, subtotal, delivery, discount, total, promo, toFree, … } */
export const useCart = () => useSyncExternalStore(subscribe, totals);

/** Quantity of one dish across all its add-on variants (re-renders only when it changes) */
export const useQty = (id) => useSyncExternalStore(subscribe, () => qtyOf(id));
