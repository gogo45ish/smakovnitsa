// Generates moody SVG placeholder images into public/img.
// Run: node scripts/gen-placeholders.mjs  — swap any file for a real photo later.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img');
mkdirSync(OUT, { recursive: true });
const save = (name, svg) => writeFileSync(join(OUT, name), svg.trim() + '\n');

// Deterministic PRNG so output is stable between runs
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const FILL = {
  salmon: ['#F37D2F', '#FFB48A'],
  tuna: ['#B3263A', '#D8546A'],
  eel: ['#6B3B1E', '#A2643A'],
  avocado: ['#7FA44A', '#B6CF7A'],
  cucumber: ['#5E8F3E', '#CFE3A8'],
  tempura: ['#D9A441', '#F2CF7E'],
  crab: ['#E9603F', '#FFFFFF'],
};

const defs = `
  <radialGradient id="plate" cx="45%" cy="40%" r="60%">
    <stop offset="0" stop-color="#232828"/><stop offset=".7" stop-color="#121616"/><stop offset="1" stop-color="#060808"/>
  </radialGradient>
  <radialGradient id="slate" cx="35%" cy="25%" r="90%">
    <stop offset="0" stop-color="#1D2827"/><stop offset="1" stop-color="#0B1514"/>
  </radialGradient>
  <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".55"/>
  </filter>`;

function roll(x, y, r, kind = 'salmon') {
  const [a, b] = FILL[kind];
  let rice = '';
  for (let i = 0; i < 14; i++) {
    const ang = rnd() * Math.PI * 2, d = r * (0.5 + rnd() * 0.28);
    rice += `<ellipse cx="${(x + Math.cos(ang) * d).toFixed(1)}" cy="${(y + Math.sin(ang) * d).toFixed(1)}" rx="${(r * 0.07).toFixed(1)}" ry="${(r * 0.045).toFixed(1)}" fill="#E4DCCB" transform="rotate(${(rnd() * 180) | 0} ${(x + Math.cos(ang) * d).toFixed(1)} ${(y + Math.sin(ang) * d).toFixed(1)})"/>`;
  }
  return `<g filter="url(#soft)">
    <circle cx="${x}" cy="${y}" r="${r}" fill="#111a17"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.86}" fill="#F6F1E6"/>${rice}
    <circle cx="${x}" cy="${y}" r="${r * 0.38}" fill="${a}"/>
    <circle cx="${x - r * 0.12}" cy="${y + r * 0.1}" r="${r * 0.16}" fill="${b}" opacity=".9"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#glare)"/>
  </g>`;
}

function nigiri(x, y, s, rot = 0, kind = 'salmon') {
  const [a, b] = FILL[kind];
  const stripes = [0.25, 0.45, 0.65]
    .map((t) => `<path d="M${-s * 0.9 + t * s * 1.8} ${-s * 0.42} q ${s * 0.12} ${s * 0.4} 0 ${s * 0.84}" stroke="${b}" stroke-width="${s * 0.06}" fill="none" opacity=".75"/>`)
    .join('');
  return `<g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#soft)">
    <rect x="${-s * 0.85}" y="${-s * 0.38}" width="${s * 1.7}" height="${s * 0.76}" rx="${s * 0.36}" fill="#EDE6D6"/>
    <rect x="${-s}" y="${-s * 0.45}" width="${s * 2}" height="${s * 0.9}" rx="${s * 0.42}" fill="${a}"/>${stripes}
    <rect x="${-s}" y="${-s * 0.45}" width="${s * 2}" height="${s * 0.9}" rx="${s * 0.42}" fill="url(#glare)"/>
  </g>`;
}

const ginger = (x, y, s) =>
  [0, 40, 80, 120].map((r, i) => `<ellipse cx="${x + i * s * 0.18}" cy="${y}" rx="${s * 0.5}" ry="${s * 0.3}" fill="#F4C7C0" opacity=".85" transform="rotate(${r} ${x + i * s * 0.18} ${y})"/>`).join('');
const wasabi = (x, y, s) => `<path d="M${x - s} ${y + s * 0.4} q ${s * 0.3} ${-s * 1.3} ${s} ${-s * 0.9} q ${s * 0.8} ${-s * 0.4} ${s} ${s * 0.9} z" fill="#8DB04A"/>`;

function noodles(cx, cy, r) {
  let p = '';
  for (let i = 0; i < 26; i++) {
    const y0 = cy - r * 0.6 + rnd() * r * 1.2, x0 = cx - r * 0.7;
    p += `<path d="M${x0} ${y0} c ${r * 0.3} ${-r * 0.3} ${r * 0.5} ${r * 0.3} ${r * 0.7} 0 s ${r * 0.4} ${r * 0.25} ${r * 0.7} ${-r * 0.05}" stroke="${i % 3 ? '#E2B970' : '#C9963F'}" stroke-width="${r * 0.05}" fill="none" stroke-linecap="round"/>`;
  }
  const bits = Array.from({ length: 14 }, () => {
    const a = rnd() * 6.28, d = rnd() * r * 0.6;
    return `<rect x="${cx + Math.cos(a) * d}" y="${cy + Math.sin(a) * d}" width="${r * 0.12}" height="${r * 0.07}" fill="${['#D9452B', '#6E9E5B', '#F37D2F'][i3()]}" transform="rotate(${(rnd() * 90) | 0} ${cx + Math.cos(a) * d} ${cy + Math.sin(a) * d})"/>`;
  }).join('');
  return p + bits;
}
function i3() { return (rnd() * 3) | 0; }

const plateWrap = (inner, size = 1000) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><defs>${defs}</defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.48}" fill="url(#plate)"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.48}" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="${size * 0.008}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="none" stroke="#fff" stroke-opacity=".04" stroke-width="2"/>
  ${inner}</svg>`;

// ---------- Plates (round cut-outs) ----------
function ringOfRolls(cx, cy, R, n, r, kinds) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return roll(+(cx + Math.cos(a) * R).toFixed(1), +(cy + Math.sin(a) * R).toFixed(1), r, kinds[i % kinds.length]);
  }).join('');
}

save('plate-hero.svg', plateWrap(
  ringOfRolls(500, 500, 330, 14, 58, ['salmon', 'eel', 'avocado', 'tuna']) +
  ringOfRolls(500, 500, 200, 8, 52, ['tempura', 'salmon', 'cucumber', 'crab']) +
  nigiri(470, 470, 70, -20, 'salmon') + nigiri(545, 540, 60, 25, 'tuna') +
  ginger(420, 580, 50) + wasabi(580, 420, 30)
));
save('plate-rolls.svg', plateWrap(ringOfRolls(500, 500, 270, 10, 78, ['salmon', 'avocado']) + roll(500, 500, 92, 'eel')));
save('plate-sets.svg', plateWrap(
  ringOfRolls(500, 500, 300, 12, 62, ['tuna', 'salmon', 'cucumber']) +
  nigiri(430, 450, 72, -30, 'salmon') + nigiri(560, 450, 72, 30, 'tuna') + nigiri(500, 580, 72, 0, 'eel')
));
save('plate-wok.svg', plateWrap(`<circle cx="500" cy="500" r="330" fill="#1b1a17"/><circle cx="500" cy="500" r="330" fill="none" stroke="#2c2a25" stroke-width="18"/>${noodles(500, 500, 300)}`));
save('plate-sushi.svg', plateWrap(
  [[-150, -120, -15, 'salmon'], [120, -150, 20, 'tuna'], [-170, 110, 10, 'eel'], [150, 120, -25, 'salmon'], [0, 0, 0, 'tempura']]
    .map(([dx, dy, r, k]) => nigiri(500 + dx, 500 + dy, 85, r, k)).join('') + ginger(330, 330, 50)
));
save('plate-drinks.svg', plateWrap(`
  <g filter="url(#soft)"><circle cx="420" cy="460" r="150" fill="#2E5B3A"/><circle cx="420" cy="460" r="125" fill="#7FA44A" opacity=".55"/><circle cx="420" cy="460" r="150" fill="url(#glare)"/></g>
  <g filter="url(#soft)"><circle cx="620" cy="600" r="110" fill="#5A2A12"/><circle cx="620" cy="600" r="90" fill="#B85410" opacity=".6"/><circle cx="620" cy="600" r="110" fill="url(#glare)"/></g>
  <path d="M300 700 l 120 -60" stroke="#BC914C" stroke-width="10" stroke-linecap="round"/>`));
save('plate-party.svg', plateWrap(
  ringOfRolls(500, 500, 360, 18, 48, ['salmon', 'tuna', 'eel', 'avocado', 'tempura']) +
  ringOfRolls(500, 500, 250, 12, 46, ['crab', 'salmon', 'cucumber']) +
  ringOfRolls(500, 500, 140, 6, 44, ['tuna', 'eel']) + roll(500, 500, 52, 'salmon')
));

// ---------- Square dish thumbnails ----------
const square = (inner, label, w = 800, h = 800) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>
  <rect width="${w}" height="${h}" fill="url(#slate)"/>
  <path d="M0 ${h * 0.82} Q ${w * 0.5} ${h * 0.7} ${w} ${h * 0.86} V ${h} H 0z" fill="#000" opacity=".18"/>
  ${inner}
  ${label ? `<text x="${w / 2}" y="${h - 36}" text-anchor="middle" font-family="Jost, sans-serif" font-size="${Math.round(w / 30)}" letter-spacing="2" fill="#BC914C" opacity=".55">${label}</text>` : ''}
  </svg>`;

const ROLL_KINDS = ['salmon', 'eel', 'tuna', 'avocado', 'tempura', 'crab', 'cucumber'];
ROLL_KINDS.forEach((k, i) => {
  save(`dish-roll-${i + 1}.svg`, square(
    roll(250, 400, 120, k) + roll(400, 400, 120, k) + roll(550, 400, 120, k) + roll(325, 270, 105, k) + roll(475, 270, 105, k),
    'ФОТО БЛЮДА'));
});
['salmon', 'tuna', 'eel', 'tempura', 'avocado'].forEach((k, i) => {
  save(`dish-sushi-${i + 1}.svg`, square(nigiri(310, 380, 130, -12, k) + nigiri(500, 430, 130, 14, k), 'ФОТО БЛЮДА'));
});
['salmon', 'tuna', 'eel', 'avocado'].forEach((k, i) => {
  seed = 11 + i;
  save(`dish-set-${i + 1}.svg`, square(
    ringOfRolls(400, 380, 210, 10, 60, [k, 'salmon', 'cucumber']) + nigiri(400, 380, 90, -10, k), 'ФОТО БЛЮДА'));
});
['#E2B970', '#C9963F', '#D9A441', '#B07A2E'].forEach((c, i) => {
  seed = 31 + i;
  save(`dish-hot-${i + 1}.svg`, square(
    `<circle cx="400" cy="390" r="270" fill="#141716" filter="url(#soft)"/><circle cx="400" cy="390" r="240" fill="${i === 3 ? '#3A2A18' : '#1d1b17'}"/>${i === 3 ? `<circle cx="400" cy="390" r="200" fill="#8A4B1E" opacity=".7"/><circle cx="350" cy="350" r="40" fill="#F6F1E6"/><circle cx="460" cy="420" r="30" fill="#6E9E5B"/>` : noodles(400, 390, 210)}`,
    'ФОТО БЛЮДА'));
});
[['#2E5B3A', '#7FA44A'], ['#5A2A12', '#B85410'], ['#1F3550', '#6E9EC7'], ['#3B1F2B', '#D9546A']].forEach(([a, b], i) => {
  save(`dish-drink-${i + 1}.svg`, square(
    `<g filter="url(#soft)"><path d="M290 220 h220 l-25 360 h-170z" fill="${a}" opacity=".9"/><path d="M300 300 h200 l-20 280 h-160z" fill="${b}" opacity=".7"/><path d="M290 220 h220 l-25 360 h-170z" fill="url(#glare)"/></g>
     <rect x="420" y="140" width="10" height="200" fill="#BC914C" transform="rotate(12 425 240)"/>`,
    'ФОТО НАПИТКА'));
});
save('dish-sauce.svg', square(`<circle cx="400" cy="400" r="200" fill="#141716" filter="url(#soft)"/><circle cx="400" cy="400" r="160" fill="#2A140A"/><circle cx="400" cy="400" r="160" fill="url(#glare)"/>`, 'СОУС'));

// ---------- Editorial photos ----------
const photo = (w, h, inner, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}
  <linearGradient id="light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B3533"/><stop offset=".55" stop-color="#121B1A"/><stop offset="1" stop-color="#070C0C"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#light)"/>${inner}
  <text x="${Math.round(w * 0.06)}" y="${h - Math.round(h * 0.06)}" font-family="Jost, sans-serif" font-size="${Math.round(Math.min(w, h) / 26)}" letter-spacing="2" fill="#BC914C" opacity=".6">${label}</text></svg>`;

save('chef.svg', photo(800, 1100, `
  <rect x="0" y="640" width="800" height="460" fill="#3A2A1A"/><rect x="0" y="640" width="800" height="8" fill="#4E3A26"/>
  <rect x="120" y="700" width="560" height="180" fill="#F6F1E6" opacity=".9" transform="rotate(-4 400 790)"/>
  ${roll(250, 790, 70, 'salmon')}${roll(400, 780, 70, 'salmon')}${roll(550, 770, 70, 'salmon')}
  <path d="M60 420 q 140 -60 260 160 l -60 60 q -120 -160 -200 -150z" fill="#C58E6A"/>
  <path d="M740 380 q -150 -40 -250 190 l 60 50 q 110 -170 190 -170z" fill="#B88060"/>
  <path d="M560 560 l 220 -300 l 16 12 l -214 304z" fill="#C9CCCC"/>`, 'ФОТО: РУКИ ШЕФА'));
save('collage-tall.svg', photo(700, 1000, `${nigiri(350, 420, 150, -8, 'salmon')}${nigiri(330, 640, 150, 6, 'tuna')}`, 'ФОТО: НИГИРИ'));
save('collage-square.svg', photo(700, 700, `<circle cx="350" cy="330" r="230" fill="url(#plate)"/>${ringOfRolls(350, 330, 140, 7, 55, ['eel', 'avocado'])}`, 'ФОТО: РОЛЛЫ'));
seed = 99;
save('platter.svg', photo(1800, 800, `
  <rect x="160" y="200" width="1480" height="440" fill="#1A1410" filter="url(#soft)"/><rect x="180" y="220" width="1440" height="400" fill="#2A1F16"/>
  ${Array.from({ length: 22 }, (_, i) => roll(250 + (i % 11) * 130, 330 + Math.floor(i / 11) * 170, 58, ROLL_KINDS[i % 7])).join('')}`, 'ФОТО: СЕТ ДЛЯ ВЕЧЕРИНКИ'));
save('promo.svg', photo(1200, 600, `<circle cx="820" cy="300" r="260" fill="url(#plate)"/>${ringOfRolls(820, 300, 160, 8, 58, ['salmon', 'eel'])}`, 'ФОТО: АКЦИЯ'));

// ---------- Avatars ----------
[['#3A4A48', 'АМ'], ['#4A3A2E', 'ДК'], ['#2E3A4A', 'ЕС'], ['#4A2E3A', 'ИП']].forEach(([c, t], i) => {
  save(`avatar-${i + 1}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112"><circle cx="56" cy="56" r="56" fill="${c}"/><circle cx="56" cy="44" r="20" fill="#fff" opacity=".18"/><path d="M18 100 q38 -44 76 0" fill="#fff" opacity=".18"/><text x="56" y="62" text-anchor="middle" font-family="Jost, sans-serif" font-size="22" fill="#fff" opacity=".85">${t}</text></svg>`);
});

// ---------- Botanicals ----------
function leaf(x, y, len, w, rot, color) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C ${len * 0.3} ${-w} ${len * 0.7} ${-w} ${len} 0 C ${len * 0.7} ${w * 0.6} ${len * 0.3} ${w * 0.6} 0 0z" fill="${color}"/><path d="M0 0 L ${len} 0" stroke="#0B1514" stroke-opacity=".35" stroke-width="2"/></g>`;
}
save('bamboo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <path d="M-20 80 Q 200 120 420 40" stroke="#4E6B3A" stroke-width="10" fill="none"/>
  <path d="M-20 260 Q 160 220 300 120" stroke="#4E6B3A" stroke-width="8" fill="none"/>
  ${leaf(80, 100, 260, 34, 28, '#5E8A45')}${leaf(180, 95, 300, 38, 52, '#4F7A3A')}${leaf(300, 70, 240, 30, 18, '#6E9E5B')}
  ${leaf(120, 230, 230, 30, 70, '#3F6630')}${leaf(220, 170, 280, 36, 40, '#5E8A45')}${leaf(20, 120, 220, 28, 88, '#6E9E5B')}
  ${leaf(380, 50, 200, 26, -10, '#4F7A3A')}</svg>`);
save('momiji.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <path d="M620 620 Q 420 520 260 380 T 60 200" stroke="#5A3A26" stroke-width="7" fill="none"/>
  ${[[420, 520, 0], [330, 440, 30], [250, 360, -20], [160, 280, 15], [90, 220, 40], [380, 430, -35]].map(([x, y, r]) =>
    `<g transform="translate(${x} ${y}) rotate(${r})">${[0, 50, 100, 150, 200, 250, 300].map((a) => `<path d="M0 0 L ${Math.cos((a - 90) * Math.PI / 180) * 50} ${Math.sin((a - 90) * Math.PI / 180) * 50} L ${Math.cos((a - 70) * Math.PI / 180) * 20} ${Math.sin((a - 70) * Math.PI / 180) * 20}z" fill="#D9452B" opacity=".9"/>`).join('')}</g>`).join('')}
</svg>`);

// Noise texture for dark sections
save('noise.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter><rect width="200" height="200" filter="url(#n)" opacity=".5"/></svg>`);

console.log('Placeholders written to', OUT);
