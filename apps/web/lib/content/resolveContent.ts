import { CONTENT_REGISTRY } from "./contentRegistry";
import type { ContentEntry, ContentKey } from "./contentTypes";

type ResolveContentOptions = {
  locale?: string;
  context?: Record<string, string>;
};

export function resolveContent(
  key: ContentKey,
  fallback = "",
  options?: ResolveContentOptions
): string {
  // Phase 2: load DB overrides before static fallback.
  const candidates = CONTENT_REGISTRY.filter((entry) => {
    if (entry.key !== key) return false;
    if (entry.active === false) return false;
    if (options?.locale && entry.locale && entry.locale !== options.locale) return false;
    return true;
  });

  if (candidates.length === 0) return fallback;

  const selected = [...candidates].sort((a: ContentEntry, b: ContentEntry) => {
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    return pb - pa;
  })[0];

  return selected?.value ?? fallback;
}

