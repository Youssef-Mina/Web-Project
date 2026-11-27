# M1 — Angular guest menu (Table QR opens the right menu)

## Intent
Replace the temporary `server/public/menu.html` with the Angular guest app. A guest scans a table QR
(`/t/<qrToken>`) and sees the right restaurant, their table number and the menu. Read-only: the cart is M2.

## Goals
- `/t/:qrToken` shows restaurant name, "Table N", categories with dishes, description, price in EGP.
- Sold-out dishes are dimmed with a "Sold out" badge. `orderingOpen: false` shows a "Ordering is unavailable right now" banner.
- Loading, empty ("No dishes yet") and error states — never a blank page. A 404 shows the server's
  message ("This QR code isn't active. Please ask staff."); network/other errors show "Could not load the menu. Please try again." with a Retry button.
- Any other URL shows "Scan the QR code on your table to see the menu."
- Mobile first (360–430px), works on the phones guests actually use.

## Non-goals
Cart, ordering, prices sent anywhere, staff login, i18n/Arabic, SSR, new API endpoints.

## Constraints (from CLAUDE.md)
- Angular latest stable (22.x), standalone components, plain CSS, signals for local state, TypeScript.
- Money arrives as integer piastres; it is formatted as EGP only for display.
- Frontend calls check `response.ok` and handle loading / empty / error.
- The token comes from the URL only; the app never sees or sends a database `_id`.

## Approaches
1. **Chosen:** `ng serve` (4200) with `/api` proxied to Express (3000) for development; for phone tests and the demo,
   Express serves the built app at `/t/*`. Printed QR codes keep working, one origin, no CORS.
2. Angular hosted separately + CORS on the API — needs new QR codes and CORS setup M1 doesn't need. Rejected.

## Design
- `client/` created with `ng new client --routing --style=css --ssr=false --skip-git` next to `server/`.
- Routes: `t/:qrToken` → `MenuPage`; `**` → `ScanPrompt`.
- `MenuApi` service: `fetch('/api/public/tables/' + encodeURIComponent(token))`, checks `response.ok`, throws the server's `error` message.
- `MenuPage` holds `state` as a signal: `loading | ready | error` plus data / message; Retry re-runs the load.
- `egp` pipe: piastres → `Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' })`.
- `proxy.conf.json` sends `/api` to `http://localhost:3000`; wired into `angular.json` serve options.
- Express `app.js`: serve `client/dist/client/browser` as static files and send its `index.html` for `/t/:qrToken`.
  If the build is missing, reply 503 with a plain "Run npm run build in client/" message. `server/public/menu.html` is deleted.

## Left to the builder (my calls)
- Plain `fetch` + signals instead of `HttpClient`/`resource()`, to match the lecture style and the `response.ok` rule.
- Unit tests for the `egp` pipe and for the menu page states (loading, ready, sold out, closed, error) with the default Angular test runner.
- Proof: `ng build`, then the Express server serving `/t/<token>` for both seeded Table 7s and a bad token, with screenshots at 390px width.
