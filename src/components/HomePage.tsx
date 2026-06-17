import Link from "next/link";

export function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
            Powered by Arc Testnet
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
            License photos with{" "}
            <span className="gradient-text">Snap Arc</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Snap Arc is a micro-marketplace for photographers. List photos, set a price from
            $0.10–$0.50 USDC, and receive payments instantly. Buyers get a license NFT as proof
            of rights.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="w-full rounded-xl bg-indigo-600 px-8 py-4 text-center font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30 sm:w-auto"
            >
              Upload a Photo
            </Link>
            <Link
              href="/browse"
              className="w-full rounded-xl border border-slate-300 bg-white px-8 py-4 text-center font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              Browse Licenses
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Direct Payments",
              body: "No stock-platform fees. Payments go straight to the photographer's wallet.",
            },
            {
              title: "License NFT",
              body: "Every purchase mints an ERC-721 license token with on-chain metadata.",
            },
            {
              title: "Transparent Agents",
              body: "Built-in buyer and royalty agents demonstrate real market activity.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
            >
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
