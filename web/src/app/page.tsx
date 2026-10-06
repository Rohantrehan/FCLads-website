// Temporary placeholder — replaced by the real Home page in Step 5.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center gap-6 px-4 py-16">
      <span className="text-label text-mint">FC Lads // Setup complete</span>
      <h1 className="text-hero">
        Play better. <span className="text-primary">Together.</span>
      </h1>
      <p className="max-w-xl text-lg text-muted">
        Design tokens and fonts are loaded. Pages are built next.
      </p>
      <div className="flex flex-wrap gap-3">
        <span className="bg-iridescent rounded-full px-6 py-3 font-display font-extrabold uppercase text-canvas">
          Iridescent CTA
        </span>
        <span className="glass rounded-lg px-6 py-3 font-display font-bold uppercase">Glass panel</span>
        <span className="tabular rounded-lg bg-surface-high px-6 py-3 text-gold">1,450,000</span>
      </div>
    </main>
  );
}
