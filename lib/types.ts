export type Tile = {
  id: number;
  name: string;
  sku: string | null;
  size: string | null;
  placement: string | null;
  pattern: string | null;
  finish: string | null;
  color: string | null;
  price: number | null;
  price_unit: string;
  use_cases: string | null;
  collection: string | null;
  brand: string | null;
  image_path: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TileInput = Omit<Tile, "id" | "created_at" | "updated_at">;

export type FilterOption = {
  id: number;
  category: string;
  value: string;
  label: string;
  metadata: string | null;
  sort_order: number;
};
