// Separate file = separate process, so CLIENT_DIST can point at a folder with no build.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const os = require("os");

process.env.CLIENT_DIST = path.join(os.tmpdir(), "no-such-client-build-xyz");

const app = require("../src/app");

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test("GET /t/:qrToken explains how to build the client when the build is missing", async () => {
  const res = await fetch(`${base}/t/abcdefghijklmnopqrstuvwx`);
  assert.equal(res.status, 503);
  assert.match(await res.text(), /Client not built\. Run npm run build in client\//);
});
