"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FilterOption } from "@/lib/types";

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

type EditingOption = { id: number; label: string; hex?: string };

export default function AdminFiltersPage() {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingOption | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newHex, setNewHex] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOptions = async () => {
    const res = await fetch("/api/filter-options");
    setOptions(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchOptions(); }, []);

  const grouped = options.reduce<Record<string, FilterOption[]>>((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {});

  const allCategories = Object.keys(grouped);
  const knownCategories = Object.keys(CATEGORY_LABELS);
  const customCategories = allCategories.filter((c) => !knownCategories.includes(c));

  const handleDelete = async (id: number) => {
    setDeleting(id);
    await fetch(`/api/filter-options/${id}`, { method: "DELETE" });
    setOptions((prev) => prev.filter((o) => o.id !== id));
    setDeleting(null);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setSaving(true);
    const meta = editing.hex ? JSON.stringify({ hex: editing.hex }) : undefined;
    const res = await fetch(`/api/filter-options/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editing.label, metadata: meta }),
    });
    const updated = await res.json();
    setOptions((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditing(null);
    setSaving(false);
  };

  const handleAdd = async () => {
    if (!newLabel.trim() || !newValue.trim()) return;
    const cat = newCategory === "__custom__" ? customCategory.trim() : newCategory;
    if (!cat) return;
    setSaving(true);
    const meta = newHex ? JSON.stringify({ hex: newHex }) : undefined;
    const slug = newValue.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_×]/g, "");
    const res = await fetch("/api/filter-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, value: slug || newValue, label: newLabel, metadata: meta }),
    });
    if (res.ok) {
      const opt = await res.json();
      setOptions((prev) => [...prev, opt]);
      setNewLabel(""); setNewValue(""); setNewHex(""); setAdding(false);
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setSaving(false);
  };

  const isColor = (cat: string) => cat === "color";

  const BackLink = () => (
    <div className="mb-6">
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-700 flex items-center gap-1 w-fit">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tile Management
      </Link>
    </div>
  );

  if (loading) return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <BackLink />
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-stone-100 rounded-xl" />)}
      </div>
    </div>
  );

  const renderCategory = (cat: string) => (
    <div key={cat} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">
            {CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
          </h3>
          <p className="text-xs text-stone-400 font-mono mt-0.5">category: {cat}</p>
        </div>
        <span className="text-xs text-stone-400">{grouped[cat]?.length ?? 0} options</span>
      </div>
      <div className="p-4">
        <div className={`${isColor(cat) ? "flex flex-wrap gap-3" : "space-y-1"}`}>
          {(grouped[cat] ?? []).map((opt) => {
            const meta = opt.metadata ? JSON.parse(opt.metadata) : {};
            const isEditingThis = editing?.id === opt.id;

            return (
              <div key={opt.id}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-stone-50 transition-colors ${
                  isColor(cat) ? "border border-stone-100 w-fit" : ""
                }`}>
                {isColor(cat) && (
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0"
                    style={{ backgroundColor: isEditingThis ? editing?.hex ?? meta.hex : meta.hex ?? "#ccc" }} />
                )}
                {isEditingThis ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                      className="border border-stone-200 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-stone-400" />
                    {isColor(cat) && (
                      <input type="color" value={editing.hex ?? meta.hex ?? "#cccccc"}
                        onChange={(e) => setEditing({ ...editing, hex: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-stone-200" />
                    )}
                    <button onClick={handleEditSave} disabled={saving}
                      className="text-xs bg-stone-900 text-white px-2.5 py-1 rounded transition-colors hover:bg-stone-700 disabled:opacity-50">
                      Save
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="text-sm text-stone-800">{opt.label}</span>
                      <span className="text-xs text-stone-400 ml-2 font-mono">{opt.value}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing({ id: opt.id, label: opt.label, hex: meta.hex })}
                        className="p-1 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                        title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(opt.id)}
                        disabled={deleting === opt.id}
                        className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete">
                        {deleting === opt.id
                          ? <div className="w-3.5 h-3.5 border border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                          : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        }
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <BackLink />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Filter Options</h1>
          <p className="text-sm text-stone-400 mt-0.5">Manage options available in the gallery filter sidebar</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Option
        </button>
      </div>

      {adding && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-stone-900 mb-4 text-sm">Add New Filter Option</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Category *</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400">
                <option value="">Select category</option>
                {knownCategories.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
                ))}
                {customCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">+ New category…</option>
              </select>
            </div>
            {newCategory === "__custom__" && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">New category name *</label>
                <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. thickness" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Display label *</label>
              <input value={newLabel} onChange={(e) => { setNewLabel(e.target.value); if (!newValue) setNewValue(e.target.value.toLowerCase().replace(/\s+/g,"_")); }}
                placeholder="e.g. Ocean Blue" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Value (slug) *</label>
              <input value={newValue} onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. ocean_blue" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-stone-400" />
            </div>
            {(newCategory === "color" || (newCategory === "__custom__" && customCategory === "color")) && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-stone-600 mb-1">Color (hex)</label>
                  <input value={newHex} onChange={(e) => setNewHex(e.target.value)} placeholder="#RRGGBB"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-stone-400" />
                </div>
                <div className="pt-5">
                  <input type="color" value={newHex || "#cccccc"} onChange={(e) => setNewHex(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200" />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50">
              {saving ? "Adding…" : "Add Option"}
            </button>
            <button onClick={() => { setAdding(false); setNewCategory(""); setNewLabel(""); setNewValue(""); setNewHex(""); }}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm hover:border-stone-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {knownCategories.map((cat) => grouped[cat] ? renderCategory(cat) : null)}
        {customCategories.map((cat) => renderCategory(cat))}
      </div>
    </div>
  );
}
