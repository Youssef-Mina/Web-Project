// Guest routes: no login. Everything is looked up from the QR token,
// never from a restaurant id the browser sends.
const express = require("express");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");

const router = express.Router();

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const NOT_ACTIVE = "This QR code isn't active. Please ask staff.";

// GET /api/public/tables/:qrToken
// -> { restaurant, table, menu: [ { id, name, items: [...] } ] }
router.get("/tables/:qrToken", async (req, res, next) => {
  try {
    const { qrToken } = req.params;

    // Bad shape -> 404 straight away, no database query
    if (!TOKEN_PATTERN.test(qrToken)) {
      return res.status(404).json({ error: NOT_ACTIVE });
    }

    const table = await Table.findOne({ qrToken, active: true })
      .populate("restaurantId", "name slug status currency");

    if (!table || !table.restaurantId) {
      return res.status(404).json({ error: NOT_ACTIVE });
    }

    const restaurant = table.restaurantId; // populated document

    const [categories, items] = await Promise.all([
      Category.find({ restaurantId: restaurant._id, active: true })
        .sort({ sortOrder: 1, name: 1 })
        .select("name"),
      MenuItem.find({ restaurantId: restaurant._id })
        .sort({ sortOrder: 1, name: 1 })
        .select("categoryId name description pricePiastres isAvailable")
    ]);

    // Group dishes under their category; hide empty categories
    const menu = categories
      .map((category) => ({
        id: category._id,
        name: category.name,
        items: items
          .filter((item) => item.categoryId.equals(category._id))
          .map((item) => ({
            id: item._id,
            name: item.name,
            description: item.description,
            pricePiastres: item.pricePiastres,
            isAvailable: item.isAvailable
          }))
      }))
      .filter((category) => category.items.length > 0);

    res.json({
      restaurant: {
        name: restaurant.name,
        slug: restaurant.slug,
        currency: restaurant.currency,
        orderingOpen: restaurant.status === "active"
      },
      table: { number: table.number },
      menu
    });
  } catch (err) {
    next(err); // hand the error to the central error handler
  }
});

module.exports = router;
