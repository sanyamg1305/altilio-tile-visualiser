"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Tile, TileInput, FilterOption } from "@/lib/types";
import { useRouter } from "next/navigation";

const PRICE_UNITS = [{ value: "per_sqft", label: "per sq ft" }, { value: "per_tile", label: "per tile" }];

type Props = { tile?: Tile };
type OptionsMap = Record<string, FilterOption[]>;

export default function TileForm({ tile }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [optionsMap, setOptionsMap] = useState<OptionsMap>({});

  useEffect(() => {
    fetch("/api/filter-options").then((r) => r.json()).then((opts: FilterOption[]) => {
      const map: OptionsMap = {};
      for (const o of opts) {
        if (!map[o.category]) map[o.category] = [];
        map[o.category].push(o);
      }
      setOptionsMap(map);
    });
  }, []);

  const [form, setForm] = useState<TileInput>({
    name: tile?.name ?? "",
    sku: tile?.sku ?? "",
    size: tile?.size ?? "",
    placement: tile?.placement ?? "",
    pattern: tile?.pattern ?? "",
    finish: tile?.finish ?? "",
    color: tile?.color ?? "",
    price: tile?.price ?? null,
    price_unit: tile?.price_unit ?? "per_sqft",
    use_cases: tile?.use_cases ?? "",
    collection: tile?.collection ?? "",
    brand: tile?.brand ?? "",
    image_path: tile?.image_path ?? "",
    description: tile?.description ?? "",
  });

  const set = (key: keyof TileInput, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const toggleUseCase = (val: string) => {
    const current = form.use_cases ? form.use_cases.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const updated = current.includes(val) ? current.filter((u) => u !== val) : [...current, val];
    set("use_cases", updated.join(", "));
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.path) set("image_path", data.path);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const url = tile ? `/api/tiles/${tile.id}` : "/api/tiles";
      const res = await fetch(url, {
        method: tile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const opts = (cat: string) => optionsMap[cat] ?? [];
  const useCaseList = form.use_cases ? form.use_cases.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const colorOpts = opts("color");
  const selectedColor = colorOpts.find((c) => c.value === form.color);
  const selectedColorHex = selectedColor?.metadata ? JSON.parse(selectedColor.metadata).hex : null;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <Section title="Image">
        <div
          className="relative border-2 border-dashed border-stone-200 rounded-xl overflow-hidden cursor-pointer hover:border-stone-400 transition-colors group"
          style={{ aspectRatio: "16/9" }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
        >
          {form.image_path ? (
            <>
              <Image src={form.image_path} alt="Tile" fill className="object-cover" sizes="672px" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-sm font-medium">Change image</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
                  <span className="text-sm">Uploading…</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Click or drag to upload image</span>
                  <span className="text-xs text-stone-300 mt-1">PNG, JPG, WebP</span>
                </>
              )}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
      </Section>

      <Section title="Basic Info">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Carrara White 600" />
          </div>
          <div>
            <Label>SKU</Label>
            <Input value={form.sku ?? ""} onChange={(v) => set("sku", v)} placeholder="e.g. CW-600-M" />
          </div>
          <div>
            <Label>Brand</Label>
            <Input value={form.brand ?? ""} onChange={(v) => set("brand", v)} placeholder="e.g. Somany" />
          </div>
          <div>
            <Label>Collection</Label>
            <Combobox value={form.collection ?? ""} onChange={(v) => set("collection", v)}
              options={opts("collection").map((o) => ({ value: o.value, label: o.label }))}
              placeholder="Select or type collection" />
          </div>
          <div>
            <Label>Price</Label>
            <div className="flex gap-2">
              <input type="number" min="0" value={form.price ?? ""}
                onChange={(e) => set("price", e.target.value ? Number(e.target.value) : null)}
                placeholder="0.00" className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
              <select value={form.price_unit} onChange={(e) => set("price_unit", e.target.value)}
                className="border border-stone-200 rounded-lg px-2 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400">
                {PRICE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Tile Details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Size</Label>
            <Combobox value={form.size ?? ""} onChange={(v) => set("size", v)}
              options={opts("size").map((o) => ({ value: o.value, label: o.label }))}
              placeholder="e.g. 600×600 mm" />
          </div>
          <div>
            <Label>Placement</Label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {opts("placement").map((o) => (
                <button key={o.id} type="button" onClick={() => set("placement", form.placement === o.value ? "" : o.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.placement === o.value ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 text-stone-600 hover:border-stone-400"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Pattern</Label>
            <select value={form.pattern ?? ""} onChange={(e) => set("pattern", e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400">
              <option value="">Select pattern</option>
              {opts("pattern").map((o) => <option key={o.id} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Finish</Label>
            <select value={form.finish ?? ""} onChange={(e) => set("finish", e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400">
              <option value="">Select finish</option>
              {opts("finish").map((o) => <option key={o.id} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Color">
        <div className="flex flex-wrap gap-3">
          {colorOpts.map((o) => {
            const meta = o.metadata ? JSON.parse(o.metadata) : {};
            const active = form.color === o.value;
            return (
              <button key={o.id} type="button" onClick={() => set("color", active ? "" : o.value)}
                title={o.label}
                className={`flex flex-col items-center gap-1.5 group`}>
                <span className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${active ? "border-stone-900 scale-110" : "border-transparent group-hover:border-stone-300"}`}
                  style={{ backgroundColor: meta.hex ?? "#ccc" }}>
                  {active && (
                    <svg className="w-4 h-4" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={isDark(meta.hex) ? "#fff" : "#000"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className={`text-xs transition-colors ${active ? "text-stone-900 font-medium" : "text-stone-500"}`}>{o.label}</span>
              </button>
            );
          })}
          {selectedColorHex && (
            <div className="ml-3 flex items-center gap-2 text-xs text-stone-500">
              Selected: <span className="font-medium text-stone-800">{selectedColor?.label}</span>
            </div>
          )}
        </div>
      </Section>

      <Section title="Use Cases">
        <div className="flex flex-wrap gap-2">
          {opts("use_case").map((o) => (
            <button key={o.id} type="button" onClick={() => toggleUseCase(o.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${useCaseList.includes(o.value) ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 text-stone-600 hover:border-stone-400"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Description">
        <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
          rows={3} placeholder="Additional details about this tile…"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" />
      </Section>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {tile ? "Save Changes" : "Add Tile"}
        </button>
        <button type="button" onClick={() => router.push("/admin")}
          className="px-6 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:border-stone-400 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-stone-700 mb-1.5">{children}</label>;
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400" />
  );
}

function Combobox({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const matched = options.find((o) => o.value === value);
  return (
    <div className="space-y-1.5">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400">
        <option value="">— Select —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {!matched && (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Or type a custom value"}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400" />
      )}
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
