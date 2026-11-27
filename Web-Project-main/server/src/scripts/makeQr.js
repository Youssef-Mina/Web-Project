// npm run qr
// Writes one PNG per active table into server/qr-codes/, plus print.html:
// a page of table cards (restaurant name + table number under each code) to print.
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const mongoose = require("mongoose");
const QRCode = require("qrcode");
require("../models/Restaurant"); // registers the model so populate() works
const Table = require("../models/Table");

const OUT_DIR = path.join(__dirname, "..", "..", "qr-codes");

// Restaurant names go into HTML, so escape them
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]
));

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in server/.env");
    process.exit(1);
  }

  const baseUrl = (process.env.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  fs.mkdirSync(OUT_DIR, { recursive: true });

  await mongoose.connect(process.env.MONGO_URI);

  const tables = await Table.find({ active: true })
    .populate("restaurantId", "name slug")
    .sort({ restaurantId: 1, number: 1 });

  const cards = [];

  for (const table of tables) {
    const restaurant = table.restaurantId;
    if (!restaurant) continue;

    const url = `${baseUrl}/t/${table.qrToken}`;
    const file = path.join(OUT_DIR, `${restaurant.slug}-table-${table.number}.png`);

    await QRCode.toFile(file, url, { width: 600, margin: 2 });
    const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2 });

    cards.push(`
      <div class="card">
        <img src="${dataUrl}" alt="QR code for ${escapeHtml(restaurant.name)} table ${escapeHtml(table.number)}">
        <h2>${escapeHtml(restaurant.name)}</h2>
        <p class="table">Table ${escapeHtml(table.number)}</p>
        <p>Scan to order and pay</p>
      </div>`);

    console.log(`Wrote ${path.basename(file)}  ->  ${url}`);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Table QR codes</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; }
  .sheet { display: flex; flex-wrap: wrap; gap: 12mm; padding: 12mm; }
  .card { width: 80mm; border: 1px solid #999; border-radius: 4mm; padding: 6mm; text-align: center; break-inside: avoid; }
  .card img { width: 100%; }
  .card h2 { margin: 2mm 0 0; font-size: 16pt; }
  .card .table { font-size: 22pt; font-weight: 700; margin: 1mm 0; }
  .card p { margin: 1mm 0; }
  @media print { .card { border-color: #000; } }
</style>
</head>
<body><div class="sheet">${cards.join("")}</div></body>
</html>`;

  fs.writeFileSync(path.join(OUT_DIR, "print.html"), html);
  console.log(`\nOpen ${path.join(OUT_DIR, "print.html")} in a browser to print the cards.`);
}

main()
  .catch((err) => {
    console.error("QR generation failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
