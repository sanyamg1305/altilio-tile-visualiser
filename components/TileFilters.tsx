"use client";
import { useState } from "react";
import { FilterOption } from "@/lib/types";

export type ActiveFilters = {
  placement: string[];
  pattern: string[];
  finish: string[];
  color: string[];
  size: string[];
  collection: string[];
  brand: string[];
  use_case: string[];
  price_min: number | null;
  price_max: number | null;
};

export const emptyFilters: ActiveFilters = {
  placement: [], pattern: [], finish: [], color: [],
  size: [], collection: [], brand: [], use_case: [],
  price_min: null, price_max: null,
};

type FilterData = {
  options: Record<string, FilterOption[]>;
  priceRange: { min: number | null; max: number | null };
};

type Props = {
  filters: ActiveFilters;
  data: FilterData;
  onChange: (f: ActiveFilters) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  placement: "Placement",
  pattern: "Pattern",
  finish: "Finish",
  color: "Color",
  size: "Size",
  collection: "Collection",
  brand: "Brand",
  use_case: "Use Case",
};

const CATEGORY_ORDER = ["placement", "pattern", "color", "finish", "size", "use_case", "collection", "brand"];

export default function TileFilters({ filters, data, onChange }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [priceInput, setPriceInput] = useState<[string, string]>(["", ""]);

  const toggleCollapsed = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const toggleValue = (cat: keyof ActiveFilters, val: string) => {
    if (cat === "price_min" || cat === "price_max") return;
    const current = filters[cat] as string[];
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    onChange({ ...filters, [cat]: next });
  };

  const totalActive = Object.entries(filters)
    .filter(([k]) => k !== "price_min" && k !== "price_max")
    .reduce((sum, [, v]) => sum + (v as string[]).length, 0)
    + (filters.price_min != null || filters.price_max != null ? 1 : 0);

  const clearAll = () => {
    onChange(emptyFilters);
    setPriceInput(["", ""]);
  };

  const applyPrice = () => {
    onChange({
      ...filters,
      price_min: priceInput[0] ? Number(priceInput[0]) : null,
      price_max: priceInput[1] ? Number(priceInput[1]) : null,
    });
  };

  const clearPrice = () => {
    onChange({ ...filters, price_min: null, price_max: null });
    setPriceInput(["", ""]);
  };

  const allCategories = [
    ...CATEGORY_ORDER.filter((c) => data.options[c]?.length > 0),
    ...Object.keys(data.options).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <aside className="w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-stone-900">
          Filters {totalActive > 0 && (
            <span className="ml-1 text-xs bg-stone-900 text-white rounded-full px-1.5 py-0.5">{totalActive}</span>
          )}
        </h2>
        {totalActive > 0 && (
          <button onClick={clearAll} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection
        title="Price"
        isCollapsed={collapsed["price"] ?? false}
        onToggle={() => toggleCollapsed("price")}
        activeCount={filters.price_min != null || filters.price_max != null ? 1 : 0}
      >
        <div className="space-y-2">
          {data.priceRange.min != null && (
            <p className="text-xs text-stone-400">
              Catalog: ₹{data.priceRange.min?.toLocaleString("en-IN")} – ₹{data.priceRange.max?.toLocaleString("en-IN")}
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="number" placeholder="Min" value={priceInput[0]}
              onChange={(e) => setPriceInput([e.target.value, priceInput[1]])}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
            <input
              type="number" placeholder="Max" value={priceInput[1]}
              onChange={(e) => setPriceInput([priceInput[0], e.target.value])}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={applyPrice}
              className="flex-1 text-xs bg-stone-900 text-white rounded-lg py-1.5 hover:bg-stone-700 transition-colors">
              Apply
            </button>
            {(filters.price_min != null || filters.price_max != null) && (
              <button onClick={clearPrice}
                className="text-xs text-stone-400 hover:text-stone-700 px-2 transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>
      </FilterSection>

      {/* Dynamic category filters */}
      {allCategories.map((cat) => {
        const opts = data.options[cat];
        if (!opts || opts.length === 0) return null;
        const filterKey = cat as keyof ActiveFilters;
        const activeVals = filterKey !== "price_min" && filterKey !== "price_max"
          ? (filters[filterKey] as string[])
          : [];
        const isColor = cat === "color";

        return (
          <FilterSection
            key={cat}
            title={CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
            isCollapsed={collapsed[cat] ?? false}
            onToggle={() => toggleCollapsed(cat)}
            activeCount={activeVals.length}
            onClear={activeVals.length > 0 ? () => onChange({ ...filters, [cat]: [] }) : undefined}
          >
            {isColor ? (
              <div className="flex flex-wrap gap-2">
                {opts.map((opt) => {
                  const meta = opt.metadata ? JSON.parse(opt.metadata) : {};
                  const active = activeVals.includes(opt.value);
                  return (
                    <button key={opt.id} title={opt.label}
                      onClick={() => toggleValue(filterKey, opt.value)}
                      className={`relative w-7 h-7 rounded-full border-2 transition-all ${
                        active ? "border-stone-900 scale-110" : "border-transparent hover:border-stone-300"
                      }`}
                      style={{ backgroundColor: meta.hex ?? "#ccc" }}
                    >
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke={isDark(meta.hex) ? "#fff" : "#000"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {opts.map((opt) => {
                  const active = activeVals.includes(opt.value);
                  return (
                    <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        active ? "bg-stone-900 border-stone-900" : "border-stone-300 group-hover:border-stone-500"
                      }`}>
                        {active && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <input type="checkbox" checked={active} onChange={() => toggleValue(filterKey, opt.value)} className="sr-only" />
                      <span className={`text-sm transition-colors ${active ? "text-stone-900 font-medium" : "text-stone-600 group-hover:text-stone-900"}`}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </FilterSection>
        );
      })}
    </aside>
  );
}

function FilterSection({
  title, isCollapsed, onToggle, activeCount, onClear, children,
}: {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  activeCount?: number;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-stone-100 py-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onToggle} className="flex items-center gap-1.5 flex-1 text-left">
          <span className="text-sm font-medium text-stone-800">{title}</span>
          {activeCount != null && activeCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-1.5">{activeCount}</span>
          )}
          <svg
            className={`w-3.5 h-3.5 text-stone-400 ml-auto transition-transform ${isCollapsed ? "" : "rotate-180"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {onClear && (
          <button onClick={onClear} className="text-xs text-stone-400 hover:text-stone-700 ml-2 shrink-0 transition-colors">
            Clear
          </button>
        )}
      </div>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
}

function isDark(hex: string) {
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
