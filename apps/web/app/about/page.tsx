import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg text-text">
      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-20">
        <p className="text-sm font-medium text-accent mb-2">About</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          CompareLion became PareL
        </h1>
        <div className="space-y-6 text-subtle leading-relaxed">
          <p>
            PareL started as{" "}
            <span className="text-text font-medium">CompareLion</span>: a small
            experiment in comparing real life without pretending everyone is
            optimized, mindful, and crushing it before 6&nbsp;a.m.
          </p>
          <p>
            It is built by one tired parent who enjoys systems a little too
            much and believes most “self-improvement” content would be better
            as a histogram.
          </p>
          <div className="rounded-xl border border-border bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-text mb-2">
              What we optimize for
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Questions that feel human, not clinical</li>
              <li>Comparisons that add context, not shame</li>
              <li>A product small enough to maintain honestly</li>
            </ul>
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
