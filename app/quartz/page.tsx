"use client";
import { useState, useEffect } from "react";
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

export default function QuartzPage() {
  const [items, setItems] = useState<QuartzItem[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QuartzItem | null>(null);

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

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-stone-950/95 backdrop-blur border-b border-stone-800">
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
        <div className="px-8 py-10 border-b border-stone-800">
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Mozart · Surface Solutions</p>
          <h1 className="text-4xl font-light text-white mb-1">Quartz Collection</h1>
          <p className="text-stone-400 text-sm">{loading ? "Loading…" : `${items.length} surface${items.length !== 1 ? "s" : ""}`}</p>
        </div>

        <div className="flex">
          {/* Sidebar filter */}
          <div className="w-56 shrink-0 border-r border-stone-800 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Colour</p>
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

          {/* Grid */}
          <div className="flex-1 p-8">
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
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-600">
                <p className="text-sm">No surfaces match this filter</p>
                <button onClick={() => setActiveColors([])} className="mt-3 text-xs text-stone-500 hover:text-white transition-colors">
                  Clear filter →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelected(q)}
                    className="group text-left rounded-2xl overflow-hidden border border-stone-800 hover:border-stone-600 transition-all hover:scale-[1.01]"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={q.image}
                        alt={q.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
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
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
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
              <Link
                href="/find"
                className="px-5 py-2.5 bg-white text-stone-900 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Find a tile to match →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
