const crypto = require("crypto");
const mongoose = require("mongoose");

// A random, unguessable token is what the QR code holds — never the table's _id.
function newQrToken() {
  return crypto.randomBytes(18).toString("base64url"); // 24 URL-safe characters
}

const tableSchema = new mongoose.Schema(
  {
    // Reference (Week 9): a table belongs to one restaurant
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    // A string, so restaurants can use "7", "12A", "Terrace 3"
    number: {
      type: String,
      required: [true, "table number is required"],
      trim: true,
      maxlength: 10
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      default: newQrToken
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Each restaurant has only one "Table 7", but two restaurants can both have one.
tableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });

const Table = mongoose.model("Table", tableSchema);
Table.newQrToken = newQrToken;

module.exports = Table;
