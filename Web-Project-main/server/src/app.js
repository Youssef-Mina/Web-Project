// Anatomy of an Express app (Week 7): import -> middleware -> routes -> (errors last).
// server.js does the 4th part (listen), so this file can be reused by tests later.

// 1. Import and create
const fs = require("fs");
const path = require("path");
const express = require("express");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health");
const publicRoutes = require("./routes/public");

// The built Angular guest app (cd client, then build). CLIENT_DIST lets tests point elsewhere.
const CLIENT_DIR = process.env.CLIENT_DIST
  || path.join(__dirname, "..", "..", "client", "dist", "client", "browser");

const app = express();

// 2. Middleware
app.use(logger);
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.static(CLIENT_DIR, { index: false })); // Angular's JS/CSS; "/" stays the landing page

// 3. Routes
app.use("/api/health", healthRoutes);
app.use("/api/public", publicRoutes);

// Table QR codes open /t/<qrToken>: send the Angular app, which reads the token from the URL.
app.get("/t/:qrToken", (req, res) => {
  const indexFile = path.join(CLIENT_DIR, "index.html");
  if (!fs.existsSync(indexFile)) {
    return res.status(503).type("text").send("Client not built. Run npm run build in client/");
  }
  res.sendFile(indexFile);
});

// 4. Errors — registered LAST (Week 8)
app.use("/api", notFound);
app.use(errorHandler);

module.exports = app;
