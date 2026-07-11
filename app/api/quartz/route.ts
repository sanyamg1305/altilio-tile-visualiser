import { NextRequest, NextResponse } from "next/server";
import quartzData from "@/data/quartz.json";

type QuartzItem = { id: number; name: string; slug: string; image: string; color: string; sku: string | null; price: number | null };

export async function GET(req: NextRequest) {
  const colors = req.nextUrl.searchParams.getAll("color").flatMap((v) => v.split(",")).filter(Boolean);
  const minPrice = req.nextUrl.searchParams.get("minPrice");
  const maxPrice = req.nextUrl.searchParams.get("maxPrice");

  let items: QuartzItem[] = quartzData as QuartzItem[];

  if (colors.length > 0) items = items.filter((q) => colors.includes(q.color));
  if (minPrice) items = items.filter((q) => q.price !== null && q.price >= Number(minPrice));
  if (maxPrice) items = items.filter((q) => q.price !== null && q.price <= Number(maxPrice));

  return NextResponse.json(items);
}
