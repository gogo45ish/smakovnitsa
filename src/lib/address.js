// Mock address → zone checker — design.md §6.2, §12
// Replace checkAddress() with a real geocoder + polygon lookup when the backend is ready.
import { ZONES } from '../data/zones.js';
import { rub } from './format.js';

export const SUGGEST = [
  'Тверская ул., 12', 'Тверская ул., 18к1', 'Арбат, 24', 'Покровка, 17', 'Мясницкая ул., 35',
  'Ленинский пр-т, 45', 'Кутузовский пр-т, 30', 'Профсоюзная ул., 56', 'Варшавское ш., 87',
  'Ул. Бутлерова, 4', 'Алтуфьевское ш., 48', 'Ул. Новокосинская, 11', 'Зеленоград, корп. 1106',
];

const OUT_OF_ZONE = /зеленоград|подольск|балашиха|область|\bмо\b/i;

export function checkAddress(raw) {
  const value = raw.trim();
  if (value.length < 4 || !/\d/.test(value)) return { error: 'Укажите улицу и номер дома' };
  if (OUT_OF_ZONE.test(value)) return { out: true };
  // Stable pseudo-zone from the string so the same address always gets the same answer
  const hash = [...value.toLowerCase()].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const r = hash % 10;
  return { zone: ZONES[r < 5 ? 0 : r < 8 ? 1 : 2] };
}

export function zoneMessage(zone) {
  const free = zone.freeFrom ? `бесплатно от ${rub(zone.freeFrom)}` : `доставка ${rub(zone.fee)}`;
  return `Доставим за ~${zone.eta} мин · ${free}`;
}

const ADDRESS_KEY = 'smak-address';
export const savedAddress = () => { try { return localStorage.getItem(ADDRESS_KEY) || ''; } catch { return ''; } };
export const saveAddress = (v) => { try { localStorage.setItem(ADDRESS_KEY, v); } catch { /* ignore */ } };
