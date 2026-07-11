"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type QuartzItem = { id: number; name: string; slug: string; image: string; color: string };

const COLOR_FILTERS = [
  { value: "white",     label: "White",      hex: "#F5F5F0" },
  { value: "cream",     label: "Cream",      hex: "#EDE8DC" },
  { value: "beige",     label: "Beige",      hex: "#D4C4A8" },
  { value: "grey",      label: "Grey",       hex: "#AEAEAA" },
  { value: "dark_grey", label: "Dark",       hex: "#4A4A48" },
  { value: "green",     label: "Green",      hex: "#5A8C6A" },
  { value: "aqua",      label: "Aqua",       hex: "#5AAEAA" },
  { value: "navy",      label: "Blue",       hex: "#3A5C8A" },
  { value: "pink",      label: "Pink",       hex: "#D4869A" },
  { value: "red",       label: "Red",        hex: "#A84444" },
];

const LIKES_KEY = "quartz_likes";

function getLikes(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveLikes(likes: Set<number>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...likes]));
}

export default function QuartzPage() {
  const [items, setItems] = useState<QuartzItem[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QuartzItem | null>(null);
  const [likes, setLikes] = useState<Set<number>>(new Set());
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLikes(getLikes());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    activeColors.forEach((c) => params.append("color", c));
    setLoading(true);
    fetch(`/api/quartz?${params}`)
      .then((r) => r.json())
      .then((d) => { setItems(d); setLoading(false); });
  }, [activeColors]);

  function toggleColor(c: string) {
    setActiveColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  const toggleLike = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveLikes(next);
      return next;
    });
  }, []);

  const displayItems = showLikedOnly ? items.filter((q) => likes.has(q.id)) : items;

  function handleExportPDF() {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 100);
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-grid { display: grid !important; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; }
          .print-card { break-inside: avoid; border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden; }
          .print-card img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
          .print-card-body { padding: 8px 12px; }
          .print-card-name { font-size: 13px; font-weight: 600; color: #1c1917; }
          .print-card-sub { font-size: 11px; color: #78716c; margin-top: 2px; }
          .print-header { padding: 24px 24px 16px; border-bottom: 1px solid #e7e5e4; }
          .print-header h1 { font-size: 24px; font-weight: 300; color: #1c1917; margin: 0 0 4px; }
          .print-header p { font-size: 12px; color: #78716c; margin: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-stone-950 text-white">
        {/* Nav */}
        <nav className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-stone-950/95 backdrop-blur border-b border-stone-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">Altilio</span>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-widest mt-0.5">Tiles</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/gallery" className="text-stone-400 hover:text-white text-sm transition-colors">Tiles</Link>
            <Link href="/quartz" className="text-white text-sm font-medium">Quartz</Link>
            <Link href="/find" className="text-stone-400 hover:text-white text-sm transition-colors">Find My Tile</Link>
          </div>
        </nav>

        <div className="pt-16">
          {/* Header */}
          <div className="print-header px-8 py-10 border-b border-stone-800">
            <p className="no-print text-stone-500 text-xs uppercase tracking-widest mb-2">Mozart · Surface Solutions</p>
            <h1 className="text-4xl font-light text-white mb-1">Quartz Collection</h1>
            <p className="text-stone-400 text-sm">
              {loading ? "Loading…" : `${displayItems.length} surface${displayItems.length !== 1 ? "s" : ""}${showLikedOnly ? " · Liked" : ""}`}
            </p>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="no-print w-56 shrink-0 border-r border-stone-800 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-6">
              {/* Liked filter */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Saved</p>
                <button
                  onClick={() => setShowLikedOnly((v) => !v)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    showLikedOnly ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white hover:bg-stone-900"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill={showLikedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  Liked ({likes.size})
                  {showLikedOnly && (
                    <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Colour filter */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Colour</p>
                <div className="space-y-1">
                  {COLOR_FILTERS.map((cf) => {
                    const active = activeColors.includes(cf.value);
                    return (
                      <button
                        key={cf.value}
                        onClick={() => toggleColor(cf.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          active ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white hover:bg-stone-900"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: cf.hex }} />
                        {cf.label}
                        {active && (
                          <svg className="w-3 h-3 ml-auto text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                  {activeColors.length > 0 && (
                    <button
                      onClick={() => setActiveColors([])}
                      className="w-full text-left px-3 py-2 text-xs text-stone-600 hover:text-stone-400 transition-colors mt-2"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>

              {/* Export PDF */}
              <div className="mt-auto pt-4 border-t border-stone-800">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting || displayItems.length === 0}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  {exporting ? "Preparing…" : "Export PDF"}
                </button>
              </div>
            </div>

            {/* Grid — shown on screen */}
            <div className="no-print flex-1 p-8">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-[16/9] bg-stone-800" />
                      <div className="p-4 bg-stone-900 space-y-2">
                        <div className="h-4 bg-stone-800 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-stone-600">
                  <p className="text-sm">{showLikedOnly ? "No liked surfaces yet" : "No surfaces match this filter"}</p>
                  <button
                    onClick={() => { setActiveColors([]); setShowLikedOnly(false); }}
                    className="mt-3 text-xs text-stone-500 hover:text-white transition-colors"
                  >
                    Clear filters →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayItems.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelected(q)}
                      className="group text-left rounded-2xl overflow-hidden border border-stone-800 hover:border-stone-600 transition-all hover:scale-[1.01] relative"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={q.image}
                          alt={q.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Like button */}
                        <button
                          onClick={(e) => toggleLike(e, q.id)}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 transition-colors"
                            fill={likes.has(q.id) ? "#f87171" : "none"}
                            stroke={likes.has(q.id) ? "#f87171" : "white"}
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </button>
                      </div>
                      <div className="px-4 py-3 bg-stone-900">
                        <p className="text-white font-medium text-sm">{q.name}</p>
                        <p className="text-stone-500 text-xs mt-0.5 capitalize">{q.color.replace("_", " ")} · Engineered Quartz</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Print-only grid */}
            <div className="print-grid hidden flex-1">
              {displayItems.map((q) => (
                <div key={q.id} className="print-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={q.image} alt={q.name} />
                  <div className="print-card-body">
                    <p className="print-card-name">{q.name}</p>
                    <p className="print-card-sub capitalize">{q.color.replace("_", " ")} · Engineered Quartz · Mozart Surfaces</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {selected && (
          <div
            className="no-print fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-10 right-0 text-stone-400 hover:text-white transition-colors text-sm"
              >
                Close ✕
              </button>
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                <Image src={selected.image} alt={selected.name} fill className="object-cover" sizes="90vw" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-xl font-semibold">{selected.name}</p>
                  <p className="text-stone-400 text-sm mt-0.5 capitalize">{selected.color.replace("_", " ")} · Engineered Quartz · Mozart Surfaces</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleLike(e, selected.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-700 text-sm transition-colors hover:border-stone-500"
                  >
                    <svg
                      className="w-4 h-4"
                      fill={likes.has(selected.id) ? "#f87171" : "none"}
                      stroke={likes.has(selected.id) ? "#f87171" : "currentColor"}
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {likes.has(selected.id) ? "Saved" : "Save"}
                  </button>
                  <Link
                    href="/find"
                    className="px-5 py-2.5 bg-white text-stone-900 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors"
                  >
                    Find a tile to match →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
