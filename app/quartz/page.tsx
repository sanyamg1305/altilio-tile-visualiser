"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type QuartzItem = { id: number; name: string; slug: string; image: string; color: string; sku: string | null; price: number | null };

const COLOR_FILTERS = [
  { value: "white",     label: "White",  hex: "#F5F5F0" },
  { value: "cream",     label: "Cream",  hex: "#EDE8DC" },
  { value: "beige",     label: "Beige",  hex: "#D4C4A8" },
  { value: "grey",      label: "Grey",   hex: "#AEAEAA" },
  { value: "dark_grey", label: "Dark",   hex: "#4A4A48" },
  { value: "green",     label: "Green",  hex: "#5A8C6A" },
  { value: "aqua",      label: "Aqua",   hex: "#5AAEAA" },
  { value: "navy",      label: "Blue",   hex: "#3A5C8A" },
  { value: "pink",      label: "Pink",   hex: "#D4869A" },
  { value: "red",       label: "Red",    hex: "#A84444" },
];

const PRICE_RANGES = [
  { label: "Under ₹800",       min: 0,    max: 799   },
  { label: "₹800 – ₹1,000",   min: 800,  max: 1000  },
  { label: "₹1,000 – ₹1,200", min: 1001, max: 1200  },
  { label: "₹1,200 – ₹1,500", min: 1201, max: 1500  },
  { label: "Above ₹1,500",     min: 1501, max: 99999 },
];

const SORT_OPTIONS = [
  { value: "az",         label: "A – Z"          },
  { value: "za",         label: "Z – A"          },
  { value: "price_asc",  label: "Price: Low–High" },
  { value: "price_desc", label: "Price: High–Low" },
];

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" fill={filled ? "#f87171" : "none"} stroke={filled ? "#f87171" : "currentColor"} strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function CheckIcon() {
  return <svg className="w-3 h-3 ml-auto text-white shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>;
}

export default function QuartzPage() {
  const [items, setItems] = useState<QuartzItem[]>([]);
  const [allItems, setAllItems] = useState<QuartzItem[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activePriceRange, setActivePriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sort, setSort] = useState("az");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QuartzItem | null>(null);
  const [likes, setLikes] = useState<Set<number>>(new Set());
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/quartz").then((r) => r.json()).then(setAllItems);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    activeColors.forEach((c) => params.append("color", c));
    if (activePriceRange) {
      params.set("minPrice", String(activePriceRange.min));
      params.set("maxPrice", String(activePriceRange.max));
    }
    setLoading(true);
    fetch(`/api/quartz?${params}`)
      .then((r) => r.json())
      .then((d) => { setItems(d); setLoading(false); });
  }, [activeColors, activePriceRange]);

  const toggleColor = useCallback((c: string) => {
    setActiveColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }, []);

  const toggleLike = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveColors([]);
    setActivePriceRange(null);
    setShowLikedOnly(false);
  }, []);

  const sorted = [...(showLikedOnly ? items.filter((q) => likes.has(q.id)) : items)].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "za") return b.name.localeCompare(a.name);
    if (sort === "price_asc") return (a.price ?? 99999) - (b.price ?? 99999);
    if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    return 0;
  });

  const activeFilterCount = activeColors.length + (activePriceRange ? 1 : 0) + (showLikedOnly ? 1 : 0);

  function handleExportPDF() {
    setExporting(true);
    setTimeout(() => { window.print(); setExporting(false); }, 100);
  }

  // Shared sidebar content used in both desktop sidebar and mobile drawer
  function SidebarContent() {
    return (
      <div className="flex flex-col gap-6">
        {/* Liked */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Saved</p>
          <button
            onClick={() => { setShowLikedOnly((v) => !v); setDrawerOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${showLikedOnly ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white hover:bg-stone-900"}`}
          >
            <HeartIcon filled={showLikedOnly} />
            Liked ({likes.size})
            {showLikedOnly && <CheckIcon />}
          </button>
        </div>

        {/* Price */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Price / sqft</p>
          <div className="space-y-1">
            {PRICE_RANGES.map((pr) => {
              const active = activePriceRange?.min === pr.min && activePriceRange?.max === pr.max;
              return (
                <button
                  key={pr.label}
                  onClick={() => { setActivePriceRange(active ? null : { min: pr.min, max: pr.max }); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white hover:bg-stone-900"}`}
                >
                  <span>{pr.label}</span>
                  {active && <CheckIcon />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colour */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Colour</p>
          <div className="space-y-1">
            {COLOR_FILTERS.map((cf) => {
              const active = activeColors.includes(cf.value);
              return (
                <button
                  key={cf.value}
                  onClick={() => toggleColor(cf.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white hover:bg-stone-900"}`}
                >
                  <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: cf.hex }} />
                  {cf.label}
                  {active && <CheckIcon />}
                </button>
              );
            })}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="w-full text-left px-3 py-2 text-xs text-stone-600 hover:text-stone-400 transition-colors mt-2">
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="pt-4 border-t border-stone-800">
          <button
            onClick={handleExportPDF}
            disabled={exporting || likes.size === 0}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {exporting ? "Preparing…" : `Export PDF${likes.size > 0 ? ` (${likes.size})` : ""}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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
          .print-company { display: flex !important; justify-content: space-between; align-items: flex-start; padding: 16px 24px; border-bottom: 2px solid #1c1917; }
          .print-company-name { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 2px; }
          .print-company-tag { font-size: 11px; color: #78716c; font-style: italic; }
          .print-company-contact { text-align: right; font-size: 11px; color: #57534e; line-height: 1.6; }
          .print-toc { display: block !important; padding: 14px 24px; background: #fafaf9; border-bottom: 1px solid #e7e5e4; }
          .print-toc-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c; margin: 0 0 6px; }
          .print-toc-list { margin: 0; padding-left: 16px; font-size: 10px; color: #57534e; line-height: 1.8; }
          .print-footer { display: flex !important; padding: 12px 24px; border-top: 1px solid #e7e5e4; font-size: 10px; color: #a8a29e; justify-content: space-between; margin-top: 16px; }
        }
      `}</style>

      <div className="min-h-screen bg-stone-950 text-white">
        {/* Nav */}
        <nav className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 h-14 sm:h-16 bg-stone-950/95 backdrop-blur border-b border-stone-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">Altilio</span>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-widest mt-0.5 hidden sm:block">Tiles</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/gallery" className="text-stone-400 hover:text-white text-sm transition-colors">Tiles</Link>
            <Link href="/quartz" className="text-white text-sm font-medium">Quartz</Link>
            <Link href="/find" className="text-stone-400 hover:text-white text-sm transition-colors hidden sm:block">Find My Tile</Link>
          </div>
        </nav>

        <div className="pt-14 sm:pt-16">
          {/* Header */}
          <div className="px-4 sm:px-8 py-6 sm:py-10 border-b border-stone-800">
            <p className="no-print text-stone-500 text-xs uppercase tracking-widest mb-2">Mozart · Surface Solutions</p>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-4xl font-light text-white mb-1">Quartz Collection</h1>
                <p className="text-stone-400 text-sm">
                  {loading ? "Loading…" : `${sorted.length} surface${sorted.length !== 1 ? "s" : ""}${showLikedOnly ? " · Liked" : ""}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="no-print sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-white text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                  </svg>
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </button>
                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="no-print bg-stone-900 border border-stone-700 text-white text-sm rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:border-stone-500"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Desktop sidebar */}
            <div className="no-print hidden sm:flex w-56 shrink-0 border-r border-stone-800 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-col">
              <SidebarContent />
            </div>

            {/* Mobile drawer overlay */}
            {drawerOpen && (
              <div className="no-print fixed inset-0 z-50 sm:hidden">
                <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-72 bg-stone-950 border-r border-stone-800 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-white font-semibold">Filters</p>
                    <button onClick={() => setDrawerOpen(false)} className="text-stone-400 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <SidebarContent />
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="no-print flex-1 p-3 sm:p-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] sm:aspect-[16/9] bg-stone-800" />
                      <div className="p-4 bg-stone-900 space-y-2">
                        <div className="h-4 bg-stone-800 rounded w-2/3" />
                        <div className="h-3 bg-stone-800 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-stone-600">
                  <p className="text-sm">{showLikedOnly ? "No liked surfaces yet" : "No surfaces match this filter"}</p>
                  <button onClick={clearFilters} className="mt-3 text-xs text-stone-500 hover:text-white transition-colors">
                    Clear filters →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                  {sorted.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelected(q)}
                      className="group text-left rounded-2xl overflow-hidden border border-stone-800 hover:border-stone-600 transition-all active:scale-[0.99]"
                    >
                      <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden">
                        <Image
                          src={q.image}
                          alt={q.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <button
                          onClick={(e) => toggleLike(e, q.id)}
                          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                        >
                          <HeartIcon filled={likes.has(q.id)} />
                        </button>
                        {q.price && (
                          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                            ₹{q.price.toLocaleString("en-IN")}/sqft
                          </span>
                        )}
                      </div>
                      <div className="px-4 py-3 bg-stone-900">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white font-medium text-sm leading-snug">{q.name}</p>
                          {q.price && <p className="text-stone-300 text-sm font-semibold shrink-0">₹{q.price.toLocaleString("en-IN")}</p>}
                        </div>
                        <p className="text-stone-500 text-xs mt-0.5 capitalize">
                          {q.color.replace("_", " ")} · Engineered Quartz{q.sku ? ` · ${q.sku}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Print-only company header */}
            <div className="print-company hidden">
              <div>
                <p className="print-company-name">Aashiyana Decor</p>
                <p className="print-company-tag">For Stylish Living</p>
                <p style={{ fontSize: "10px", color: "#78716c", marginTop: "4px" }}>
                  Plot No. 08, Rajiv Vihar, Opp. Metro Pillar, Mansarovar Metro Station<br />
                  Jaipur, Rajasthan – 302019
                </p>
              </div>
              <div className="print-company-contact">
                <p>Mob: 9414153909 / 9314021950</p>
                <p style={{ marginTop: "6px", fontWeight: 600, color: "#1c1917" }}>
                  Specta Quartz Surfaces — Price List (incl. GST) · 01.04.2026
                </p>
              </div>
            </div>

            {/* Print-only T&C */}
            <div className="print-toc hidden">
              <p className="print-toc-title">Terms &amp; Conditions</p>
              <ol className="print-toc-list">
                <li>Slab size: 3275 × 1460 mm (129&quot; × 57&quot;) — 51.47 sqft per slab.</li>
                <li>All prices are inclusive of GST @ 18%.</li>
                <li>Payment terms: 100% advance.</li>
                <li>Freight charges are extra and applicable as per delivery location.</li>
                <li>Prices are subject to change without prior notice.</li>
                <li>Aashiyana Decor is not responsible for colour variation between digital images and actual slabs.</li>
              </ol>
            </div>

            {/* Print-only grid */}
            <div className="print-grid hidden flex-1">
              {allItems.filter((q) => likes.has(q.id)).map((q) => (
                <div key={q.id} className="print-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={q.image} alt={q.name} />
                  <div className="print-card-body">
                    <p className="print-card-name">{q.name}</p>
                    <p className="print-card-sub capitalize">
                      {q.color.replace("_", " ")} · {q.sku ?? ""}{q.price ? ` · ₹${q.price.toLocaleString("en-IN")}/sqft` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Print-only footer */}
            <div className="print-footer hidden">
              <span>Aashiyana Decor · Jaipur · 9414153909</span>
              <span>This is a computer-generated quotation and does not require a signature.</span>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {selected && (
          <div className="no-print fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center sm:p-6" onClick={() => setSelected(null)}>
            <div className="relative w-full sm:max-w-5xl" onClick={(e) => e.stopPropagation()}>
              {/* Mobile: bottom sheet style */}
              <div className="sm:hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={selected.image} alt={selected.name} fill className="object-cover" sizes="100vw" />
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white text-sm">✕</button>
                </div>
                <div className="bg-stone-900 px-5 py-5 rounded-t-none">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-white text-lg font-semibold">{selected.name}</p>
                    {selected.price && <p className="text-white text-xl font-light shrink-0">₹{selected.price.toLocaleString("en-IN")}</p>}
                  </div>
                  <p className="text-stone-400 text-xs capitalize mb-1">
                    {selected.color.replace("_", " ")} · Engineered Quartz{selected.sku ? ` · ${selected.sku}` : ""}
                  </p>
                  {selected.price && <p className="text-stone-500 text-xs mb-4">per sqft · incl. GST @18%</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => toggleLike(e, selected.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-700 text-sm transition-colors flex-1 justify-center"
                    >
                      <HeartIcon filled={likes.has(selected.id)} />
                      {likes.has(selected.id) ? "Saved" : "Save"}
                    </button>
                    <Link href="/find" className="px-4 py-2.5 bg-white text-stone-900 rounded-full text-sm font-medium flex-1 text-center">
                      Find matching tile →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop: centered modal */}
              <div className="hidden sm:block">
                <button onClick={() => setSelected(null)} className="absolute -top-10 right-0 text-stone-400 hover:text-white transition-colors text-sm">
                  Close ✕
                </button>
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <Image src={selected.image} alt={selected.name} fill className="object-cover" sizes="90vw" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-xl font-semibold">{selected.name}</p>
                    <p className="text-stone-400 text-sm mt-0.5 capitalize">
                      {selected.color.replace("_", " ")} · Engineered Quartz · Mozart Surfaces{selected.sku ? ` · ${selected.sku}` : ""}
                    </p>
                    {selected.price && (
                      <p className="text-white text-2xl font-light mt-2">
                        ₹{selected.price.toLocaleString("en-IN")}
                        <span className="text-stone-400 text-sm font-normal ml-1">/sqft · incl. GST</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => toggleLike(e, selected.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-700 text-sm transition-colors hover:border-stone-500"
                    >
                      <HeartIcon filled={likes.has(selected.id)} />
                      {likes.has(selected.id) ? "Saved" : "Save"}
                    </button>
                    <Link href="/find" className="px-5 py-2.5 bg-white text-stone-900 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors">
                      Find a tile to match →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
