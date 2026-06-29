import { NextRequest, NextResponse } from "next/server";
import db, { TileInput } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  let query = "SELECT * FROM tiles WHERE 1=1";
  const params: (string | number)[] = [];

  // Multi-value filters (comma-separated)
  const multiFilter = (col: string, param: string) => {
    const vals = searchParams.getAll(param).flatMap((v) => v.split(",")).filter(Boolean);
    if (vals.length > 0) {
      query += ` AND ${col} IN (${vals.map(() => "?").join(",")})`;
      params.push(...vals);
    }
  };

  multiFilter("placement", "placement");
  multiFilter("pattern", "pattern");
  multiFilter("finish", "finish");
  multiFilter("color", "color");
  multiFilter("size", "size");
  multiFilter("collection", "collection");
  multiFilter("brand", "brand");

  // Use case — stored as comma-separated string, match any
  const useCases = searchParams.getAll("use_case").flatMap((v) => v.split(",")).filter(Boolean);
  if (useCases.length > 0) {
    const likeClauses = useCases.map(() => "use_cases LIKE ?").join(" OR ");
    query += ` AND (${likeClauses})`;
    useCases.forEach((uc) => params.push(`%${uc}%`));
  }

  // Price range
  const priceMin = searchParams.get("price_min");
  const priceMax = searchParams.get("price_max");
  if (priceMin) { query += " AND price >= ?"; params.push(Number(priceMin)); }
  if (priceMax) { query += " AND price <= ?"; params.push(Number(priceMax)); }

  query += " ORDER BY created_at DESC";

  const tiles = db.prepare(query).all(...params);
  return NextResponse.json(tiles);
}

export async function POST(request: NextRequest) {
  const body: TileInput = await request.json();
  const stmt = db.prepare(`
    INSERT INTO tiles (name, sku, size, placement, pattern, finish, color, price, price_unit, use_cases, collection, brand, image_path, description)
    VALUES (@name, @sku, @size, @placement, @pattern, @finish, @color, @price, @price_unit, @use_cases, @collection, @brand, @image_path, @description)
  `);
  const result = stmt.run(body);
  const tile = db.prepare("SELECT * FROM tiles WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(tile, { status: 201 });
}
