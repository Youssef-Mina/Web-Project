# M1 Angular Guest Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/t/<qrToken>` opens an Angular page showing the right restaurant, table and menu (read-only).

**Architecture:** New `client/` Angular app (standalone, signals, plain CSS) calls the existing
`GET /api/public/tables/:qrToken`. In dev `ng serve` proxies `/api` to Express; for phones/demo Express serves the built app at `/t/*`.

**Tech Stack:** Angular 22 (CLI default test runner), TypeScript, Express 4 (CommonJS).

**Spec:** `docs/superpowers/specs/2026-11-27-m1-angular-menu-design.md`

## Global Constraints
- Standalone components, plain CSS, signals for local state; no NgModules, no `HttpClient`, no SSR.
- Money is integer piastres; formatted only in the `egp` pipe.
- Every fetch checks `response.ok`; loading / empty / error states always render something.
- Exact copy: "Loading menu…", "Table {n}", "Sold out", "Ordering is unavailable right now.", "No dishes yet.",
  "Could not load the menu. Please try again.", "Retry", "Scan the QR code on your table to see the menu."
- Server error text is shown verbatim (e.g. "This QR code isn't active. Please ask staff.").
- Windows/PowerShell commands. Run from `Web-Project-main/`.

## Review Focus
1. Server down / non-JSON response (e.g. proxy 504 HTML) → generic error + Retry, not a crash. Test: `fetchMenu` rejects with the generic message when `response.json()` throws.
2. Menu text containing HTML (`<b>`) → shown as text. Covered by Angular interpolation; test renders a dish named `<b>x</b>` and asserts `textContent`.
3. Retry after an error → goes back to loading, then shows the menu. Test in Task 2.
4. Deep link refresh on `/t/<token>` with the built app → Express returns index.html, and assets resolve from `/`. Verified in Task 3 by curl.
5. Prices like 8550 and 0 → "EGP 85.50" / "EGP 0.00" style output, no float drift. Test in Task 1.

---

### Task 1: Scaffold client, `egp` pipe, `fetchMenu` service, dev proxy

**Files:**
- Create: `client/` via `npx @angular/cli@22 new client --routing --style=css --ssr=false --skip-git --defaults`
- Create: `client/src/app/egp.pipe.ts`, `client/src/app/egp.pipe.spec.ts`
- Create: `client/src/app/menu-api.ts`, `client/src/app/menu-api.spec.ts`
- Create: `client/proxy.conf.json`; Modify: `client/angular.json` (serve → `options.proxyConfig`)

**Interfaces:**
- Produces: `EgpPipe` (`name: 'egp'`, `transform(piastres: number): string`).
- Produces: types `MenuItem { id; name; description; pricePiastres; isAvailable }`, `MenuCategory { id; name; items: MenuItem[] }`,
  `TableMenu { restaurant: { name; slug; currency; orderingOpen: boolean }; table: { number: string }; menu: MenuCategory[] }`.
- Produces: `fetchMenu(qrToken: string, fetchFn = fetch): Promise<TableMenu>`; rejects with `Error(message)` where message is the server `error` if present, else `GENERIC_ERROR = "Could not load the menu. Please try again."`.

- [ ] Step 1: scaffold; `npx ng test --watch=false` passes on the default spec.
- [ ] Step 2: failing tests — `egp`: `transform(8550)` contains `85.50` and `EGP`; `transform(0)` contains `0.00`.
  `fetchMenu`: ok → resolves body; 404 `{error:"This QR code isn't active. Please ask staff."}` → rejects with that text;
  500 without `error` → GENERIC_ERROR; `json()` throws → GENERIC_ERROR; `fetchFn` throws → GENERIC_ERROR; token is `encodeURIComponent`-ed in the URL `/api/public/tables/<token>`.
- [ ] Step 3: run, see FAIL. Step 4: implement (`Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' })` over `piastres / 100`). Step 5: run, PASS.
- [ ] Step 6: `proxy.conf.json` = `{ "/api": { "target": "http://localhost:3000", "secure": false } }`.

### Task 2: `MenuPage`, `ScanPrompt`, routes

**Files:** Create `client/src/app/menu-page.ts|.html|.css|.spec.ts`, `client/src/app/scan-prompt.ts`; Modify `app.routes.ts`, `app.html` (just `<router-outlet />`), `styles.css`, `index.html` (title, theme-color).

**Interfaces:** Consumes `fetchMenu`, `TableMenu`, `EgpPipe`. `MenuPage` reads `qrToken` via `input()` with `withComponentInputBinding()`; holds
`state = signal<{kind:'loading'} | {kind:'ready', data: TableMenu} | {kind:'error', message: string}>`; `load()` sets loading then result. Loader injectable for tests via an `InjectionToken` `MENU_LOADER` defaulting to `fetchMenu`.

- [ ] Step 1: failing tests (fake `MENU_LOADER`): loading text shown first; ready shows restaurant name, "Table 7", category heading, price via pipe;
  sold-out item has "Sold out"; `orderingOpen:false` shows banner; empty menu shows "No dishes yet."; error shows message + Retry; clicking Retry calls loader again and renders menu; dish name `<b>x</b>` appears as literal text.
- [ ] Step 2: FAIL → implement (mobile-first 360–430px, sticky header, min 44px rows, `aria-live="polite"`, document title `"<name> · Table <n>"`) → PASS.
- [ ] Step 3: routes `t/:qrToken` → MenuPage, `**` → ScanPrompt; `npx ng build` succeeds.

### Task 3: Express serves the built app; remove `menu.html`; proof

**Files:** Modify `server/src/app.js` (`/t/:qrToken` route); Delete `server/public/menu.html`.

- [ ] Step 1: `app.js`: `CLIENT_DIR = path.join(__dirname, "..", "..", "client", "dist", "client", "browser")`; `express.static(CLIENT_DIR)` after `public` static;
  `/t/:qrToken` → `sendFile(index.html)` if it exists, else `503` plain text "Client not built. Run npm run build in client/".
- [ ] Step 2: proof — `npm run dev`; curl `/t/<token>` → 200 HTML containing `<app-root`; curl a hashed `main-*.js` → 200; screenshots at 390px for Nile Café Table 7, Cairo Grill Table 7, and a bad token.
- [ ] Step 3: commit `M1: Angular guest menu opens from table QR`.
