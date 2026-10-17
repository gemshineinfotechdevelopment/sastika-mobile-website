# Sastika Mobiles

React + TypeScript + Vite. All styling is inline CSS (keyframes are injected once by `GlobalStyles.tsx`).

- **Storefront** (mobile view, centred 430px frame on desktop): `/#/`
- **Admin panel** (desktop view): `/#/admin`

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Structure

```
src/
  main.tsx, App.tsx        router (HashRouter)
  theme.ts                 colours, fonts, money() helper
  data.ts, types.ts        seed products, orders, tickets
  store.tsx                shared state, persisted in localStorage
  components/              Icon, ProductArt (SVG), animation helpers, GlobalStyles
  site/                    Home, Catalog, ProductDetail, Cart, Checkout,
                           Confirmation, Account, Services, About, Contact
  admin/                   Dashboard, AdminProducts, AdminOrders,
                           Inventory, ServiceDesk, Settings
```

## How the two sides connect

Storefront and admin share one store. Adding a product in admin shows on the
storefront; placing an order reduces stock and appears in admin Orders;
booking a repair on the storefront creates a ticket in the Service Desk.
Data lives in the browser's localStorage. Admin → Settings → "Reset Demo Data"
restores the defaults.

## Home page animations

Typing headline, floating phones, drifting orbs, animated gradient, pulsing
CTA with sheen, brand marquee, live flash-deal countdown, claim bars,
scroll-reveal sections, count-up stats, 3D-tilting spotlight phone,
auto-rotating testimonials, and a scroll progress bar in the header.

## Notes

- Product images are drawn in SVG (`ProductArt.tsx`) so no assets are needed.
  Swap in real photos by replacing that component.
- There is no backend or login. The admin route is open; add auth before deploying.
