# НОРИ — Sushi Delivery Website · Design Spec

> Working brand name: **НОРИ** (Nori). It's a placeholder, so swap it freely.
> Market: Russia (Moscow first; the layout works for any city).
> Reference: [Sofra Restaurant Template](https://sofra.framer.website/). Its visual language is adapted here from *dine-in reservations* to *online ordering and delivery*.

---

## 1. What we take from Sofra (and what we change)

| Sofra trait | Keep / adapt for НОРИ |
|---|---|
| Deep green-black backgrounds (`#131D1C`, `#0B1514`) alternating with white and warm cream sections | **Keep.** The dark sections read like a slate sushi board and nori. Light sections give the menu room to breathe. |
| Elegant high-contrast serif headlines (Gilda Display) with a clean geometric sans for UI (Jost) | **Keep the pairing, swap the serif.** Gilda Display has **no Cyrillic**, so we use **Prata**, a Didone display serif with full Cyrillic support and the same feel. **Jost** stays because it supports Cyrillic. |
| One accent word in each hero headline, coloured orange (`#F37D2F`) | **Keep.** For sushi we reframe the orange as **salmon**, which fits the brand naturally. |
| Gold rectangular CTAs (`#BC914C`), square corners, uppercase labels | **Keep the gold and the square corners.** **Change** the button text from white to dark ink, because white on gold is only about 2.9:1 contrast. |
| Small sentence-case eyebrow above every H2 ("About", "Why Choose Us?") in orange | **Keep** («О нас», «Почему мы»). |
| Circular plated hero dish on dark, with botanical (bamboo) decoration in the corner | **Keep.** Show a top-down sushi set on a round black ceramic plate, with bamboo leaves in the corner. |
| Big stat numbers (110+, 30+…) and an orange stats band | **Keep**, with delivery KPIs instead. |
| "Book a table" CTA everywhere, reservation form, opening hours card | **Replace** with «Заказать» (order), an address / delivery-zone checker, delivery hours and a cart. |
| Menu with tabs (Breakfast/Brunch/…) and dish rows showing name, description and price | **Keep the layout**, plus an add-to-cart button, weight and piece count. |

**Mood:** calm, premium and nocturnal. It should feel like a good izakaya at 9 pm, not a neon fast-food app. Russian sushi delivery is a crowded, discount-heavy category, so looking restrained *is* how we stand out.

---

## 2. Color tokens

```css
:root {
  /* Darks (from Sofra) */
  --ink-900: #0B1514;   /* deepest: cards on dark, footer */
  --ink-800: #0F1A1A;   /* raised surfaces on dark */
  --ink-700: #131D1C;   /* primary dark section bg, text on light */

  /* Lights */
  --white:   #FFFFFF;   /* light section bg */
  --rice:    #FFF0E1;   /* warm cream section bg (Sofra "Why choose") */

  /* Accents */
  --salmon:      #F37D2F; /* accent word, prices, eyebrows on DARK bg */
  --salmon-deep: #B85410; /* same role on LIGHT bg (4.9:1 on white) */
  --gold:        #BC914C; /* primary buttons, active tabs, badges */
  --gold-hover:  #A67D3C;

  /* Text */
  --text-on-dark:        #FFFFFF;
  --text-on-dark-muted:  rgba(255,255,255,.68);
  --text-on-light:       var(--ink-700);
  --text-on-light-muted: rgba(19,29,28,.68);

  /* Lines */
  --line-on-dark:  rgba(255,255,255,.12);
  --line-on-light: rgba(19,29,28,.12);

  /* Functional (use sparingly; small tags only) */
  --spicy:   #D9452B;   /* «Острое» tag */
  --veggie:  #6E9E5B;   /* «Вегетарианское» tag */
  --success: #4E9A6A;
  --error:   #D9452B;
}
```

### Contrast rules (checked)
- `--salmon` on `--ink-700` ≈ **6.4:1** ✅. On white it's only ≈ 2.7:1 ❌, so on light sections use `--salmon-deep` for any text under 24px.
- Button text on `--gold` is **`--ink-700`** (≈ 6:1 ✅), not white.
- Muted text is never below 0.68 opacity.

### Section rhythm (top → bottom)
`dark → white → white → rice → dark → salmon band → dark → white → dark → ink-900 footer`
Never put two dark sections next to each other without a band or a hairline divider between them.

---

## 3. Typography

Fonts: **Prata** (display) + **Jost** (UI / body), both with Cyrillic.
Self-host both as WOFF2 subsets (`cyrillic`, `latin`). Don't hot-link Google Fonts: it's faster from Russia and avoids sending user IPs abroad (152-ФЗ).

| Token | Font | Desktop | Mobile (<768) | Notes |
|---|---|---|---|---|
| `display` | Prata 400 | 64 / 72, ls 0.5px | 38 / 44 | Hero only. One word or phrase in `--salmon`. Russian runs ~20–30% longer than English, so this is 64 rather than Sofra's 70. |
| `h2` | Prata 400 | 48 / 58 | 32 / 38 | Section titles. |
| `h3` | Prata 400 | 30 / 39 | 24 / 31 | Card titles, «Часы работы». |
| `h4` / dish name | Prata 400 | 24 / 34 | 20 / 28 | Menu rows, product cards. |
| `price` | Prata 400 | 30 / 39 | 24 / 30 | Always `--salmon` / `--salmon-deep`. |
| `stat` | Prata 400 | 48 / 58 | 36 / 42 | KPI numbers. |
| `eyebrow` | Jost 400 | 18 / 27, ls 0.5px | 16 / 24 | Sentence case, accent colour. |
| `body-lg` | Jost 400 | 18 / 27, ls 0.5px | 17 / 26 | Section intros. |
| `body` | Jost 400 | 16 / 24, ls 0.5px | 16 / 24 | Default. |
| `meta` | Jost 400 | 14 / 20 | 14 / 20 | Weight, piece count, КБЖУ. |
| `button` | Jost 600 | 16 / 24, **ls 1px, UPPERCASE** | 15 / 22 | Cyrillic caps need the extra tracking. |
| `label` | Jost 500 | 18 / 27 | 16 / 24 | Form labels. |

### Russian typography rules
- Quotes: «ёлочки» on the outside, „лапки“ inside.
- Use a dash (—) with spaces, not a hyphen. Number ranges use an en-dash without spaces: `10:00–23:00`.
- Put a non-breaking space after one- or two-letter words (в, к, с, и, на, от, до) and between a number and its unit: `450 г`, `8 шт`, `45 мин`.
- Use **ё** consistently («ещё», «всё»).
- Prices: `1 290 ₽`, with a narrow non-breaking space for thousands and the ₽ sign *after* the number, with no kopecks. Use `Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })`.
- Plurals: use `Intl.PluralRules('ru')` (1 ролл · 2 ролла · 5 роллов, 1 товар · 3 товара · 7 товаров).
- Dates `08.10.2026`, 24-hour time, phone `+7 (495) 123-45-67`.

---

## 4. Layout, spacing, shape

- **Container:** max-width 1200px. Gutters are 40px on desktop, 24px on tablet and 16px on mobile.
- **Grid:** 12 columns with a 24px gap on desktop, 4 columns with a 16px gap on mobile.
- **Section padding:** 100px vertical on desktop (as in Sofra), 72px on tablet, 56px on mobile.
- **Spacing scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 100.
- **Corners:** **square (0px)** for buttons, cards, inputs and images. This is Sofra's signature and keeps the look editorial. The only exceptions are **circles (100%)**: plated-dish photos, avatar photos, quantity steppers and the cart count badge.
- **Shadows:** none on dark. On light, use a single soft shadow for floating elements only (cart drawer, sticky bar): `0 12px 40px rgba(11,21,20,.18)`.
- **Hairlines:** 1px `--line-on-*` separate menu rows and footer columns.

---

## 5. Imagery & decoration

- **Food photography:** dark and moody, top-down or 30°, on black ceramic or slate, with directional light and glossy fish. Use **round plated cut-outs** (transparent PNG/WebP) for the hero and category cards, the way Sofra does. Use square crops for menu items.
- **Botanicals:** bamboo leaves or a single momiji (maple) branch bleeding off the top-left of the hero and the bottom-right of the menu section, at 60–80% opacity.
- **Texture (optional):** a 3–4% noise overlay on dark sections, like a slate surface.
- **Icons:** thin line icons with a 1.5px stroke (Phosphor Light or Lucide), in `--gold` on dark and `--ink-700` on light.
- **Avoid:** cartoon sushi, emoji, neon gradients, red "−50%" starbursts.

---

## 6. Page map (home page, top → bottom)

### 6.1 Top bar + Header (sticky)
- **Top bar** (`--ink-900`, 36px tall, `meta` text): «Доставка 10:00–23:00 · Бесплатно от 1 500 ₽», plus the city switcher «Москва ▾» on the right.
- **Header** (`--ink-700`, 80px; 64px once scrolled, with a hairline below):
  - Left: wordmark **НОРИ** in Prata, with a small chopsticks or brush-stroke mark (the counterpart to Sofra's crossed cutlery).
  - Centre nav (Jost 600, uppercase, white): МЕНЮ · АКЦИИ · ДОСТАВКА · О НАС.
  - Right: the phone `+7 (495) 123-45-67` as a `tel:` link, a profile icon, and a **cart button** in gold that reads «КОРЗИНА · 2 340 ₽» with a circular count badge.
  - Mobile: wordmark on the left; cart icon with count and a burger on the right. The menu opens as a full-screen `--ink-700` overlay with nav items in Prata 32px.

### 6.2 Hero (`--ink-700`, ~100vh, centred)
- `display`: «Свежие роллы — **прямо к вашей двери**», with the accent phrase in salmon on its own line, as in Sofra.
- `body-lg` muted: «Готовим из охлаждённой рыбы после вашего заказа. Привезём за 45 минут или вернём деньги.»
- **Address checker** (this replaces "Book your table"): one row with an input «Улица и дом» (Yandex suggestions) and a gold button «ПРОВЕРИТЬ АДРЕС». The result appears inline: «✓ Доставим за ~40 мин · бесплатно от 1 000 ₽».
- Secondary link-button: «СМОТРЕТЬ МЕНЮ →».
- Below: a large round plate of an assorted set, partly cropped by the section edge, rotating very slowly (one turn every 90s; static if the user prefers reduced motion). Bamboo leaves in the top-left corner.

### 6.3 О нас / About (`--white`)
- Two columns. Left: eyebrow «О нас», h2 «Каждый ролл — как в ресторане», a paragraph, and a gold CTA «ЗАКАЗАТЬ». Right: a tall photo of the chef's hands at work.
- **Stats row** (4 columns; 2×2 on mobile), with `stat` numbers over `body` captions:
  `45 мин` среднее время доставки · `120+` позиций в меню · `4,9` рейтинг на Яндекс Картах · `250 000+` доставленных заказов.
  Use a comma as the decimal separator (4,9).

### 6.4 Категории / Feature categories (`--white`)
Three centred cards (they stack on mobile). Each has a round plated photo (280px), an h3 and a short description, and the whole card is a link to that menu category.
- **Роллы**: «Классические и авторские, от филадельфии до запечённых.»
- **Сеты**: «Для компании от 2 до 10 человек. Выгоднее, чем по отдельности.»
- **Вок и горячее**: «Лапша, рис, супы — на случай, если хочется тёплого.»

### 6.5 Почему мы / Why us (`--rice`)
- Left: eyebrow «Почему мы», h2 «Больше, чем просто доставка», then three list items, each with a 40px gold line icon, an h4 title and a body description:
  1. **Охлаждённая рыба, не заморозка**: «Лосось и тунец поступают каждое утро.»
  2. **Готовим после заказа**: «Ничего не лежит на витрине.»
  3. **Термосумки и точное время**: «Курьер в приложении на карте.»
- Right: a two-photo collage (one tall, one square, offset), with a white **badge card** overlapping it: «Готовим с» / `2014` in salmon-deep Prata 30, with 30px padding. This replaces Sofra's "Established since 1970".

### 6.6 Меню / Menu (`--ink-700`). The core section.
- Eyebrow «Меню», h2 «Выберите своё», centred.
- **Category tabs:** РОЛЛЫ · СЕТЫ · СУШИ · ГОРЯЧЕЕ · НАПИТКИ. Each tab is 44px tall with 10×26 padding. Active: gold background with ink text. Inactive: transparent with white text and a 1px `--line-on-dark` border. On mobile the tabs scroll horizontally and stick under the header.
- **Layout:** a featured plate image on the left (5 columns) and a dish list on the right (7 columns). On mobile the image is hidden.
- **Dish row** (Sofra's pattern), with a hairline divider between rows:
  ```
  [64px square thumb]  Филадельфия с угрём ............ 790 ₽   [ + ]
                       Лосось, угорь, сливочный сыр, огурец
                       8 шт · 260 г        [Хит] [Острое]
  ```
  - The name is `h4` in white, the dotted leader is `--line-on-dark`, and the price is `price` in salmon.
  - `[ + ]` is a 44px square gold button. After the first tap it morphs into a stepper `– 1 +`.
  - Tags are small pills, the only rounded shapes besides circles. They are 22px tall, Jost 12/600 uppercase, with a 1px border in the tag colour.
- Below the list: an outline CTA «ВСЁ МЕНЮ →».

### 6.7 Stats band (`--salmon` background, 12px inset frame)
Four columns of `stat` + `body`, all in `--ink-900`: `1 200+` заказов в день · `18` поваров · `4` кухни по Москве · `12` наград и премий.
Sofra puts white text on this orange, but white on salmon is only about 2.7:1, which fails even for large text. Ink on salmon is about 6.9:1 ✅.

### 6.8 Корпоративы и большие заказы / Events (`--ink-700`)
- Left: eyebrow «Для компаний», h2 «Праздник, офис, вечеринка?», a paragraph about sets for 10–50 people with pre-ordering, then a gold CTA «ЗАКАЗАТЬ СЕТ НА КОМПАНИЮ».
- Right: a **delivery-hours card** (`--ink-900`, 30px padding), replacing Sofra's "Opening hour":
  - h3 «Часы доставки»
  - Пн–Чт · 10:00–23:00
  - Пт–Вс · 10:00–01:00
  - «Счастливые часы» · 15:00–17:00 · −20% на роллы
  - Footer line: «Звоните: **+7 (495) 123-45-67**» (salmon, `tel:` link).
- Full-width photo below: a large party platter.

### 6.9 Отзывы / Testimonials (`--white`)
- Eyebrow «Отзывы», h2 «Что говорят гости».
- A carousel of two cards per view (one on mobile): a big salmon «“» glyph, the quote in `body-lg`, a 56px circular avatar, the name (Jost 600, salmon-deep) and a source line («Яндекс Карты · ★★★★★»).
- Prefer real reviews with a link to the Yandex Maps / 2GIS listing, because Russian users trust those platforms more than on-site testimonials.

### 6.10 Зоны доставки / Delivery zones (`--ink-700`). Replaces "Make a reservation".
- Left (5 columns): eyebrow «Доставка», h2 «Куда мы привозим», then a zone table:
  | Зона | Время | Мин. заказ | Доставка |
  |---|---|---|---|
  | 🟢 Зелёная | 30–45 мин | 800 ₽ | бесплатно от 1 000 ₽ |
  | 🟡 Жёлтая | 45–60 мин | 1 200 ₽ | бесплатно от 1 500 ₽ |
  | 🔴 Красная | 60–90 мин | 2 000 ₽ | 290 ₽ |
  (In the UI the emoji become 10px square swatches.)
- The address checker repeats here.
- Right (7 columns): a **Yandex Map** with the zone polygons, styled with a dark custom map theme to match `--ink-700`.

### 6.11 Footer (`--ink-900`)
- Four columns: brand and a short line; Меню links; Клиентам (Доставка и оплата, Бонусы, Акции, Вакансии); Контакты (phone, Telegram, VK, email). **No Instagram or Facebook**, because both are blocked in Russia.
- Payment row: **Мир · Visa · Mastercard · СБП · SberPay · наличные курьеру** (monochrome logos).
- Legal line (required): «ООО „Нори“ · ИНН 0000000000 · ОГРН 0000000000000», with links to «Политика конфиденциальности» and «Пользовательское соглашение».
- «© 2026 НОРИ. Все права защищены.»

---

## 7. Commerce components (beyond Sofra)

### 7.1 Product card (grid view on /menu)
- Square photo, then the name (h4), the description (2 lines, ellipsis), then a meta line `8 шт · 260 г`.
- Bottom row: the price on the left and a gold «В КОРЗИНУ» button on the right (stepper once added).
- Hover (desktop): the photo zooms to 1.04 over 400ms and a hairline gold border appears.
- Card background: `--ink-800` on dark pages, `--white` with a `--line-on-light` border on light pages.

### 7.2 Product modal / sheet
- Desktop: a centred 880px modal. Mobile: a bottom sheet at 92vh.
- Large photo, name, description, **КБЖУ table** (ккал / белки / жиры / углеводы per 100 g, which Russian users expect), allergens, and add-ons («Имбирь», «Васаби», «Соевый соус» as free toggles; «Палочки, шт.» as a stepper).
- Sticky footer: stepper and «ДОБАВИТЬ · 790 ₽».

### 7.3 Cart drawer (right side, 440px; full-screen on mobile)
- Title «Корзина» with the count («3 товара»), then a list of line items (thumb, name, stepper, price, remove).
- **Progress to free delivery:** a thin gold bar with «Ещё 460 ₽ до бесплатной доставки».
- Upsell row: «Добавить к заказу», with drinks and sauces as small horizontal cards.
- Promo code field (collapsed by default).
- Summary: Товары / Доставка / Скидка / **Итого** (Prata 30).
- CTA «ОФОРМИТЬ ЗАКАЗ» at full width, 56px tall.

### 7.4 Sticky mobile cart bar
It appears once the cart has items: 64px tall, `--gold` background, ink text, laid out as «🛒 3 · 2 340 ₽ ······ ОФОРМИТЬ →». It sits above the safe-area inset.

### 7.5 Checkout (single page, 2 columns; 1 on mobile)
1. **Контакты:** Имя, Телефон (masked `+7 (___) ___-__-__`). Sign-in is optional, by SMS code (no passwords).
2. **Доставка:** a toggle between Курьер and Самовывоз. For courier: address with Yandex suggestions, then Подъезд / Этаж / Квартира / Домофон as four short fields in one row, and «Комментарий курьеру».
3. **Время:** «Как можно скорее (~45 мин)» or «Ко времени», which opens a slot picker.
4. **Оплата:** radio cards for Картой онлайн · СБП · SberPay · Картой курьеру · Наличными (with «Сдача с …»).
5. **Персоны / приборы:** a stepper.
6. A **required checkbox:** «Согласен на обработку персональных данных» linking to the policy (152-ФЗ). It is unchecked by default. An optional, separate checkbox covers marketing SMS.
7. The right column is a sticky order summary with the «ПОДТВЕРДИТЬ ЗАКАЗ · 2 340 ₽» button.

### 7.6 Order status page
A vertical stepper: Принят → Готовится → Курьер в пути (live map + courier name) → Доставлен. The current step is shown in salmon with a soft pulse. Below it: «Позвонить курьеру» and «Повторить заказ».

### 7.7 Form fields
- 56px tall, square, 1px border (`--line-on-dark` / `--line-on-light`), transparent background, label above in `label` style.
- Focus: a 1px gold border plus a 3px outer ring at `rgba(188,145,76,.35)`.
- Error: a `--error` border and a 14px message below. Never rely on colour alone; always show the message text too.

### 7.8 Buttons
| Variant | Style |
|---|---|
| Primary | `--gold` background, `--ink-700` text, 16×26 padding, 56px tall, uppercase Jost 600 with 1px tracking. Hover `--gold-hover`; active translateY(1px). |
| Secondary (on dark) | Transparent, 1px white border at 0.4 opacity, white text. Hover: border at full opacity. |
| Secondary (on light) | Transparent, 1px `--ink-700` border, ink text. |
| Text link | Uppercase Jost 600 with a «→» that shifts 4px on hover. |
| Icon / add | 44px square, gold. |

### 7.9 Cookie & promo
- **Cookie notice:** a small bottom-left card (not a full-width bar) reading «Мы используем cookie и Яндекс Метрику», with «ПРИНЯТЬ» and «НАСТРОИТЬ».
- **Promo banners** (on /akcii and at the top of /menu): a 2:1 image on the left, then a salmon eyebrow «Акция», an h3 title and the dates «до 31.10.2026». No flashing badges.

---

## 8. Motion

These are Framer-style appear animations, kept subtle:
- **Section reveal:** fade-in plus a 24px rise, 600ms `cubic-bezier(.2,.7,.2,1)`, with a 80ms stagger between children. It fires once at 20% visibility.
- **Hero plate:** a slow 90s rotation; an 8px parallax on scroll.
- **Add-to-cart:** the button morphs into a stepper over 200ms, the cart badge bumps (scale 1 → 1.2 → 1, 300ms), and a 600ms thumbnail "fly to cart" plays on desktop only.
- **Tabs:** the gold active background slides between tabs over 250ms.
- **Drawer and modal:** 300ms ease-out for slide and fade; a 40% ink scrim.
- `prefers-reduced-motion: reduce` turns off rotation, parallax and fly-to-cart, and swaps reveals for a simple 150ms fade.

---

## 9. Responsive breakpoints

| Name | Width | Notes |
|---|---|---|
| Mobile | < 768 | One column, sticky cart bar, horizontally scrolling tabs, bottom sheets. Tap targets are at least 44px. |
| Tablet | 768–1199 | Two-column grids, header nav collapses into the burger. |
| Desktop | ≥ 1200 | Full layout as described above. |

Mobile is primary: in Russia, 75%+ of food delivery orders are placed on phones. Design the 375px layout first.

---

## 10. Accessibility

- Text meets WCAG AA (see the §2 contrast rules). Focus rings are always visible.
- All images have Russian `alt` text («Сет „Филадельфия“, 32 шт»).
- Tags such as «Острое» are text, not only an icon or colour.
- The cart count is announced through `aria-live="polite"`.
- Use `<html lang="ru">` for correct hyphenation and screen reader pronunciation; turn on `hyphens: auto` for body text only.

---

## 11. Tech & integrations (suggested)

| Need | Russian-market choice |
|---|---|
| Analytics | Yandex Metrica (with Webvisor), not Google Analytics |
| Maps, address suggestions, zones | Yandex Maps JS API + Geosuggest, or 2GIS |
| Payments | ЮKassa / CloudPayments / Т-Банк acquiring, with СБП + SberPay + Мир |
| Fiscal receipts | Online cash register (54-ФЗ), usually provided by the payment gateway |
| Auth | Phone + SMS code (SMS.ru / SMSC) |
| Hosting / personal data | Servers in Russia (Yandex Cloud / Selectel), per 152-ФЗ data localization |
| Messaging | Telegram bot for order status; VK for the community |
| Fonts | Self-hosted Prata + Jost WOFF2 (Cyrillic subset) |

---

## 12. Sample copy bank

- Hero: «Свежие роллы — прямо к вашей двери»
- Alt hero: «Японская кухня, которая успевает к ужину»
- CTA: «ЗАКАЗАТЬ» · «В КОРЗИНУ» · «ОФОРМИТЬ ЗАКАЗ» · «СМОТРЕТЬ МЕНЮ»
- Empty cart: «Здесь пока пусто. Начните с наших хитов →»
- Out of zone: «Сюда пока не доставляем, но можно забрать самовывозом на Тверской, 12»
- Order placed: «Спасибо! Заказ №4821 принят. Привезём к 20:15.»
