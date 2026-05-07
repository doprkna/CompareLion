"use client";

interface FlowShareCardProps {
  hookLine: string;
  insightLine: string;
}

export function FlowShareCard({ hookLine, insightLine }: FlowShareCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/80 px-5 py-5 sm:px-6 sm:py-6 shadow-sm my-2">
      <div className="text-center space-y-3">
        <p className="text-base sm:text-lg font-semibold text-text leading-tight">{hookLine}</p>
        <p className="text-sm sm:text-base text-text/90 leading-snug">{insightLine}</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-subtle pt-2">PareL</p>
      </div>
    </div>
  );
}
