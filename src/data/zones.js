// Delivery zones — design.md §6.10
export const ZONES = [
  { id: 'green', name: 'Зелёная', time: '30–45 мин', eta: 40, min: 800, freeFrom: 1000, fee: 190 },
  { id: 'yellow', name: 'Жёлтая', time: '45–60 мин', eta: 55, min: 1200, freeFrom: 1500, fee: 250 },
  { id: 'red', name: 'Красная', time: '60–90 мин', eta: 75, min: 2000, freeFrom: null, fee: 290 },
];

export const PICKUP_ADDRESS = 'Тверская, 12';
export const DEFAULT_FREE_FROM = 1500;
