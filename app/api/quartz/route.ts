import { NextRequest, NextResponse } from "next/server";
import quartzData from "@/data/quartz.json";

type QuartzItem = { id: number; name: string; slug: string; image: string; color: string };

export async function GET(req: NextRequest) {
  const colors = req.nextUrl.searchParams.getAll("color").flatMap((v) => v.split(",")).filter(Boolean);
  let items: QuartzItem[] = quartzData;
  if (colors.length > 0) {
    items = items.filter((q) => colors.includes(q.color));
  }
  return NextResponse.json(items);
}
