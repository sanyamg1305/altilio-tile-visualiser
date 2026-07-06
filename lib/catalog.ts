import path from "path";
import fs from "fs";
import type { Tile, FilterOption } from "./types";

function readJson<T>(filename: string): T[] {
  const filePath = path.join(process.cwd(), "data", filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
  } catch {
    return [];
  }
}

export function getAllTiles(): Tile[] {
  return readJson<Tile>("tiles.json");
}

export function getTileById(id: number): Tile | undefined {
  return getAllTiles().find((t) => t.id === id);
}

export function queryTiles(params: URLSearchParams): Tile[] {
  let tiles = getAllTiles();

  const multiFilter = (key: string, field: keyof Tile) => {
    const vals = params.getAll(key).flatMap((v) => v.split(",")).filter(Boolean);
    if (vals.length > 0) {
      tiles = tiles.filter((t) => vals.includes(String(t[field] ?? "")));
    }
  };

  multiFilter("placement", "placement");
  multiFilter("pattern", "pattern");
  multiFilter("finish", "finish");
  multiFilter("color", "color");
  multiFilter("size", "size");
  multiFilter("collection", "collection");
  multiFilter("brand", "brand");

  const useCases = params.getAll("use_case").flatMap((v) => v.split(",")).filter(Boolean);
  if (useCases.length > 0) {
    tiles = tiles.filter((t) =>
      useCases.some((uc) => (t.use_cases ?? "").includes(uc))
    );
  }

  const priceMin = params.get("price_min");
  const priceMax = params.get("price_max");
  if (priceMin) tiles = tiles.filter((t) => (t.price ?? 0) >= Number(priceMin));
  if (priceMax) tiles = tiles.filter((t) => (t.price ?? 0) <= Number(priceMax));

  return tiles;
}

export function getAllFilterOptions(): FilterOption[] {
  return readJson<FilterOption>("filter-options.json");
}
