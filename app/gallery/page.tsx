"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TileCard from "@/components/TileCard";
import TileFilters, { ActiveFilters, emptyFilters } from "@/components/TileFilters";
import PresentMode from "@/components/PresentMode";
import { Tile, FilterOption } from "@/lib/types";

type FilterData = {
  options: Record<string, FilterOption[]>;
  priceRange: { min: number | null; max: number | null };
};

function filtersFromParams(params: URLSearchParams): ActiveFilters {
  const multi = (key: string) => params.getAll(key).flatMap((v) => v.split(",")).filter(Boolean);
  return {
    ...emptyFilters,
    placement: multi("placement"),
    pattern: multi("pattern"),
    finish: multi("finish"),
    color: multi("color"),
    size: multi("size"),
    collection: multi("collection"),
    brand: multi("brand"),
    use_case: multi("use_case"),
    price_min: params.get("price_min") ? Number(params.get("price_min")) : null,
    price_max: params.get("price_max") ? Number(params.get("price_max")) : null,
  };
}

export default function GalleryPageWrapper() {
  return (
    <Suspense>
      <GalleryPage />
    </Suspense>
  );
}

function GalleryPage() {
  const searchParams = useSearchParams();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [filterData, setFilterData] = useState<FilterData>({ options: {}, priceRange: { min: null, max: null } });
  const [filters, setFilters] = useState<ActiveFilters>(() => filtersFromParams(searchParams));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [presenting, setPresenting] = useState(false);
  const [presentStart, setPresentStart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchTiles = useCallback(async () => {
    const params = new URLSearchParams();
    const arr = (key: string, vals: string[]) => vals.forEach((v) => params.append(key, v));
    arr("placement", filters.placement);
    arr("pattern", filters.pattern);
    arr("finish", filters.finish);
    arr("color", filters.color);
    arr("size", filters.size);
    arr("collection", filters.collection);
    arr("brand", filters.brand);
    arr("use_case", filters.use_case);
    if (filters.price_min != null) params.set("price_min", String(filters.price_min));
    if (filters.price_max != null) params.set("price_max", String(filters.price_max));
    const res = await fetch(`/api/tiles?${params}`);
    setTiles(await res.json());
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchTiles(); }, [fetchTiles]);
  useEffect(() => {
    fetch("/api/filters").then((r) => r.json()).then(setFilterData);
  }, []);

  const toggleSelect = (id: number) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const openPresent = (startId?: number) => {
    const pool = selected.size > 0 ? tiles.filter((t) => selected.has(t.id)) : tiles;
    if (!pool.length) return;
    const idx = startId != null ? Math.max(0, pool.findIndex((t) => t.id === startId)) : 0;
    setPresentStart(idx);
    setPresenting(true);
  };

  const presentTiles = selected.size > 0 ? tiles.filter((t) => selected.has(t.id)) : tiles;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Mobile filter drawer overlay */}
      {filtersOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative z-50 w-72 bg-white h-full overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-stone-900 text-sm">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="text-stone-400 hover:text-stone-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TileFilters filters={filters} data={filterData} onChange={(f) => { setFilters(f); }} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-8">
        <div className="hidden md:block">
          <TileFilters filters={filters} data={filterData} onChange={setFilters} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900">Tile Catalog</h1>
              <p className="text-sm text-stone-400 mt-0.5">
                {loading ? "Loading…" : `${tiles.length} tile${tiles.length !== 1 ? "s" : ""}`}
                {selected.size > 0 && ` · ${selected.size} selected`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:border-stone-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h4" />
                </svg>
                Filters
              </button>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())}
                  className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
                  Clear selection
                </button>
              )}
              <button onClick={() => openPresent()} disabled={tiles.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.893L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {selected.size > 0 ? `Present ${selected.size} tiles` : "Present all"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-stone-200" />
                  <div className="p-3 bg-white space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
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
              <p className="text-sm font-medium">No tiles found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tiles.map((tile) => (
                <TileCard key={tile.id} tile={tile} selected={selected.has(tile.id)}
                  onToggleSelect={toggleSelect} onClick={() => openPresent(tile.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {presenting && (
        <PresentMode tiles={presentTiles} startIndex={presentStart} onClose={() => setPresenting(false)} />
      )}
    </div>
  );
}
