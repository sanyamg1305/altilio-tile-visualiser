"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Tile } from "@/lib/types";

type Props = {
  tiles: Tile[];
  startIndex?: number;
  onClose: () => void;
};

export default function PresentMode({ tiles, startIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(startIndex);
  const [showInfo, setShowInfo] = useState(true);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + tiles.length) % tiles.length), [tiles.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % tiles.length), [tiles.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "i") setShowInfo((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose]);

  const tile = tiles[current];
  if (!tile) return null;

  const useCases = tile.use_cases ? tile.use_cases.split(",").map((s) => s.trim()) : [];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex">
      <div className="flex-1 relative flex items-center justify-center">
        {tile.image_path ? (
          <Image
            src={tile.image_path}
            alt={tile.name}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="text-stone-600 text-center">
            <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1" />
            </svg>
            <p className="text-sm">No image</p>
          </div>
        )}

        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          title="Previous (←)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          title="Next (→)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Floating controls shown when info panel is hidden */}
        {!showInfo && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setShowInfo(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              title="Show info (I)"
            >
              Show info
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Close (ESC)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        className={`w-72 bg-stone-950 border-l border-stone-800 flex flex-col transition-all duration-300 ${
          showInfo ? "translate-x-0" : "translate-x-full absolute right-0 top-0 bottom-0"
        }`}
      >
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <span className="text-stone-400 text-xs">
            {current + 1} / {tiles.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="text-stone-400 hover:text-white text-xs transition-colors"
              title="Toggle info (I)"
            >
              {showInfo ? "Hide" : "Show"} info
            </button>
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors" title="Close (ESC)">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-white font-semibold text-xl mb-1">{tile.name}</h2>
          {tile.sku && <p className="text-stone-500 text-xs mb-4">SKU: {tile.sku}</p>}

          {tile.price != null && (
            <div className="mb-5 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-amber-400 font-semibold text-lg">
                ₹{tile.price.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-amber-400/70 ml-1">
                  / {tile.price_unit === "per_sqft" ? "sq ft" : "tile"}
                </span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            {tile.collection && (
              <Detail label="Collection" value={tile.collection} />
            )}
            {tile.brand && <Detail label="Brand" value={tile.brand} />}
            {tile.size && <Detail label="Size" value={tile.size} />}
            {tile.placement && <Detail label="Placement" value={tile.placement} />}
            {tile.pattern && <Detail label="Pattern" value={tile.pattern} />}
            {tile.finish && <Detail label="Finish" value={tile.finish} />}
            {useCases.length > 0 && (
              <div>
                <p className="text-stone-500 text-xs mb-1.5">Use Cases</p>
                <div className="flex flex-wrap gap-1.5">
                  {useCases.map((uc) => (
                    <span key={uc} className="text-xs bg-stone-800 text-stone-300 px-2.5 py-0.5 rounded-full">
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tile.description && (
              <div>
                <p className="text-stone-500 text-xs mb-1.5">Description</p>
                <p className="text-stone-300 text-sm leading-relaxed">{tile.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-stone-800">
          {tiles.length <= 20 ? (
            <div className="flex gap-1.5 justify-center flex-wrap">
              {tiles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? "bg-amber-400 w-4" : "bg-stone-600 hover:bg-stone-400 w-1.5"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <button onClick={prev} className="text-stone-400 hover:text-white transition-colors px-2 py-1 text-xs">‹ Prev</button>
              <span className="text-stone-400 text-xs tabular-nums">{current + 1} / {tiles.length}</span>
              <button onClick={next} className="text-stone-400 hover:text-white transition-colors px-2 py-1 text-xs">Next ›</button>
            </div>
          )}
          <p className="text-center text-stone-600 text-xs mt-3">← → to navigate · ESC to exit · I to toggle info</p>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-stone-500 text-xs mb-0.5">{label}</p>
      <p className="text-stone-200 text-sm">{value}</p>
    </div>
  );
}
