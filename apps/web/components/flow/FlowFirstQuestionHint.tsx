import { cn } from '@/lib/utils';

/** Micro-copy shown only before the first answer in a flow session. */
export function FlowFirstQuestionHint({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'text-xs sm:text-sm text-subtle leading-snug',
        className
      )}
      role="note"
    >
      No right answers. Just pick what feels true.
    </p>
  );
}
