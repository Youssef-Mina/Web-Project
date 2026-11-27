// 0. Load .env FIRST, before anything reads process.env (Week 9).
//    The explicit path means it works whatever folder you run node from.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;

// Connect, then listen: no requests are accepted until the database is ready.
async function start() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Copy server/.env.example to server/.env and fill it in.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  } catch (err) {
    console.error("DB failed:", err.message);
    process.exit(1); // fail loudly
  }
}

start();
