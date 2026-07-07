import Link from "next/link";
import Image from "next/image";

const HERO_TILES = [
  "/tiles/frame-cement.jpg",
  "/tiles/wainscot-leaf.jpg",
  "/tiles/frame-windsor.jpg",
  "/tiles/wainscot-carbon.jpg",
  "/tiles/frame-kota.jpg",
  "/tiles/frame-denim-cream.jpg",
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18" />
      </svg>
    ),
    title: "54 Curated Tiles",
    desc: "Three collections — SyncStone, Frame, and Wainscot — spanning every style from minimalist to classical.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    title: "Present Mode",
    desc: "Full-screen slideshow with tile details. Share collections with clients in a clean, distraction-free view.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
    ),
    title: "Smart Filters",
    desc: "Filter by collection, pattern, finish, color, placement, and price range to find exactly the right tile.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight text-white">Altilio</span>
          <span className="text-xs text-stone-500 font-medium uppercase tracking-widest mt-0.5">Tiles</span>
        </div>
        <Link
          href="/gallery"
          className="px-5 py-2 rounded-full bg-white text-stone-900 text-sm font-medium hover:bg-stone-100 transition-colors"
        >
          Open Catalog →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center relative overflow-hidden">
        {/* Mosaic background */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5 opacity-20 pointer-events-none">
          {HERO_TILES.map((src, i) => (
            <div key={i} className="relative overflow-hidden">
              <Image src={src} alt="" fill className="object-cover" sizes="33vw" />
            </div>
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/40 to-stone-950/90 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-stone-400 text-sm uppercase tracking-[0.2em] font-medium mb-6">
            Mozart Tiles · Catalog Visualizer
          </p>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
            Find the perfect<br />
            <span className="font-semibold">tile for every space</span>
          </h1>
          <p className="text-stone-400 text-lg mb-10 leading-relaxed">
            Browse 54 tiles across SyncStone, Frame, and Wainscot collections.
            Filter, explore room scenes, and present to clients — all in one place.
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-stone-900 rounded-full font-medium text-base hover:bg-stone-100 transition-colors"
          >
            Browse the Catalog
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-stone-800 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-800">
        {FEATURES.map((f) => (
          <div key={f.title} className="px-10 py-10 flex flex-col gap-3">
            <div className="text-stone-400">{f.icon}</div>
            <h3 className="text-white font-semibold text-base">{f.title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 px-8 py-5 flex items-center justify-between">
        <span className="text-stone-600 text-xs">© 2025 Altilio. Internal tool.</span>
        <Link href="/gallery" className="text-stone-500 hover:text-white text-xs transition-colors">
          Open Catalog →
        </Link>
      </footer>
    </div>
  );
}
