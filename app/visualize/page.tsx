"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TileVisualizer, { TileParams } from "@/components/TileVisualizer";
import { Tile } from "@/lib/types";

// Map color tags → CSS colours
const COLOR_HEX: Record<string, string> = {
  white: "#F0EFE9",
  cream: "#EDE8DC",
  beige: "#D4C4A8",
  grey: "#BDBDBA",
  dark_grey: "#5A5A58",
  taupe: "#9E8E7E",
  pink: "#EEC8C0",
  salmon: "#E08060",
  sage: "#9CAF88",
  green: "#4A7C59",
  aqua: "#B2DFD8",
  navy: "#4A5C7A",
};

// Size string → mm dimensions
const SIZE_DIMS: Record<string, [number, number]> = {
  "600×1200": [600, 1200],
  "600×600": [600, 600],
  "300×600": [300, 600],
  "300×300": [300, 300],
};

const SIZE_OPTIONS = Object.keys(SIZE_DIMS);

const GROUT_OPTIONS = [
  { label: "Light", value: "#CCCCCC" },
  { label: "Mid Grey", value: "#888888" },
  { label: "Dark", value: "#444444" },
  { label: "White", value: "#F0F0F0" },
];

function firstColor(tile: Tile): string {
  const tag = tile.color?.split(",")[0]?.trim() ?? "grey";
  return COLOR_HEX[tag] ?? "#C8C8C4";
}

function tileSize(tile: Tile): string {
  return tile.size?.split(",")[0]?.trim() ?? "600×600";
}

export default function VisualizePage() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [size, setSize] = useState("600×600");
  const [grout, setGrout] = useState("#888888");
  useEffect(() => {
    fetch("/api/tiles?placement=both")
      .then((r) => r.json())
      .then((data: Tile[]) => {
        setTiles(data);
        if (data.length) setActiveTile(data[0]);
      });
  }, []);

  const resolvedColor = customColor ?? (activeTile ? firstColor(activeTile) : "#D4C4A8");
  const [wMM, hMM] = SIZE_DIMS[size] ?? [600, 600];
  const tileParams: TileParams = {
    color: resolvedColor,
    groutColor: grout,
    widthMM: wMM,
    heightMM: hMM,
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-stone-800 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-tight">Altilio</span>
          <span className="text-xs text-stone-500 font-medium uppercase tracking-widest mt-0.5">Tiles</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/gallery" className="text-stone-400 hover:text-white text-sm transition-colors">Gallery</Link>
          <Link href="/find" className="text-stone-400 hover:text-white text-sm transition-colors">Find My Tile</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-w-0">
          <div className="w-full max-w-4xl">
            <TileVisualizer tile={tileParams} />
            <p className="text-stone-600 text-xs text-center mt-3">Modern Bathroom · Floor view</p>
          </div>
        </div>

        {/* Controls sidebar */}
        <div className="w-72 border-l border-stone-800 flex flex-col overflow-y-auto shrink-0">
          <div className="p-5 border-b border-stone-800">
            <h2 className="text-sm font-semibold text-white mb-0.5">Room Visualizer</h2>
            <p className="text-xs text-stone-500">See any tile on the floor instantly</p>
          </div>

          {/* Tile size */}
          <div className="p-5 border-b border-stone-800">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Tile Size</p>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    size === s
                      ? "border-white bg-stone-800 text-white"
                      : "border-stone-700 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grout colour */}
          <div className="p-5 border-b border-stone-800">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Grout</p>
            <div className="flex gap-2">
              {GROUT_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  title={g.label}
                  onClick={() => setGrout(g.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    grout === g.value ? "border-white scale-110" : "border-stone-700"
                  }`}
                  style={{ backgroundColor: g.value }}
                />
              ))}
            </div>
          </div>

          {/* Custom color */}
          <div className="p-5 border-b border-stone-800">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Custom Colour</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor ?? resolvedColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setActiveTile(null);
                }}
                className="w-10 h-10 rounded-lg border border-stone-700 bg-stone-800 cursor-pointer"
              />
              {customColor && (
                <button
                  onClick={() => { setCustomColor(null); if (tiles.length) setActiveTile(tiles[0]); }}
                  className="text-xs text-stone-500 hover:text-white transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Tile picker */}
          <div className="p-5 flex-1">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              From Catalog ({tiles.length} tiles)
            </p>
            <div className="space-y-2">
              {tiles.map((t) => {
                const c = firstColor(t);
                const isActive = activeTile?.id === t.id && !customColor;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTile(t); setCustomColor(null); setSize(tileSize(t)); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                      isActive
                        ? "border-white bg-stone-800"
                        : "border-stone-800 hover:border-stone-600"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-md border border-white/10 shrink-0"
                      style={{ backgroundColor: c }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{t.name}</p>
                      <p className="text-xs text-stone-500 truncate">{tileSize(t)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
