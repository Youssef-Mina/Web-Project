const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// GET /api/health — quick check that the server and database are up.
router.get("/", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    database: dbConnected ? "connected" : "disconnected"
  });
});

module.exports = router;
