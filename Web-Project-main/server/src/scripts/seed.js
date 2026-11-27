// npm run seed
// Creates two sample restaurants, each with a Table 7, two categories and four dishes.
// Safe to run again: it rebuilds the sample data but KEEPS each Table 7's QR token,
// so QR codes you already printed keep working.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");

// Prices in EGP here for readability; converted to piastres below.
const SAMPLE = [
  {
    name: "Nile Café",
    slug: "nile-cafe",
    tables: ["7"],
    categories: [
      {
        name: "Hot drinks",
        items: [
          { name: "Turkish coffee", description: "Medium sugar, served with water", egp: 35 },
          { name: "Cappuccino", description: "Double shot", egp: 60 }
        ]
      },
      {
        name: "Desserts",
        items: [
          { name: "Basbousa", description: "Semolina cake with syrup", egp: 45 },
          { name: "Om Ali", description: "Baked pastry pudding with nuts", egp: 70.5, soldOut: true }
        ]
      }
    ]
  },
  {
    name: "Cairo Grill",
    slug: "cairo-grill",
    tables: ["7"],
    categories: [
      {
        name: "Grills",
        items: [
          { name: "Kofta plate", description: "With rice and salad", egp: 180 },
          { name: "Shish tawook", description: "Marinated chicken skewers", egp: 160 }
        ]
      },
      {
        name: "Sides",
        items: [
          { name: "Tahini salad", description: "", egp: 30, soldOut: true },
          { name: "Baba ghanoush", description: "", egp: 35 }
        ]
      }
    ]
  }
];

const toPiastres = (egp) => Math.round(egp * 100);

async function seedRestaurant(data) {
  // Remember existing QR tokens before deleting anything
  const oldRestaurant = await Restaurant.findOne({ slug: data.slug });
  const keptTokens = {};

  if (oldRestaurant) {
    const oldTables = await Table.find({ restaurantId: oldRestaurant._id });
    oldTables.forEach((t) => { keptTokens[t.number] = t.qrToken; });

    await Promise.all([
      Table.deleteMany({ restaurantId: oldRestaurant._id }),
      Category.deleteMany({ restaurantId: oldRestaurant._id }),
      MenuItem.deleteMany({ restaurantId: oldRestaurant._id })
    ]);
    await Restaurant.deleteOne({ _id: oldRestaurant._id });
  }

  const restaurant = await Restaurant.create({ name: data.name, slug: data.slug });

  const tables = [];
  for (const number of data.tables) {
    tables.push(await Table.create({
      restaurantId: restaurant._id,
      number,
      ...(keptTokens[number] ? { qrToken: keptTokens[number] } : {})
    }));
  }

  for (const [index, cat] of data.categories.entries()) {
    const category = await Category.create({
      restaurantId: restaurant._id,
      name: cat.name,
      sortOrder: index
    });

    await MenuItem.create(cat.items.map((item, i) => ({
      restaurantId: restaurant._id,
      categoryId: category._id,
      name: item.name,
      description: item.description,
      pricePiastres: toPiastres(item.egp),
      isAvailable: !item.soldOut,
      sortOrder: i
    })));
  }

  return { restaurant, tables };
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in server/.env");
    process.exit(1);
  }

  const baseUrl = (process.env.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  for (const data of SAMPLE) {
    const { restaurant, tables } = await seedRestaurant(data);
    for (const table of tables) {
      console.log(`${restaurant.name} · Table ${table.number}`);
      console.log(`  ${baseUrl}/t/${table.qrToken}\n`);
    }
  }

  console.log("Seed complete. Run \"npm run qr\" to make the QR images.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
