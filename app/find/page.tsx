"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ── Step definitions ──────────────────────────────────────────────────────────

type Option = {
  value: string;
  label: string;
  desc?: string;
  image?: string;
  color?: string;
};

type Step = {
  key: string;
  title: string;
  subtitle: string;
  multi?: boolean;
  options: Option[];
};

const STEPS: Step[] = [
  {
    key: "use_case",
    title: "Where will the tile go?",
    subtitle: "Choose the space you're designing.",
    multi: true,
    options: [
      { value: "bathroom", label: "Bathroom", desc: "Walls, floors & wet areas", image: "/tiles/wainscot-aqua.jpg" },
      { value: "living_room", label: "Living Room", desc: "Feature walls & open floors", image: "/tiles/frame-cement.jpg" },
      { value: "bedroom", label: "Bedroom", desc: "Accent walls & flooring", image: "/tiles/frame-carbon.jpg" },
      { value: "kitchen", label: "Kitchen", desc: "Backsplash & floor tiles", image: "/tiles/bella-clay.jpg" },
      { value: "lobby", label: "Lobby / Entrance", desc: "Grand foyer statements", image: "/tiles/travertino-natural.jpg" },
      { value: "commercial", label: "Office / Commercial", desc: "High-traffic professional spaces", image: "/tiles/frame-super-white.jpg" },
    ],
  },
  {
    key: "placement",
    title: "Floor, wall, or both?",
    subtitle: "This helps us narrow down what's certified for each surface.",
    options: [
      { value: "floor", label: "Floor only", desc: "Anti-slip rated tiles" },
      { value: "wall", label: "Wall only", desc: "Decorative & panel tiles" },
      { value: "both", label: "Both floor & wall", desc: "Maximum versatility" },
    ],
  },
  {
    key: "pattern",
    title: "What look are you going for?",
    subtitle: "Pick the style closest to your vision.",
    multi: true,
    options: [
      { value: "marble", label: "Marble", desc: "Veined stone luxury", image: "/tiles/nova.jpg" },
      { value: "stone", label: "Natural Stone", desc: "Travertine, limestone & rock", image: "/tiles/travertino-natural.jpg" },
      { value: "concrete", label: "Concrete / Urban", desc: "Raw industrial textures", image: "/tiles/porto-bello.jpg" },
      { value: "frame", label: "Frame Panels", desc: "European moulded wall art", image: "/tiles/frame-mushroom.jpg" },
      { value: "wainscot", label: "Wainscot", desc: "Classic beadboard panelling", image: "/tiles/wainscot-leaf.jpg" },
      { value: "floral", label: "Floral / Botanical", desc: "Decorative accent tiles", image: "/tiles/frame-denim-cream.jpg" },
    ],
  },
  {
    key: "color",
    title: "What colour palette?",
    subtitle: "Pick the tones that fit your space.",
    multi: true,
    options: [
      { value: "white", label: "White", color: "#F5F5F0" },
      { value: "cream", label: "Cream", color: "#EDE8DC" },
      { value: "beige", label: "Beige", color: "#D4C4A8" },
      { value: "grey", label: "Grey", color: "#9E9E9E" },
      { value: "dark_grey", label: "Dark Grey", color: "#5A5A5A" },
      { value: "taupe", label: "Taupe / Brown", color: "#9E8E7E" },
      { value: "pink", label: "Pink / Blush", color: "#F4A7B9" },
      { value: "salmon", label: "Salmon / Terracotta", color: "#E8846A" },
      { value: "sage", label: "Sage Green", color: "#9CAF88" },
      { value: "green", label: "Deep Green", color: "#4A7C59" },
      { value: "aqua", label: "Aqua / Teal", color: "#B2DFD8" },
      { value: "navy", label: "Navy Blue", color: "#4A5C7A" },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

type Selections = Record<string, string[]>;

export default function FindPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Selections>({});

  const current = STEPS[step];
  const selected = selections[current.key] ?? [];

  function toggle(value: string) {
    setSelections((prev) => {
      const cur = prev[current.key] ?? [];
      if (current.multi) {
        return {
          ...prev,
          [current.key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
        };
      }
      return { ...prev, [current.key]: [value] };
    });
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    const params = new URLSearchParams();
    for (const s of STEPS) {
      const vals = selections[s.key] ?? [];
      vals.forEach((v) => params.append(s.key, v));
    }
    router.push(`/gallery?${params.toString()}`);
  }

  const canContinue = selected.length > 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 h-16 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold text-white text-base tracking-tight">Altilio</span>
          <span className="text-xs text-stone-500 font-medium uppercase tracking-widest mt-0.5">Tiles</span>
        </Link>
        <Link href="/gallery" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">
          Skip → Browse all
        </Link>
      </div>

      {/* Progress */}
      <div className="px-8 pt-8 pb-2 max-w-3xl mx-auto w-full">
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-white" : "bg-stone-800"
              }`}
            />
          ))}
        </div>
        <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="text-3xl font-semibold text-white mb-1">{current.title}</h1>
        <p className="text-stone-400 text-sm mb-8">{current.subtitle}</p>
      </div>

      {/* Options */}
      <div className="flex-1 px-8 max-w-3xl mx-auto w-full">
        {current.options[0]?.image ? (
          // Image cards
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {current.options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`relative rounded-xl overflow-hidden aspect-[4/3] text-left transition-all ${
                    isSelected
                      ? "ring-2 ring-white ring-offset-2 ring-offset-stone-950"
                      : "ring-1 ring-stone-800 hover:ring-stone-600"
                  }`}
                >
                  <Image src={opt.image!} alt={opt.label} fill className="object-cover" sizes="300px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm">{opt.label}</p>
                    {opt.desc && <p className="text-white/60 text-xs mt-0.5">{opt.desc}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        ) : current.options[0]?.color ? (
          // Color swatches
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {current.options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-all border ${
                    isSelected
                      ? "border-white bg-stone-800"
                      : "border-stone-800 hover:border-stone-600 bg-stone-900"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full border border-white/10"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className="text-xs text-stone-300 font-medium text-center leading-tight">{opt.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          // Text cards (placement)
          <div className="flex flex-col gap-3">
            {current.options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`w-full text-left px-6 py-5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-white bg-stone-800 text-white"
                      : "border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-600"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-base">{opt.label}</p>
                    {opt.desc && <p className="text-stone-500 text-sm mt-0.5">{opt.desc}</p>}
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="px-8 py-6 max-w-3xl mx-auto w-full flex items-center justify-between mt-6">
        <button
          onClick={back}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            step === 0
              ? "invisible"
              : "text-stone-400 hover:text-white border border-stone-700 hover:border-stone-500"
          }`}
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {current.multi && (
            <span className="text-stone-600 text-xs">
              {selected.length === 0 ? "Select at least one" : `${selected.length} selected`}
            </span>
          )}
          <button
            onClick={next}
            disabled={!canContinue}
            className="px-6 py-2.5 rounded-full bg-white text-stone-900 text-sm font-medium hover:bg-stone-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLast ? "See my tiles →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
