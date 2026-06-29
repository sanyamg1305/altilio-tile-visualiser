import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const db = new Database(path.join(dataDir, "altilio.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS tiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT,
    size TEXT,
    placement TEXT,
    pattern TEXT,
    finish TEXT,
    color TEXT,
    price REAL,
    price_unit TEXT DEFAULT 'per_sqft',
    use_cases TEXT,
    collection TEXT,
    brand TEXT,
    image_path TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS filter_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    metadata TEXT,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(category, value)
  );
`);

// Add color column to existing tiles if missing
try { db.exec("ALTER TABLE tiles ADD COLUMN color TEXT"); } catch {}

// Seed default filter options if table is empty
const count = (db.prepare("SELECT COUNT(*) as n FROM filter_options").get() as { n: number }).n;
if (count === 0) {
  const insert = db.prepare(
    "INSERT OR IGNORE INTO filter_options (category, value, label, metadata, sort_order) VALUES (?, ?, ?, ?, ?)"
  );
  const seed = db.transaction(() => {
    const patterns = ["Marble","Wood","Concrete","Geometric","Plain","Mosaic","Stone","Abstract","Terrazzo","Zellige"];
    patterns.forEach((p, i) => insert.run("pattern", p.toLowerCase(), p, null, i));

    const finishes = ["Matte","Glossy","Satin","Polished","Textured","Rustic","Lappato","Sugar"];
    finishes.forEach((f, i) => insert.run("finish", f.toLowerCase(), f, null, i));

    const placements = [["Floor","floor"],["Wall","wall"],["Floor & Wall","both"],["Outdoor","outdoor"]];
    placements.forEach(([label, val], i) => insert.run("placement", val, label, null, i));

    const useCases = ["Bathroom","Kitchen","Living Room","Bedroom","Outdoor","Commercial","Balcony","Lobby"];
    useCases.forEach((u, i) => insert.run("use_case", u.toLowerCase().replace(/ /g,"_"), u, null, i));

    const colors = [
      ["White","white","#F5F5F5"],["Beige","beige","#E8DCC8"],["Cream","cream","#FFFDD0"],
      ["Grey","grey","#9E9E9E"],["Charcoal","charcoal","#37474F"],["Black","black","#212121"],
      ["Brown","brown","#795548"],["Terracotta","terracotta","#C1440E"],
      ["Blue","blue","#1565C0"],["Green","green","#2E7D32"],["Gold","gold","#F9A825"],
    ];
    colors.forEach(([label, val, hex], i) => insert.run("color", val, label, JSON.stringify({ hex }), i));

    const sizes = ["300×300","600×300","600×600","800×800","1200×600","1200×1200","200×1200","400×800"];
    sizes.forEach((s, i) => insert.run("size", s, s, null, i));

    const collections = ["Luxury Marble","Heritage Stone","Urban Concrete","Nature Wood","Classic White","Designer Series"];
    collections.forEach((c, i) => insert.run("collection", c.toLowerCase().replace(/ /g,"_"), c, null, i));
  });
  seed();
}

export type { Tile, TileInput, FilterOption } from "./types";

export default db;
