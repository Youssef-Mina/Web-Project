const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: 50
    },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categorySchema.index({ restaurantId: 1, sortOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);
