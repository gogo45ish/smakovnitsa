// Minimal ЮKassa API client: https://yookassa.ru/developers/api
// Payments use the redirect flow: we create a payment, send the customer to its
// confirmation_url (card form, СБП QR / bank app, SberPay) and they come back to return_url.
import { randomUUID } from 'node:crypto';

const API = process.env.YOOKASSA_API_URL || 'https://api.yookassa.ru/v3';
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET = process.env.YOOKASSA_SECRET_KEY;
const RECEIPTS = process.env.YOOKASSA_RECEIPTS === '1';
const VAT_CODE = Number(process.env.YOOKASSA_VAT_CODE || 1); // 1 = без НДС

// Checkout value → ЮKassa payment_method_data.type (opens that method straight away)
const METHOD_TYPES = { card: 'bank_card', sbp: 'sbp', sberpay: 'sberbank' };

export const configured = () => Boolean(SHOP_ID && SECRET);

/** 1234 (₽) or 123456 (kopecks, with kop=true) → "1234.00" */
const money = (n, kop = false) => ({ value: (kop ? n / 100 : n).toFixed(2), currency: 'RUB' });

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${SHOP_ID}:${SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...(method === 'POST' && { 'Idempotence-Key': randomUUID() }),
    },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`ЮKassa ${method} ${path}: ${res.status} ${data.description || data.code || ''}`.trim());
    err.status = 502;
    err.upstream = res.status;
    throw err;
  }
  return data;
}

/**
 * 54-ФЗ receipt: one position per dish plus delivery. The promo discount is spread over the
 * dishes so that the positions add up to the payment amount to the kopeck (ЮKassa rejects
 * a receipt that doesn't).
 */
export function buildReceipt(order) {
  const subKop = order.subtotal * 100;
  let discountLeft = order.discount * 100;
  const items = [];
  order.lines.forEach((l, i) => {
    const lineKop = l.price * l.qty * 100;
    const cut = i === order.lines.length - 1 ? discountLeft : Math.floor((order.discount * 100 * lineKop) / subKop);
    discountLeft -= cut;
    const sum = lineKop - cut;
    // Per-unit price must be whole kopecks: if it doesn't divide, the last unit takes the remainder
    const unit = Math.floor(sum / l.qty);
    const rest = sum - unit * l.qty;
    const item = (qty, kop) => ({
      description: l.name.slice(0, 128),
      quantity: qty.toFixed(2),
      amount: money(kop, true),
      vat_code: VAT_CODE,
      payment_mode: 'full_payment',
      payment_subject: 'commodity',
    });
    if (!rest) items.push(item(l.qty, unit));
    else {
      if (l.qty > 1) items.push(item(l.qty - 1, unit));
      items.push(item(1, unit + rest));
    }
  });
  if (order.delivery) {
    items.push({
      description: 'Доставка',
      quantity: '1.00',
      amount: money(order.delivery),
      vat_code: VAT_CODE,
      payment_mode: 'full_payment',
      payment_subject: 'service',
    });
  }
  return { customer: { phone: `7${order.phone}` }, items };
}

/** Creates a one-stage payment (capture: true) for an order; returns the ЮKassa payment object */
export function createPayment(order, returnUrl) {
  return call('POST', '/payments', {
    amount: money(order.total),
    capture: true,
    confirmation: { type: 'redirect', return_url: returnUrl },
    payment_method_data: { type: METHOD_TYPES[order.pay] },
    description: `Заказ №${order.number} — Смаковница`,
    metadata: { orderId: order.id },
    ...(RECEIPTS && { receipt: buildReceipt(order) }),
  });
}

export const getPayment = (id) => call('GET', `/payments/${encodeURIComponent(id)}`);
