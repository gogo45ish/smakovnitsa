// Mock menu. Photos live in public/img/photos (see README for credits); КБЖУ per 100 g.
export const CATEGORIES = [
  { id: 'rolls', title: 'Роллы', plate: '/img/photos/plate-rolls.webp' },
  { id: 'sets', title: 'Сеты', plate: '/img/photos/plate-sets.webp' },
  { id: 'sushi', title: 'Суши', plate: '/img/photos/plate-sushi.webp' },
  { id: 'hot', title: 'Горячее', plate: '/img/photos/plate-wok.webp' },
  { id: 'drinks', title: 'Напитки', plate: '/img/photos/plate-drinks.webp' },
];

const k = (kcal, p, f, c) => ({ kcal, p, f, c });

export const DISHES = [
  // Роллы
  { id: 'phila-eel', cat: 'rolls', name: 'Филадельфия с угрём', desc: 'Лосось, угорь, сливочный сыр, огурец', pcs: 8, weight: 260, price: 790, tags: ['hit'], img: '/img/photos/phila-eel.webp', kbju: k(218, 9.4, 8.1, 26.3), allergens: 'рыба, молоко, кунжут' },
  { id: 'phila', cat: 'rolls', name: 'Филадельфия классик', desc: 'Охлаждённый лосось, сливочный сыр, огурец', pcs: 8, weight: 240, price: 690, tags: ['hit'], img: '/img/photos/phila.webp', kbju: k(204, 8.8, 7.6, 25.1), allergens: 'рыба, молоко' },
  { id: 'california', cat: 'rolls', name: 'Калифорния с крабом', desc: 'Снежный краб, авокадо, огурец, икра масаго', pcs: 8, weight: 230, price: 590, tags: [], img: '/img/photos/california.webp', kbju: k(176, 6.2, 5.4, 25.8), allergens: 'ракообразные, яйцо' },
  { id: 'spicy-tuna', cat: 'rolls', name: 'Спайси тунец', desc: 'Тунец, острый соус, зелёный лук, кунжут', pcs: 8, weight: 220, price: 650, tags: ['spicy'], img: '/img/photos/spicy-tuna.webp', kbju: k(189, 9.1, 5.2, 24.7), allergens: 'рыба, кунжут, яйцо' },
  { id: 'avocado-maki', cat: 'rolls', name: 'Маки с авокадо', desc: 'Авокадо, рис, нори', pcs: 6, weight: 120, price: 290, tags: ['veggie'], img: '/img/photos/avocado-maki.webp', kbju: k(152, 2.8, 4.1, 26.0), allergens: '—' },
  { id: 'tempura-ebi', cat: 'rolls', name: 'Темпура с креветкой', desc: 'Тигровая креветка в темпуре, сливочный сыр, соус унаги', pcs: 8, weight: 280, price: 720, tags: ['new'], img: '/img/photos/tempura-ebi.webp', kbju: k(246, 7.9, 10.8, 29.4), allergens: 'ракообразные, глютен, молоко' },
  { id: 'baked-salmon', cat: 'rolls', name: 'Запечённый с лососем', desc: 'Лосось, сырная шапка, соус спайси', pcs: 8, weight: 270, price: 690, tags: ['spicy'], img: '/img/photos/baked-salmon.webp', kbju: k(231, 8.6, 10.2, 25.6), allergens: 'рыба, молоко, яйцо' },
  { id: 'cucumber-maki', cat: 'rolls', name: 'Маки с огурцом', desc: 'Огурец, кунжут, нори', pcs: 6, weight: 110, price: 220, tags: ['veggie'], img: '/img/photos/cucumber-maki.webp', kbju: k(118, 2.4, 0.6, 25.9), allergens: 'кунжут' },

  // Сеты
  { id: 'set-phila', cat: 'sets', name: 'Сет «Филадельфия»', desc: 'Четыре вида филадельфии: классик, с угрём, с тунцом, запечённая', pcs: 32, weight: 1040, price: 2490, tags: ['hit'], img: '/img/photos/set-phila.webp', kbju: k(212, 8.9, 8.2, 25.7), allergens: 'рыба, молоко, кунжут', persons: '3–4' },
  { id: 'set-duo', cat: 'sets', name: 'Сет «На двоих»', desc: 'Филадельфия, калифорния, маки с огурцом, 4 нигири', pcs: 26, weight: 720, price: 1590, tags: [], img: '/img/photos/set-duo.webp', kbju: k(196, 7.6, 6.2, 26.4), allergens: 'рыба, ракообразные, молоко', persons: '2' },
  { id: 'set-hot', cat: 'sets', name: 'Сет «Горячий»', desc: 'Три вида запечённых роллов и темпура с креветкой', pcs: 32, weight: 1120, price: 2290, tags: ['spicy'], img: '/img/photos/set-hot.webp', kbju: k(238, 8.1, 10.6, 27.2), allergens: 'рыба, ракообразные, глютен, молоко', persons: '3–4' },
  { id: 'set-party', cat: 'sets', name: 'Сет «Вечеринка»', desc: 'Восемь роллов-бестселлеров для большой компании', pcs: 64, weight: 2100, price: 4590, tags: ['new'], img: '/img/photos/set-party.webp', kbju: k(214, 8.2, 8.0, 26.1), allergens: 'рыба, ракообразные, молоко, кунжут', persons: '6–8' },

  // Суши
  { id: 'nigiri-salmon', cat: 'sushi', name: 'Нигири с лососем', desc: 'Охлаждённый лосось на рисе', pcs: 2, weight: 70, price: 260, tags: ['hit'], img: '/img/photos/nigiri-salmon.webp', kbju: k(168, 9.8, 4.2, 22.4), allergens: 'рыба' },
  { id: 'nigiri-tuna', cat: 'sushi', name: 'Нигири с тунцом', desc: 'Тунец яхонтовый, рис, васаби', pcs: 2, weight: 70, price: 290, tags: [], img: '/img/photos/nigiri-tuna.webp', kbju: k(154, 11.2, 1.6, 22.8), allergens: 'рыба' },
  { id: 'nigiri-eel', cat: 'sushi', name: 'Нигири с угрём', desc: 'Копчёный угорь, соус унаги, кунжут', pcs: 2, weight: 75, price: 310, tags: [], img: '/img/photos/nigiri-eel.webp', kbju: k(201, 8.4, 7.9, 24.0), allergens: 'рыба, кунжут, соя' },
  { id: 'nigiri-ebi', cat: 'sushi', name: 'Нигири с креветкой', desc: 'Королевская креветка, рис', pcs: 2, weight: 70, price: 280, tags: [], img: '/img/photos/nigiri-ebi.webp', kbju: k(142, 8.6, 0.9, 24.3), allergens: 'ракообразные' },
  { id: 'gunkan-avocado', cat: 'sushi', name: 'Гункан с авокадо', desc: 'Авокадо, японский майонез, кунжут', pcs: 2, weight: 80, price: 210, tags: ['veggie'], img: '/img/photos/gunkan-avocado.webp', kbju: k(176, 2.9, 7.4, 24.2), allergens: 'яйцо, кунжут' },

  // Горячее
  { id: 'wok-chicken', cat: 'hot', name: 'Удон с курицей', desc: 'Пшеничная лапша, курица, овощи, соус терияки', weight: 350, price: 490, tags: ['hit'], img: '/img/photos/wok-chicken.webp', kbju: k(162, 9.4, 4.2, 21.8), allergens: 'глютен, соя, кунжут' },
  { id: 'wok-shrimp', cat: 'hot', name: 'Соба с креветками', desc: 'Гречневая лапша, креветки, перец, острый соус', weight: 340, price: 590, tags: ['spicy'], img: '/img/photos/wok-shrimp.webp', kbju: k(148, 8.8, 3.6, 20.4), allergens: 'ракообразные, глютен, соя' },
  { id: 'rice-veg', cat: 'hot', name: 'Рис с овощами', desc: 'Жасмин, брокколи, морковь, яйцо, соевый соус', weight: 300, price: 390, tags: ['veggie'], img: '/img/photos/rice-veg.webp', kbju: k(138, 3.6, 3.1, 24.6), allergens: 'яйцо, соя' },
  { id: 'tom-yum', cat: 'hot', name: 'Том ям с креветками', desc: 'Кокосовое молоко, креветки, грибы, лайм', weight: 400, unit: 'мл', price: 590, tags: ['spicy', 'new'], img: '/img/photos/tom-yum.webp', kbju: k(86, 5.2, 5.8, 3.4), allergens: 'ракообразные' },

  // Напитки
  { id: 'matcha', cat: 'drinks', name: 'Матча-лимонад', desc: 'Чай матча, лайм, тоник', weight: 400, unit: 'мл', price: 290, tags: ['new'], img: '/img/photos/matcha.webp', kbju: k(38, 0.2, 0, 9.4), allergens: '—' },
  { id: 'yuzu', cat: 'drinks', name: 'Юдзу-лимонад', desc: 'Японский цитрус, газированная вода, мята', weight: 400, unit: 'мл', price: 290, tags: [], img: '/img/photos/yuzu.webp', kbju: k(42, 0, 0, 10.6), allergens: '—' },
  { id: 'ramune', cat: 'drinks', name: 'Рамунэ', desc: 'Японская газировка с шариком', weight: 200, unit: 'мл', price: 250, tags: [], img: '/img/photos/ramune.webp', kbju: k(44, 0, 0, 11.0), allergens: '—' },
  { id: 'morse', cat: 'drinks', name: 'Морс клюквенный', desc: 'Клюква, мёд, без сахара', weight: 500, unit: 'мл', price: 190, tags: [], img: '/img/photos/morse.webp', kbju: k(32, 0.1, 0, 8.0), allergens: 'мёд' },
  { id: 'sauce-spicy', cat: 'drinks', hidden: true, name: 'Соус спайси', desc: 'Острый майонезный соус', weight: 40, price: 60, tags: [], img: '/img/photos/sauce.webp', kbju: k(520, 1.2, 56, 3.0), allergens: 'яйцо' },
  { id: 'sauce-unagi', cat: 'drinks', hidden: true, name: 'Соус унаги', desc: 'Сладкий соус для угря', weight: 40, price: 60, tags: [], img: '/img/photos/sauce.webp', kbju: k(210, 1.8, 0.2, 48), allergens: 'соя' },
];

export const TAG_LABELS = { hit: 'Хит', spicy: 'Острое', veggie: 'Вегетарианское', new: 'Новинка' };

export const byId = (id) => DISHES.find((d) => d.id === id);
export const byCat = (cat) => DISHES.filter((d) => d.cat === cat && !d.hidden);
export const UPSELL_IDS = ['matcha', 'yuzu', 'sauce-spicy', 'sauce-unagi', 'ramune'];
