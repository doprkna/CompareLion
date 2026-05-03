import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isExternalHref,
  isFlowDemoHref,
  type LandingPromo,
} from "@/lib/landing/landingPromos";

const FLOW_CTA_LOADING_LABEL = "Loading your first question...";

const typeRing: Record<LandingPromo["type"], string> = {
  result: "ring-violet-500/20 border-violet-500/25",
  announcement: "ring-accent/25 border-accent/30",
  visual: "ring-blue-500/20 border-blue-500/25",
  link: "ring-border/40 border-border",
};

const baseShell =
  "group block w-full rounded-2xl border-2 bg-card/95 shadow-md backdrop-blur-sm ring-1 overflow-hidden text-left transition-[box-shadow,transform] hover:shadow-lg hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export function LandingPromoCard({
  promo,
  size = "default",
  onFlowDemoNavigate,
  flowNavigateBusyId,
}: {
  promo: LandingPromo;
  size?: "default" | "compact";
  /** When the CTA is `/flow-demo`, call this instead of `<Link>` so loading state can show immediately. */
  onFlowDemoNavigate?: () => void;
  /** Id of the control currently showing navigation loading (e.g. `promo-fallback-hero-right`), or null. */
  flowNavigateBusyId?: string | null;
}) {
  const href = promo.ctaHref?.trim();
  const clickable = Boolean(href);
  const external = href ? isExternalHref(href) : false;
  const flowDemoSourceId = `promo-${promo.id}`;
  const useFlowDemoButton =
    Boolean(href && onFlowDemoNavigate && isFlowDemoHref(href) && !external);
  const isThisFlowLoading = flowNavigateBusyId === flowDemoSourceId;
  const flowNavLocked = flowNavigateBusyId != null;

  const inner = (
    <>
      {promo.imageUrl ? (
        <div className="relative aspect-[16/10] w-full bg-bg border-b border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary promo URLs */}
          <img
            src={promo.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}
      <div
        className={cn(
          "px-4 py-4 sm:px-5",
          size === "compact" ? "py-3 sm:px-4" : "sm:py-5"
        )}
      >
        {promo.eyebrow ? (
          <p
            className={cn(
              "font-semibold uppercase tracking-wide text-accent mb-2",
              size === "compact" ? "text-[10px]" : "text-[11px]"
            )}
          >
            {promo.eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "font-bold text-text leading-snug mb-2",
            size === "compact"
              ? "text-sm sm:text-base"
              : "text-base sm:text-lg mb-3"
          )}
        >
          {promo.title}
        </h2>
        {promo.body ? (
          <p
            className={cn(
              "text-subtle leading-relaxed",
              size === "compact" ? "text-xs sm:text-sm" : "text-sm"
            )}
          >
            {promo.body}
          </p>
        ) : null}
        {promo.lines && promo.lines.length > 0 ? (
          <ul className="space-y-2 list-none p-0 m-0 mt-2">
            {promo.lines.map((line, i) => (
              <li
                key={`${promo.id}-L${i}`}
                className={cn(
                  "text-subtle leading-relaxed pl-3 border-l-2 border-border/80",
                  size === "compact" ? "text-xs sm:text-sm" : "text-sm"
                )}
              >
                {line}
              </li>
            ))}
          </ul>
        ) : null}
        {promo.ctaLabel ? (
          <p
            className={cn(
              "mt-3 flex items-center gap-1.5 font-medium text-accent group-hover:underline",
              size === "compact" ? "text-xs" : "text-xs sm:text-sm",
              useFlowDemoButton && flowNavLocked && !isThisFlowLoading && "opacity-60"
            )}
          >
            {isThisFlowLoading ? (
              <>
                <Loader2
                  className="h-3.5 w-3.5 shrink-0 animate-spin"
                  aria-hidden
                />
                {FLOW_CTA_LOADING_LABEL}
              </>
            ) : (
              <>
                {promo.ctaLabel}
                {clickable ? (
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 opacity-80"
                    aria-hidden
                  />
                ) : null}
              </>
            )}
          </p>
        ) : null}
      </div>
    </>
  );

  const shellClass = cn(baseShell, typeRing[promo.type]);

  if (clickable && href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={shellClass}
        aria-label={promo.title}
      >
        {inner}
      </a>
    );
  }

  if (clickable && href) {
    if (useFlowDemoButton && onFlowDemoNavigate) {
      return (
        <button
          type="button"
          className={cn(shellClass, "text-left cursor-pointer disabled:opacity-70 disabled:pointer-events-none")}
          aria-label={promo.title}
          disabled={flowNavLocked}
          aria-busy={isThisFlowLoading}
          onClick={() => {
            if (flowNavLocked) return;
            onFlowDemoNavigate();
          }}
        >
          {inner}
        </button>
      );
    }
    return (
      <Link href={href} className={shellClass} aria-label={promo.title}>
        {inner}
      </Link>
    );
  }

  return <div className={shellClass}>{inner}</div>;
}
