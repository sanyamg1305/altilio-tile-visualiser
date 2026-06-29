import { NextResponse } from "next/server";
import db, { FilterOption } from "@/lib/db";

export async function GET() {
  const options = db.prepare(
    "SELECT * FROM filter_options ORDER BY category, sort_order, label"
  ).all() as FilterOption[];

  const priceRange = db.prepare(
    "SELECT MIN(price) as min, MAX(price) as max FROM tiles WHERE price IS NOT NULL"
  ).get() as { min: number | null; max: number | null };

  const grouped: Record<string, FilterOption[]> = {};
  for (const opt of options) {
    if (!grouped[opt.category]) grouped[opt.category] = [];
    grouped[opt.category].push(opt);
  }

  return NextResponse.json({ options: grouped, priceRange });
}
