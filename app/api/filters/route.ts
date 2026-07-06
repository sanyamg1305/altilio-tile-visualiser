import { NextResponse } from "next/server";
import { FilterOption } from "@/lib/types";
import { getAllFilterOptions, getAllTiles } from "@/lib/catalog";

export async function GET() {
  const options = getAllFilterOptions();
  const tiles = getAllTiles();

  const prices = tiles.map((t) => t.price).filter((p): p is number => p != null);
  const priceRange = prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : { min: null, max: null };

  const grouped: Record<string, FilterOption[]> = {};
  for (const opt of options) {
    if (!grouped[opt.category]) grouped[opt.category] = [];
    grouped[opt.category].push(opt);
  }

  return NextResponse.json({ options: grouped, priceRange });
}
