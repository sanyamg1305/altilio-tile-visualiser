import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Altilio — Tile Catalog",
  description: "Tile presentation and catalog platform by Altilio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50">
        <NavBar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
