# Смаковница: сайт доставки суши

A React single-page app (Vite, React 19, React Router) with GSAP (ScrollTrigger, SplitText, DrawSVG, via `@gsap/react`) and Lenis smooth scroll. The design follows [design.md](design.md).

```bash
npm install
npm run dev      # http://localhost:5173
npm run api      # order + payment server on :3000 (Vite proxies /api to it)
npm run build    # → dist/
npm start        # production: the API server also serves dist/
```

## Pages
Every page is a React component; routes live in `src/router.jsx`. Moving between pages never reloads the document, and pages crossfade through the View Transitions API.

| Route | Page | Built from |
|---|---|---|
| `/` | Home | `src/pages/HomePage.jsx` + `src/components/home/*` (Hero, About, Categories, WhyUs, MenuSection, StatsBand, Events, Reviews, Zones) |
| `/menu` | Full menu with promo banners and a product grid | `src/pages/MenuPage.jsx` |
| `/checkout` | Checkout | `src/pages/CheckoutPage.jsx` |
| `/order?id=…` | Payment wait / order status | `src/pages/OrderPage.jsx` |
| anything else | 404 | `src/pages/NotFoundPage.jsx` |

The old `*.html` URLs redirect to these routes. The shell lives in `src/components/layout/`: the header, burger menu and footer, plus `RouteEffects`, which handles scroll reset or restore, `#hash` jumps and moving focus to the new page. Overlays live in `src/components/overlays/`: the cart drawer, product modal, toast, cookie card and mobile cart bar.

State lives in two small external stores that components read with `useSyncExternalStore`:
- `src/store/cart.js`: the cart, kept in localStorage
- `src/store/ui.js`: which overlay is open, plus toasts

`index.html` is only the Vite entry. Production hosting needs an SPA fallback that serves `index.html` for every route. `npm start` (and `vite preview`) already does this.

## Things to change
- **Photos:** the food photos live in `public/img/photos/` as webp files. Dish photos are named after the dish `id` in `src/data/menu.js`; the round plates (`plate-*`) are square photos that CSS crops to a circle. To swap one, drop in a new file with the same name: 720×720 for dishes, 800×800 for plates. The avatars, botanicals and noise texture are drawn SVGs made by `node scripts/gen-placeholders.mjs`.
- **Menu and prices:** `src/data/menu.js`. **Delivery zones:** `src/data/zones.js`.
- **Yandex map:** the Доставка section embeds the restaurant's Yandex Maps place card. Change `MAP_EMBED` in `src/components/home/Zones.jsx` (instructions are in the file).
- **Address check** is still mocked (`src/lib/address.js`, used by both the browser and the server). Orders go to the server; see below.

## Оплата (ЮKassa): Мир, СБП, SberPay
Orders and payments run on a small Express server in `server/`:

| File | What it does |
|---|---|
| `server/index.js` | `POST /api/orders` checks the form and **re-prices the cart from `src/data/menu.js`** (the browser's prices are ignored), then creates the ЮKassa payment. `GET /api/orders/:id` returns the order status, `POST /api/orders/:id/pay` retries a failed payment, and `POST /api/yookassa/webhook` receives ЮKassa notifications. |
| `server/yookassa.js` | The ЮKassa API client and the 54-ФЗ receipt builder |
| `server/store.js` | Orders in `server/data/orders.json` (swap it for a database when traffic grows) |
| `src/lib/pricing.js` | The price calculation shared by the cart and the server |
| `src/data/payment.js` | The checkout payment methods; `online: true` ones go through ЮKassa |

How it works: the customer picks «Картой онлайн», «СБП» or «SberPay» and presses «Оплатить». The server creates a payment, and the customer lands on the ЮKassa page, where they enter a Мир/Visa/Mastercard card, scan the СБП QR code or open their bank app. ЮKassa then sends them back to `/order?id=…`, where the page shows «Ждём оплату» until the payment is confirmed, followed by the usual status stepper. The cart is emptied only after the payment succeeds. If the payment fails, the customer sees «Оплата не прошла» with a button to try again, and their cart is kept. «Картой курьеру» and «Наличными» orders skip ЮKassa and are accepted immediately.

### Setting it up
1. Register at [yookassa.ru](https://yookassa.ru) and create a **test shop**. It is free and needs no contract.
2. Run `cp .env.example .env` and fill in `YOOKASSA_SHOP_ID` (Настройки → Магазин) and `YOOKASSA_SECRET_KEY` (Интеграция → Ключи API; a test key starts with `test_`).
3. Run `npm run api` and `npm run dev`, then place an order. Pay with the [test cards](https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing) from the ЮKassa docs. Locally the order page asks ЮKassa for the status itself, so you don't need the webhook to test.

Without keys the server still takes courier and cash orders. For online methods it answers «Онлайн-оплата временно недоступна».

### Going live
- Sign the ЮKassa contract. This needs an ИП, ООО or самозанятый. Then put the **live** `shopId` and secret key in `.env` on the server.
- Set `PUBLIC_URL` to the site's https address. ЮKassa returns customers to `$PUBLIC_URL/order?id=…`.
- In ЮKassa → Интеграция → HTTP-уведомления, set the URL to `https://<домен>/api/yookassa/webhook` and tick `payment.succeeded` and `payment.canceled`. The server never trusts the notification body: it re-reads the payment from the API with your key before changing an order.
- **Чеки (54-ФЗ):** turn on «Чеки от ЮKassa» (or connect an online cash register) and set `YOOKASSA_RECEIPTS=1`. Set `YOOKASSA_VAT_CODE` to match your tax regime. Each dish becomes a receipt line, delivery is its own line, and promo discounts are spread across the dishes.
- Run `npm run build && npm start` behind nginx (or similar) with HTTPS, and back up `server/data/`.

## Animation and reduced motion
If the OS asks for reduced motion (on Windows: Settings → Accessibility → Visual effects → Animation effects), the site follows design.md §8 and turns off pinning, parallax and smooth scroll.
For demos you can override this:
- `?motion=on`: full animation, even when the OS asks for reduced motion
- `?motion=off`: always reduced
- `?motion=auto`: back to the default

The setting is remembered in localStorage.

## Motion system
Follows Emil Kowalski's design-engineering rules (`.agents/skills/emil-design-eng`).
- Curves and durations live in `src/styles/tokens.css` (`--ease-out`, `--ease-in-out`, `--ease-drawer`, `--dur-*`); the same curves are registered in GSAP as `'out'`, `'inOut'`, `'drawer'` (`src/lib/scroll.js`).
- Re-triggerable UI uses CSS transitions / `@starting-style`, never keyframes; exits are faster than enters.
- Hovers live in one `@media (hover: hover) and (pointer: fine)` block per file; every pressable scales to `.97` on `:active`.
- Shared helpers in `src/lib/motion.js`: `tickAnim()` (directional number roll, used by the `<Num>` component), `swipeToDismiss()` (drawer/sheet gestures with momentum + friction), `fromKeyboard()` (keyboard actions skip animation).
- Reduced motion is driven by `html[data-motion]`, so the `?motion=` override reaches CSS as well as GSAP.
- GSAP code runs inside `useGSAP` (layout effect), so the hidden "from" states are applied before the first paint, and everything, including pins and SplitText, is reverted when a page unmounts.
- Styles are linked from `index.html` (render-blocking), so no frame is ever unstyled.

## Photo credits
All food photos come from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license): free for commercial use, no attribution required. They are credited here anyway. Each one can be found at `https://images.unsplash.com/photo-<id>`.

<details>
<summary>File → photographer (Unsplash id)</summary>

| File | Photographer | Id |
|---|---|---|
| phila | David Foodphototasty | 1635526910429-051cf1ed127e |
| phila-eel | Luc Bercoth | 1633478062482-790e3b5dd810 |
| california | kimia kazemi | 1653122024993-31e02aedb1ac |
| spicy-tuna | Ben Lei | 1559410545-0bdcd187e0a6 |
| avocado-maki | Ahtziri Lagarde | 1648146298796-2d4ab2f380d2 |
| tempura-ebi | Diego Arenas de Rodrigo | 1761314026068-f07ec1ce6e2b |
| baked-salmon | Malik Shibly | 1787589481636-a69533c81edb |
| cucumber-maki | Ahtziri Lagarde | 1648146299381-5f4db5d842a0 |
| set-phila | kimia kazemi | 1653542773816-3922a928b28c |
| set-duo | Szegedi Attila | 1737501844370-e59fb449880d |
| set-hot | SJ | 1563245370-cd55e7c95ff4 |
| set-party | Karin Kim | 1736885978380-8d7d9f7d7880 |
| nigiri-salmon | Felippe Lopes | 1637074930269-089fde202b57 |
| nigiri-tuna | Jose Ruales | 1562707786-7d2b807961c4 |
| nigiri-eel | note thanun | 1763627719044-5d1d6a6b809c |
| nigiri-ebi | Eiliv Aceron | 1628676825882-32c387815bdd |
| gunkan-avocado | Louis Hansel | 1585144570564-9629fa5ab791 |
| wok-chicken | Youjeen Cho | 1558985212-324add95595a |
| wok-shrimp | Cody Chan | 1636933242310-15d6318326f5 |
| rice-veg | herry shani | 1664717698774-84f62382613b |
| tom-yum | Jamie Trinh | 1777828827870-92e3069424bd |
| matcha | Daniel Stiel | 1717398804998-ad2d48822518 |
| yuzu | Pixzolo Photography | 1555949366-819808d99159 |
| ramune | Yosuke Ota | 1663870316229-cb3986d34e8c |
| morse | Jennifer Pallian | 1499638673689-79a0b5115d87 |
| sauce | Caroline Attwood | 1499126167718-c87f5c1387e8 |
| plate-hero | Kristina Truniak | 1667343352641-044b9d729737 |
| plate-rolls | blackieshoot | 1709984110217-57d7d18e5299 |
| plate-sets | Mahmoud Fawzy | 1617196034796-73dfa7b1fd56 |
| plate-sushi | lili liu | 1615750824451-cdf6c3b7e06a |
| plate-wok | Orijit Chatterjee | 1585032226651-759b368d7246 |
| plate-drinks | Gaia&Co | 1749280447307-31a68eb38673 |
| chef | Harrison Chang | 1742968922506-16be51d4f4da |
| collage-tall | Fer Almaraz | 1646196603168-ed92068477c3 |
| collage-square | Marina Grynykha | 1580822184713-fc5400e7fe10 |
| platter | Riccardo Bergamini | 1553621042-f6e147245754 |
| promo | Jakub Dziubak | 1611143669185-af224c5e3252 |
| promo-party | Christopher Yiu Chung | 1763647756796-af9230245bf8 |

</details>
