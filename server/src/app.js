// Anatomy of an Express app (Week 7): import -> middleware -> routes -> (errors last).
// server.js does the 4th part (listen), so this file can be reused by tests later.

// 1. Import and create
const path = require("path");
const express = require("express");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health");
const publicRoutes = require("./routes/public");

const app = express();

// 2. Middleware
app.use(logger);
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

// 3. Routes
app.use("/api/health", healthRoutes);
app.use("/api/public", publicRoutes);

// Temporary menu page for scanning QR codes from a phone.
// The Angular app replaces this in the next slice.
app.get("/t/:qrToken", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "menu.html"));
});

// 4. Errors — registered LAST (Week 8)
app.use("/api", notFound);
app.use(errorHandler);

module.exports = app;
