import Link from "next/link";
import { AuraBlob, Waveform } from "./AuraBlob";

// License-param pills shown around the captured-light blob.
const params = [
  { value: "$0.10–$0.50", sub: "PRICE / USDC" },
  { value: "0.90", sub: "DENSITY / EDITION" },
  { value: "65%", sub: "BLOOM / RIGHTS" },
  { value: "ERC-721", sub: "MINT / LICENSE" },
];

export function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* ===== HERO: the captured-light stage ===== */}
      <section className="relative mx-auto max-w-6xl px-5 pb-28 pt-16 sm:pt-24">
        <div className="flex flex-col items-center text-center">
          <span className="label-mono fade-rise">Arc Testnet // Direct Photo Licensing</span>

          {/* Blob centerpiece */}
          <div className="relative mt-10 flex items-center justify-center fade-rise" style={{ animationDelay: "0.05s" }}>
            <AuraBlob size={340} />

            {/* floating param pills around the blob (md+) */}
            <div className="pointer-events-none absolute inset-0 hidden md:block">
              <div className="pointer-events-auto absolute -left-24 top-10">
                <Pill {...params[0]} />
              </div>
              <div className="pointer-events-auto absolute -right-20 top-20">
                <Pill {...params[1]} />
              </div>
              <div className="pointer-events-auto absolute -left-16 bottom-16">
                <Pill {...params[2]} />
              </div>
              <div className="pointer-events-auto absolute -right-24 bottom-8">
                <Pill {...params[3]} />
              </div>
            </div>
          </div>

          <h1 className="display-title mt-12 max-w-3xl text-balance text-5xl sm:text-7xl fade-rise" style={{ animationDelay: "0.1s" }}>
            Capturing light,
            <br />
            <span className="gradient-text italic">licensed direct.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base text-ink-soft fade-rise" style={{ animationDelay: "0.15s" }}>
            Snap&nbsp;Arc is a micro-marketplace for photographers. Capture the essence of an image,
            set a license price from $0.10–$0.50 USDC, and get paid instantly — direct to your
            wallet. Every buyer receives a license NFT as proof of rights.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 fade-rise sm:flex-row" style={{ animationDelay: "0.2s" }}>
            <Link href="/upload" className="pill-primary">
              Capture &amp; License
            </Link>
            <Link href="/browse" className="pill-ghost">
              Browse the gallery
            </Link>
          </div>

          {/* param pills, stacked, for small screens */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:hidden">
            {params.map((p) => (
              <Pill key={p.sub} {...p} />
            ))}
          </div>

          <div className="mt-12 flex items-center gap-3 fade-rise" style={{ animationDelay: "0.25s" }}>
            <Waveform bars={11} />
            <span className="label-mono">Exposure // Live</span>
          </div>
        </div>
      </section>

      {/* ===== Three principles, as soft cards ===== */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              k: "01",
              title: "Direct payments",
              body: "No stock-platform fees. License fees go straight to the photographer's wallet the moment a frame is acquired.",
            },
            {
              k: "02",
              title: "License as NFT",
              body: "Every purchase mints an ERC-721 license token with on-chain metadata — a permanent record of rights.",
            },
            {
              k: "03",
              title: "Autonomous agents",
              body: "Built-in buyer and royalty agents demonstrate real, living market activity on Arc Testnet.",
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="surface fade-rise p-7"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <span className="label-mono">{card.k}</span>
              <h3 className="display-title mt-3 text-2xl text-ink">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Session card (bottom-left) + mono footer ===== */}
      <div className="pointer-events-none fixed bottom-5 left-5 z-40 hidden lg:block">
        <div className="surface pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3">
          <AuraBlob size={42} />
          <div>
            <p className="label-mono">Session // Capture</p>
            <p className="font-mono text-xs text-ink-soft">aperture f/1.8 · iso 100</p>
          </div>
        </div>
      </div>

      <footer className="border-t border-[rgb(var(--line-soft))] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 sm:flex-row">
          <span className="label-mono">Snap Arc // Arc Testnet</span>
          <span className="label-mono">Encoding // Lossless</span>
        </div>
      </footer>
    </main>
  );
}

function Pill({ value, sub }: { value: string; sub: string }) {
  return (
    <div className="pill">
      <span className="pill-value">{value}</span>
      <span className="label-mono">{sub}</span>
    </div>
  );
}
