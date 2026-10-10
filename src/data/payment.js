// Payment methods shown at checkout. `online` ones go through ЮKassa (server/yookassa.js),
// the rest are settled with the courier.
export const PAY = [
  { value: 'card', label: 'Картой онлайн', note: 'Мир, Visa, Mastercard', online: true },
  { value: 'sbp', label: 'СБП', note: 'Оплата по QR-коду', online: true },
  { value: 'sberpay', label: 'SberPay', online: true },
  { value: 'courier-card', label: 'Картой курьеру' },
  { value: 'cash', label: 'Наличными' },
];

export const payMethod = (value) => PAY.find((p) => p.value === value);
