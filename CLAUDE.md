# CLAUDE.md — QR Restaurant Ordering SaaS

Read this file at the start of every session. It describes the project, its rules and how we work.

## Product

Guests in Egyptian restaurants and cafés scan a table QR code, order, and pay by card in EGP without an account.
Only after the backend verifies the Paymob payment does the kitchen get ONE ticket with the table number.
Kitchen marks Preparing → Ready, the waiter marks Served, and the guest follows the status on their phone.
Roles: guest (no login), manager, kitchen, waiter, platform_admin. Each restaurant's staff see only their restaurant.

## Stack and layout

- `server/` — Node.js, Express 4, Mongoose 8, **JavaScript CommonJS** (`require` / `module.exports`). MongoDB Atlas.
- `client/` — Angular (latest stable), TypeScript, standalone components, plain CSS, signals for local state.
- Developer machine: Windows + VS Code + PowerShell. Give Windows commands.

## How code is written here (follows the CSC3101 lectures, weeks 6–9)

- `server.js`: `require("dotenv").config(...)` first → `mongoose.connect` → then `app.listen`. Exit loudly on failure.
- `app.js` order: middleware → routes (`express.Router()` per area) → `/api` 404 → central error handler LAST.
- Async route handlers use `try { ... } catch (err) { next(err); }` (Express 4).
- Every error response is `{ "error": "clear message" }`. Status codes: 200, 201, 400, 401, 403, 404, 409, 500.
- REST: nouns in paths, method says the action. Validate input first; never trust `req.body`.
- Mongoose schemas use `required` with messages, `trim`, `enum`, `min/max`, `{ timestamps: true }`, and `ref` + `populate()`.
  Any model used by `populate()` must be `require`d in that file (this bug already happened once).
- Frontend calls: check `response.ok`, handle loading / empty / error states, never leave a blank page.

## Non-negotiable rules

1. Money is integer **piastres** (EGP × 100). Never floats. Format as EGP only for display.
2. The server prices every order from the database. Prices from the browser are ignored.
3. Staff/manager queries take `restaurantId` from `req.user`, never from params, query or body.
   Another restaurant's record → 404.
4. QR codes hold a random `qrToken`, never a database `_id`.
5. An order becomes `paid` only from a verified Paymob callback (HMAC checked), through one atomic
   `findOneAndUpdate({ _id, status: "pending_payment" }, ...)`. The browser redirect never marks anything paid.
6. Secrets live in `server/.env` (git-ignored). Never print, log or commit them.
7. Each restaurant is the merchant for its own meal payments (its own Paymob account).
   Subscriptions to the platform are a separate payment stream.

## Roadmap (build in this order, one working slice at a time)

M0 setup ✅ · M1 Table 7 QR opens the right menu (backend ✅, Angular next) · M2 cart + server-priced orders ·
M3 staff login + isolation · M4 Paymob test checkout + tracking · M5 kitchen/waiter boards ·
M6 management + admin · M7 demo hardening + deploy → UNIVERSITY DEMO · M8 pilot readiness → PILOT · M9 launch.
Full plan: the "QR Restaurant Ordering SaaS — Work Plan" doc.

## How to work in this repo

- One milestone checklist item per task. Keep changes small; don't build ahead of the current milestone.
- Before coding, say which files you will create or change. After coding, run it and show proof
  (command output, HTTP responses). Never claim something works without running it.
- Use skills when they are installed (check with `/skills`):
  brainstorming / writing-plans before a new feature, test-driven-development for backend logic,
  systematic-debugging for any error, verification-before-completion before saying "done",
  frontend-design (or a UI skill) for Angular screens.
- Use Context7 for current Angular, Express, Mongoose and Paymob docs instead of memory.
- MongoDB MCP is connected **read-only**: use it to inspect data and indexes, never to write.
  Data changes go through the app or the seed script.
- Commit after each working slice: `git add .` then `git commit -m "<what now works>"`.

## Useful commands

```
cd server
npm run dev     # API on http://localhost:3000 (nodemon)
npm run seed    # sample restaurants: Nile Café + Cairo Grill, each with Table 7
npm run qr      # QR images + server/qr-codes/print.html
```
