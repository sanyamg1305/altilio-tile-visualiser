import TileForm from "@/components/TileForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import db, { Tile } from "@/lib/db";

export default async function EditTilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tile = db.prepare("SELECT * FROM tiles WHERE id = ?").get(Number(id)) as Tile | undefined;
  if (!tile) notFound();

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-700 flex items-center gap-1 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">Edit Tile</h1>
        <p className="text-sm text-stone-400 mt-0.5">{tile.name}</p>
      </div>
      <TileForm tile={tile} />
    </div>
  );
}
