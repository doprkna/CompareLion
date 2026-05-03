import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg text-text">
      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-20">
        <p className="text-sm font-medium text-accent mb-2">Pricing</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          Free first
        </h1>
        <div className="space-y-6 text-subtle leading-relaxed">
          <p>
            The core idea is simple: basic comparisons stay free. You should be
            able to answer questions, see how you stack up, and bounce without
            hitting a paywall on day one.
          </p>
          <div className="rounded-xl border border-border bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-text mb-2">Today</h2>
            <p>
              During alpha and early testing, everything in the app that exists
              is included. No tiers, no upsell flows—just honest usage feedback.
            </p>
          </div>
          <div className="rounded-xl border border-accent/25 bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-text mb-2">Later</h2>
            <p>
              If PareL grows up, there may be optional paid extras: deeper
              breakdowns, more question packs, or conveniences. Nothing is
              finalized; when it is, it will live on this page in plain language.
            </p>
          </div>
        </div>
        <p className="mt-10 text-sm">
          <Link
            href="/landing"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            ← Back to landing
          </Link>
        </p>
      </div>
    </div>
  );
}
