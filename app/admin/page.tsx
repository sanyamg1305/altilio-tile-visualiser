"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tile } from "@/lib/types";

function toLabel(slug: string | null) {
  return slug ? slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
}

export default function AdminPage() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchTiles = async () => {
    const res = await fetch("/api/tiles");
    setTiles(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTiles(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/tiles/${id}`, { method: "DELETE" });
    setTiles((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-700 flex items-center gap-1 mb-3 w-fit">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Gallery
        </Link>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Tile Management</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {loading ? "Loading…" : `${tiles.length} tile${tiles.length !== 1 ? "s" : ""} in catalog`}
          </p>
        </div>
        <Link
          href="/admin/tiles/new"
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Tile
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-400">
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1" />
          </svg>
          <p className="text-sm font-medium">No tiles yet</p>
          <Link href="/admin/tiles/new" className="text-xs text-stone-900 underline mt-2">Add your first tile</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3 w-16">Image</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3 hidden md:table-cell">SKU</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3 hidden lg:table-cell">Collection</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3 hidden md:table-cell">Size</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3 hidden lg:table-cell">Placement</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3 hidden sm:table-cell">Price</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tiles.map((tile) => (
                <tr key={tile.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden relative shrink-0">
                      {tile.image_path ? (
                        <Image src={tile.image_path} alt={tile.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">—</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900 text-sm">{tile.name}</p>
                    {tile.pattern && <p className="text-xs text-stone-400">{toLabel(tile.pattern)}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-stone-500">{tile.sku || "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-stone-500">{toLabel(tile.collection)}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-stone-500">{tile.size || "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {tile.placement ? (
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{toLabel(tile.placement)}</span>
                    ) : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    {tile.price != null ? (
                      <span className="text-sm font-medium text-stone-700">
                        ₹{tile.price.toLocaleString("en-IN")}
                      </span>
                    ) : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/tiles/${tile.id}/edit`}
                        className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(tile.id, tile.name)}
                        disabled={deleting === tile.id}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === tile.id ? (
                          <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
