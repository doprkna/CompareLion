import Link from "next/link";

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg text-text">
      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-20">
        <p className="text-sm font-medium text-accent mb-2">Help</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          Frequently asked questions
        </h1>
        <div className="space-y-8 text-subtle leading-relaxed">
          <section className="rounded-xl border border-border bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-text mb-2">
              What is PareL?
            </h2>
            <p>
              PareL is a social comparison game built around weirdly honest
              questions. You answer, then see how your choices line up with
              everyone else—without the pressure to perform a perfect life
              online.
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-text mb-2">
              Is my data public?
            </h2>
            <p>
              Comparisons use aggregate patterns, not a broadcast of your
              answers. Check the privacy policy for the exact details as the
              product evolves.
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-text mb-2">
              Who is this for?
            </h2>
            <p>
              Anyone who likes personality quizzes, percentiles, and a little
              discomfort with the truth. If you want curated inspiration
              quotes, this is probably not your app.
            </p>
          </section>
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
