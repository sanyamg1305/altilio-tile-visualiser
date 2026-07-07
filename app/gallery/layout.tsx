import NavBar from "@/components/NavBar";

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <NavBar />
      <main className="pt-14">{children}</main>
    </div>
  );
}
