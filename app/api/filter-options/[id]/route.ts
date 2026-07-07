import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { default: db } = await import("@/lib/db");
  const { id } = await params;
  const { label, metadata, sort_order } = await request.json();
  db.prepare(
    "UPDATE filter_options SET label=?, metadata=?, sort_order=? WHERE id=?"
  ).run(label, metadata ?? null, sort_order ?? 0, Number(id));
  const opt = db.prepare("SELECT * FROM filter_options WHERE id = ?").get(Number(id));
  return NextResponse.json(opt);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { default: db } = await import("@/lib/db");
  const { id } = await params;
  db.prepare("DELETE FROM filter_options WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
