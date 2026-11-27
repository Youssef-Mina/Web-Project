# QR Restaurant Ordering SaaS

Guests scan a table QR code, order and pay by card in EGP, and the kitchen gets one paid ticket.

```
qr-ordering/
  server/                 Node.js + Express + MongoDB (Mongoose) API
    src/
      server.js           loads .env, connects to MongoDB, then listens
      app.js              middleware -> routes -> error handlers
      middleware/         logger, notFound, errorHandler
      models/             Restaurant, Table, Category, MenuItem
      routes/             health, public (guest) routes
      scripts/            seed.js, makeQr.js
    public/               static files (temporary phone menu page)
  client/                 Angular app (next slice)
```

## Run it on Windows (VS Code terminal)

1. Check Node: `node -v` and `npm -v` should print versions.
2. Install packages:
   ```
   cd server
   npm install
   ```
3. Create `server/.env` by copying `server/.env.example`, then fill in:
   - `MONGO_URI` — Atlas: Connect → Drivers. Use your **database user**, and put `qr_ordering` as the database name.
   - `PUBLIC_BASE_URL` — run `ipconfig`, take the **IPv4 Address** of your Wi-Fi adapter, e.g. `http://192.168.1.10:3000`.
4. In Atlas → Network Access, allow your current IP.
5. Seed the two sample restaurants: `npm run seed`
6. Make the QR codes: `npm run qr` → open `server/qr-codes/print.html`.
7. Start the server: `npm run dev`
8. The first time, Windows asks whether Node.js may use the network: allow **Private networks**.
9. Connect your phone to the same Wi-Fi and scan each Table 7 code.

## API so far

| Method | Path | Does | Status |
| --- | --- | --- | --- |
| GET | `/api/health` | server + database status | 200 |
| GET | `/api/public/tables/:qrToken` | restaurant, table number and menu for a QR code | 200 / 404 |

Errors always look like `{ "error": "clear message" }`.

Money is stored as whole **piastres** (EGP × 100): `8550` = 85.50 EGP.
