const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    // Short URL-friendly id, e.g. "nile-cafe"
    slug: {
      type: String,
      required: [true, "slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "slug may contain only a-z, 0-9 and -"]
    },
    // Suspended restaurants still show their menu but take no orders
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },
    currency: {
      type: String,
      enum: ["EGP"],
      default: "EGP"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
