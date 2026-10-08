// Generates the drawn SVG assets in public/img: review avatars, botanicals and the noise texture.
// Food photos are real and live in public/img/photos (credits in README).
// Run: node scripts/gen-placeholders.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img');
mkdirSync(OUT, { recursive: true });
const save = (name, svg) => writeFileSync(join(OUT, name), svg.trim() + '\n');

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

console.log('SVG assets written to', OUT);
