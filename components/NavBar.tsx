"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Gallery" },
  { href: "/admin", label: "Tiles", match: (p: string) => p === "/admin" || p.startsWith("/admin/tiles") },
  { href: "/admin/filters", label: "Filters", match: (p: string) => p.startsWith("/admin/filters") },
];

export default function NavBar() {
  const path = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight text-stone-900">Altilio</span>
          <span className="text-xs text-stone-400 font-medium uppercase tracking-widest mt-0.5">Tiles</span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, match }) => {
            const active = match ? match(path) : path === href;
            return (
              <Link key={href} href={href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
