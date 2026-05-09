import Link from "next/link";

const navItems = [
  { href: "/", label: "Bestsellers" },
  { href: "/discover", label: "Flowers" },
  { href: "/trends", label: "Trends" },
  { href: "/community", label: "Community" },
];

const categoryItems = [
  "Birthday",
  "Mother's Day",
  "Peonies",
  "Roses",
  "Tulips",
  "Plants",
  "Cafe Aesthetic",
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#ece2d8] bg-white/95 backdrop-blur">
      <div className="bg-[#fff176] px-4 py-2 text-center text-xs font-bold text-[#211f1d] md:text-sm">
        Bloom & Brew Social: cafe culture, flowers, and community trends in one place
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7c6cf] text-xl font-black text-[#211f1d]">
            ✿
          </span>
          <span>
            <span className="block text-lg font-black leading-5 text-[#211f1d]">
              Bloom & Brew
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#8a7d73]">
              Social
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-[#211f1d] transition hover:text-[#c45572]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="hidden border-t border-[#f1e7dd] bg-[#fffaf6] md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-5 py-3">
          {categoryItems.map((item) => (
            <span
              key={item}
              className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-[#7b6f66]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
