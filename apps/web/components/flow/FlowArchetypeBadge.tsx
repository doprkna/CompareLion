"use client";

interface FlowArchetypeBadgeProps {
  label: string;
  hint?: string;
}

export function FlowArchetypeBadge({
  label,
  hint = 'Early archetype label based on your answer pattern. Placeholder logic for now.',
}: FlowArchetypeBadgeProps) {
  return (
    <div
      className="inline-flex items-center rounded-full border border-border/70 bg-card/70 px-3 py-1 text-sm text-text/90"
      title={hint}
      tabIndex={0}
      aria-label={`Archetype hint: ${hint}`}
    >
      You are: <span className="ml-1 font-medium text-text">{label}</span>
    </div>
  );
}
