import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "../data/altilio.db"));
const result = db.prepare("UPDATE tiles SET image_path = NULL WHERE image_path = ''").run();
console.log(`Fixed ${result.changes} tiles with empty image_path.`);
db.close();
