import Link from "next/link";
import { WalletButton } from "./WalletButton";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/browse", label: "Browse" },
  { href: "/licenses", label: "My Licenses" },
  { href: "/earnings", label: "Earnings" },
  { href: "/deploy", label: "Deploy" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--line-soft))] bg-[rgba(248,246,244,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="transition-transform duration-500 group-hover:rotate-[18deg]">
            <Logo size={30} />
          </span>
          <span className="display-title text-[1.35rem] text-ink">Snap&nbsp;Arc</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
