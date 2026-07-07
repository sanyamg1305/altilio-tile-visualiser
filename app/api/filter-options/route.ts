import { NextRequest, NextResponse } from "next/server";
import { getAllFilterOptions } from "@/lib/catalog";

export async function GET() {
  const options = getAllFilterOptions();
  return NextResponse.json(options);
}

export async function POST(request: NextRequest) {
  const { default: db } = await import("@/lib/db");
  const { category, value, label, metadata, sort_order } = await request.json();
  if (!category || !value || !label) {
    return NextResponse.json({ error: "category, value, and label are required" }, { status: 400 });
  }
  try {
    const result = db.prepare(
      "INSERT INTO filter_options (category, value, label, metadata, sort_order) VALUES (?, ?, ?, ?, ?)"
    ).run(category, value, label, metadata ?? null, sort_order ?? 0);
    const opt = db.prepare("SELECT * FROM filter_options WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json(opt, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Option with this value already exists in category" }, { status: 409 });
  }
}
