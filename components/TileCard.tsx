"use client";
import Image from "next/image";
import { Tile } from "@/lib/types";

type Props = {
  tile: Tile;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onClick: () => void;
};

function label(slug: string | null) {
  return slug ? slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;
}

export default function TileCard({ tile, selected, onToggleSelect, onClick }: Props) {
  return (
    <div
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        selected ? "ring-2 ring-amber-500 ring-offset-2" : "hover:shadow-xl"
      }`}
      onClick={onClick}
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        {tile.image_path ? (
          <Image
            src={tile.image_path}
            alt={tile.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex flex-wrap gap-1">
            {tile.placement && (
              <span className="text-xs bg-white/20 text-white backdrop-blur-sm px-2 py-0.5 rounded-full">
                {label(tile.placement)}
              </span>
            )}
            {tile.size && (
              <span className="text-xs bg-white/20 text-white backdrop-blur-sm px-2 py-0.5 rounded-full">
                {tile.size}
              </span>
            )}
            {tile.finish && (
              <span className="text-xs bg-white/20 text-white backdrop-blur-sm px-2 py-0.5 rounded-full">
                {label(tile.finish)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(tile.id); }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-amber-500 border-amber-500"
              : "bg-white/80 border-white opacity-0 group-hover:opacity-100"
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-stone-900 text-sm truncate">{tile.name}</h3>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-stone-400">{label(tile.collection) || label(tile.pattern) || "—"}</span>
          {tile.price != null && (
            <span className="text-xs font-medium text-stone-700">
              ₹{tile.price.toLocaleString("en-IN")}/{tile.price_unit === "per_sqft" ? "sq ft" : "tile"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
