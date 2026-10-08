# Смаковница: сайт доставки суши

A React single-page app (Vite, React 19, React Router) with GSAP (ScrollTrigger, SplitText, DrawSVG, via `@gsap/react`) and Lenis smooth scroll. The design follows [design.md](design.md).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
```

## Pages
Every page is a React component; routes live in `src/router.jsx`. Moving between pages never reloads the document, and pages crossfade through the View Transitions API.

| Route | Page | Built from |
|---|---|---|
| `/` | Home | `src/pages/HomePage.jsx` + `src/components/home/*` (Hero, About, Categories, WhyUs, MenuSection, StatsBand, Events, Reviews, Zones) |
| `/menu` | Full menu with promo banners and a product grid | `src/pages/MenuPage.jsx` |
| `/checkout` | Checkout | `src/pages/CheckoutPage.jsx` |
| `/order?id=…` | Order status | `src/pages/OrderPage.jsx` |
| anything else | 404 | `src/pages/NotFoundPage.jsx` |

The old `*.html` URLs redirect to these routes. The shell lives in `src/components/layout/`: the header, burger menu and footer, plus `RouteEffects`, which handles scroll reset or restore, `#hash` jumps and moving focus to the new page. Overlays live in `src/components/overlays/`: the cart drawer, product modal, toast, cookie card and mobile cart bar.

State lives in two small external stores that components read with `useSyncExternalStore`:
- `src/store/cart.js`: the cart, kept in localStorage
- `src/store/ui.js`: which overlay is open, plus toasts

`index.html` is only the Vite entry. Production hosting needs an SPA fallback that serves `index.html` for every route. `vite preview` already does this.

## Things to change
- **Photos:** the food photos live in `public/img/photos/` as webp files. Dish photos are named after the dish `id` in `src/data/menu.js`; the round plates (`plate-*`) are square photos that CSS crops to a circle. To swap one, drop in a new file with the same name: 720×720 for dishes, 800×800 for plates. The avatars, botanicals and noise texture are drawn SVGs made by `node scripts/gen-placeholders.mjs`.
- **Menu and prices:** `src/data/menu.js`. **Delivery zones:** `src/data/zones.js`.
- **Yandex map:** the Доставка section embeds the restaurant's Yandex Maps place card. Change `MAP_EMBED` in `src/components/home/Zones.jsx` (instructions are in the file).
- **Address check and orders** are mocked in the browser (`src/lib/address.js`, `src/pages/CheckoutPage.jsx`). Connect them to a backend.

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
