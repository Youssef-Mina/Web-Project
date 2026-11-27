const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: 80
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    },
    // Money is stored as whole piastres (EGP x 100): 85.50 EGP -> 8550.
    // Never use decimals for money.
    pricePiastres: {
      type: Number,
      required: [true, "pricePiastres is required"],
      min: [0, "price cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "pricePiastres must be a whole number"
      }
    },
    // false = sold out
    isAvailable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurantId: 1, categoryId: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
