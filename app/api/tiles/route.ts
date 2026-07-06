import { NextRequest, NextResponse } from "next/server";
import db, { TileInput } from "@/lib/db";
import { queryTiles } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tiles = queryTiles(searchParams);
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
