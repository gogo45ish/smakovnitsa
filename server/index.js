// Order + payment API (ЮKassa). In production it also serves the built SPA from dist/.
// Prices are always recomputed here from src/data — whatever the browser sends is only a wish list.
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { byId } from '../src/data/menu.js';
import { PICKUP_ADDRESS } from '../src/data/zones.js';
import { payMethod } from '../src/data/payment.js';
import { priceItems } from '../src/lib/pricing.js';
import { checkAddress } from '../src/lib/address.js';
import { rub } from '../src/lib/format.js';
import * as store from './store.js';
import * as yookassa from './yookassa.js';

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_URL = (process.env.PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, '');
const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

class HttpError extends Error {
  constructor(status, message, field) { super(message); this.status = status; this.field = field; }
}
const bad = (message, field) => { throw new HttpError(400, message, field); };

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const ADDONS = { ginger: 'boolean', wasabi: 'boolean', soy: 'boolean', sticks: 'number' };

function cleanItems(raw) {
  if (!Array.isArray(raw) || !raw.length || raw.length > 100) bad('Корзина пуста');
  return raw.map((i) => {
    if (!byId(i?.id)) bad('В корзине есть блюдо, которого больше нет в меню. Обновите страницу.');
    const qty = Number(i.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) bad('Неверное количество');
    let addons = null;
    if (i.addons && typeof i.addons === 'object') {
      addons = Object.fromEntries(Object.entries(ADDONS).filter(([k, t]) => typeof i.addons[k] === t).map(([k]) => [k, i.addons[k]]));
    }
    return { key: str(i.key, 120) || `${i.id}#`, id: i.id, qty, addons };
  });
}

/** Turns the checkout form into a priced order, or throws a 400 with a message for the customer */
function buildOrder(b) {
  const pay = payMethod(b.pay);
  if (!pay) bad('Выберите способ оплаты');
  const name = str(b.name, 80);
  if (!name) bad('Как к вам обращаться?', 'name');
  const phone = String(b.phone ?? '').replace(/\D/g, '').replace(/^[78](?=\d{10}$)/, '');
  if (phone.length !== 10) bad('Введите номер полностью: +7 (___) ___-__-__', 'phone');
  if (b.consent !== true) bad('Без согласия мы не можем принять заказ', 'consent');

  const items = cleanItems(b.items);
  const pickup = b.method === 'pickup';
  let zone = null;
  if (!pickup) {
    const res = checkAddress(str(b.address));
    if (res.error) bad(res.error, 'address');
    if (res.out) bad('Адрес вне зоны доставки — выберите самовывоз', 'address');
    zone = res.zone;
  }
  const t = priceItems({ items, promo: str(b.promo, 20).toUpperCase() || null, zoneId: zone?.id, pickup });
  if (zone && t.subtotal < zone.min) bad(`Минимальный заказ для этой зоны — ${rub(zone.min)}. Добавьте ещё на ${rub(zone.min - t.subtotal)}.`, 'min');

  const slot = b.when === 'slot' ? str(b.slot, 20) : null;
  if (b.when === 'slot' && !/^(завтра )?\d{2}:\d{2}$/.test(slot)) bad('Выберите время доставки');

  return {
    id: randomUUID(),
    number: 4000 + Math.floor(Math.random() * 5000),
    status: pay.online ? 'awaiting_payment' : 'accepted',
    pay: pay.value,
    items,
    lines: t.lines.map((l) => ({ id: l.id, name: l.dish.name, price: l.dish.price, qty: l.qty })),
    subtotal: t.subtotal, delivery: t.delivery, discount: t.discount, total: t.total, promo: t.promo,
    method: pickup ? 'pickup' : 'courier',
    address: pickup ? PICKUP_ADDRESS : str(b.address),
    details: pickup ? null : {
      entrance: str(b.entrance, 20), floor: str(b.floor, 20), flat: str(b.flat, 20), intercom: str(b.intercom, 20), comment: str(b.comment, 500),
    },
    eta: zone?.eta ?? 25,
    slot,
    change: b.pay === 'cash' ? str(b.change, 20) : '',
    persons: Math.min(30, Math.max(1, Number.parseInt(b.persons, 10) || 1)),
    name, phone,
    marketing: b.marketing === true,
    createdAt: Date.now(),
    acceptedAt: pay.online ? null : Date.now(),
  };
}

/** What the order page may see: no phone, no payment ids */
const publicView = (o) => ({
  id: o.id, number: o.number, status: o.status,
  items: o.items, subtotal: o.subtotal, delivery: o.delivery, discount: o.discount, total: o.total,
  method: o.method, address: o.address, eta: o.eta, slot: o.slot,
  pay: payMethod(o.pay).label, online: Boolean(payMethod(o.pay).online),
  persons: o.persons, createdAt: o.createdAt, acceptedAt: o.acceptedAt,
  confirmationUrl: o.status === 'awaiting_payment' ? o.confirmationUrl : null,
});

/** Applies a payment object fetched from ЮKassa (never one taken from a request body) */
async function applyPayment(payment) {
  const order = store.get(payment?.metadata?.orderId);
  if (!order || order.paymentId !== payment.id || order.status !== 'awaiting_payment') return order;
  if (payment.status === 'succeeded') {
    if (payment.amount?.value !== order.total.toFixed(2) || payment.amount?.currency !== 'RUB') {
      console.error(`Order ${order.id}: paid ${payment.amount?.value} ${payment.amount?.currency}, expected ${order.total}`);
      return order;
    }
    console.log(`Order №${order.number} paid (${payment.id})`);
    return store.update(order.id, { status: 'paid', acceptedAt: Date.now(), paidAt: Date.now() });
  }
  if (payment.status === 'canceled') {
    console.log(`Order №${order.number}: payment canceled (${payment.cancellation_details?.reason ?? 'unknown'})`);
    return store.update(order.id, { status: 'payment_failed' });
  }
  return order;
}

async function startPayment(order) {
  if (!yookassa.configured()) throw new HttpError(503, 'Онлайн-оплата временно недоступна. Выберите оплату курьеру.');
  const payment = await yookassa.createPayment(order, `${PUBLIC_URL}/order?id=${order.id}`);
  return store.update(order.id, {
    status: 'awaiting_payment', paymentId: payment.id, confirmationUrl: payment.confirmation?.confirmation_url,
  });
}

const app = express();
app.disable('x-powered-by');
app.use('/api', express.json({ limit: '50kb' }));

app.post('/api/orders', async (req, res) => {
  const order = buildOrder(req.body ?? {});
  if (payMethod(order.pay).online && !yookassa.configured()) {
    throw new HttpError(503, 'Онлайн-оплата временно недоступна. Выберите оплату курьеру.');
  }
  await store.create(order);
  if (order.status === 'accepted') {
    console.log(`Order №${order.number} accepted (${order.pay})`);
    return res.status(201).json({ id: order.id, number: order.number });
  }
  try {
    const o = await startPayment(order);
    res.status(201).json({ id: o.id, number: o.number, confirmationUrl: o.confirmationUrl });
  } catch (err) {
    await store.update(order.id, { status: 'payment_failed' });
    throw err;
  }
});

app.get('/api/orders/:id', async (req, res) => {
  let order = store.get(req.params.id);
  if (!order) throw new HttpError(404, 'Заказ не найден');
  // The webhook can't reach a laptop, so the status is also pulled from ЮKassa here
  if (order.status === 'awaiting_payment' && order.paymentId) {
    try { order = await applyPayment(await yookassa.getPayment(order.paymentId)); } catch (err) { console.error(err.message); }
  }
  res.json(publicView(order));
});

// A new attempt after a canceled payment (declined card, closed СБП page, timeout)
app.post('/api/orders/:id/pay', async (req, res) => {
  const order = store.get(req.params.id);
  if (!order) throw new HttpError(404, 'Заказ не найден');
  if (order.status !== 'payment_failed' || !payMethod(order.pay).online) throw new HttpError(409, 'Этот заказ не ждёт оплаты');
  const o = await startPayment(order);
  res.json({ id: o.id, confirmationUrl: o.confirmationUrl });
});

// ЮKassa HTTP notifications (payment.succeeded / payment.canceled). The body is only a hint:
// the payment is re-read from the API with our credentials before anything changes.
app.post('/api/yookassa/webhook', async (req, res) => {
  const id = req.body?.object?.id;
  if (typeof id !== 'string') return res.sendStatus(400);
  try {
    await applyPayment(await yookassa.getPayment(id));
  } catch (err) {
    console.error(`Webhook ${id}: ${err.message}`);
    if (err.upstream === 404) return res.sendStatus(200); // not our payment: don't make ЮKassa retry
    return res.sendStatus(500); // ЮKassa retries
  }
  res.sendStatus(200);
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

if (existsSync(DIST)) {
  app.use(express.static(DIST, { index: false }));
  app.get('/{*path}', (req, res) => res.sendFile(join(DIST, 'index.html')));
}

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: err instanceof HttpError ? err.message : status >= 500 ? 'Не удалось оформить заказ. Попробуйте ещё раз или позвоните нам.' : 'Неверный запрос',
    field: err.field,
  });
});

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}${existsSync(DIST) ? ' (serving dist/)' : ''}`);
  if (!yookassa.configured()) console.warn('YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY are not set: online payment is off');
});
