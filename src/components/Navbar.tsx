import Link from "next/link";

const navItems = [
  { href: "/", label: "Feed" },
  { href: "/discover", label: "Discover" },
  { href: "/trends", label: "Trends" },
  { href: "/community", label: "Community" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#ece2d8] bg-white/95 backdrop-blur">
      <div className="bg-[#fff176] px-4 py-2 text-center text-xs font-bold text-[#211f1d] md:text-sm">
        Bloom & Brew Social: post, follow, chat, share, and discover cafe-floral culture
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
    </header>
  );
}
