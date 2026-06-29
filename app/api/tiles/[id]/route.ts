import { NextRequest, NextResponse } from "next/server";
import db, { TileInput } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tile = db.prepare("SELECT * FROM tiles WHERE id = ?").get(Number(id));
  if (!tile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tile);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: TileInput = await request.json();
  db.prepare(`
    UPDATE tiles SET name=@name, sku=@sku, size=@size, placement=@placement, pattern=@pattern,
    finish=@finish, color=@color, price=@price, price_unit=@price_unit, use_cases=@use_cases,
    collection=@collection, brand=@brand, image_path=@image_path, description=@description,
    updated_at=CURRENT_TIMESTAMP WHERE id=@id
  `).run({ ...body, id: Number(id) });
  const tile = db.prepare("SELECT * FROM tiles WHERE id = ?").get(Number(id));
  return NextResponse.json(tile);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare("DELETE FROM tiles WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
