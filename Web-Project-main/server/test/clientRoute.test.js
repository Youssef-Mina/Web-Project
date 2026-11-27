// npm test  (node:test, no database needed: these routes never touch MongoDB)
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

// A fake Angular build so the test doesn't depend on `ng build` having run
const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "client-dist-"));
fs.writeFileSync(path.join(distDir, "index.html"), "<!doctype html><app-root></app-root>");
fs.writeFileSync(path.join(distDir, "main-TEST1234.js"), "console.log('app');");
process.env.CLIENT_DIST = distDir;

const app = require("../src/app");

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(distDir, { recursive: true, force: true });
});

test("GET /t/:qrToken serves the Angular index.html", async () => {
  const res = await fetch(`${base}/t/abcdefghijklmnopqrstuvwx`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  assert.match(await res.text(), /<app-root>/);
});

test("the built JS bundle is served from the site root", async () => {
  const res = await fetch(`${base}/main-TEST1234.js`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /console\.log/);
});

test("the landing page at / still comes from server/public", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.doesNotMatch(await res.text(), /<app-root>/);
});

test("unknown /api paths still return the JSON 404", async () => {
  const res = await fetch(`${base}/api/nope`);
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});
