# PareL Performance Optimization Guide (v0.11.1)

## Overview

This guide documents performance optimizations implemented to achieve:
- ⚡ **API latency** < 200ms (median)
- 📦 **Initial bundle size** reduction
- 🚀 **Lighthouse score** > 90

---

## Caching Strategy

### Redis Caching Layer

**File:** `lib/performance/cache.ts`

**TTL Values:**
```typescript
FEED: 30s         // Feed updates
LEADERBOARD: 60s  // Leaderboard rankings
ACTIVITY: 30s     // Activity feed
USER_PROFILE: 120s // User profiles
STATIC_DATA: 300s // Static content
STATS: 60s        // Statistics
```

**Usage:**
```typescript
import { withCache, CACHE_TTL } from "@/lib/performance/cache";

// In API route
export async function GET(req: NextRequest) {
  const cacheKey = getCacheKey("/api/feed", { page: 1, limit: 50 });
  
  const data = await withCache(
    cacheKey,
    async () => {
      // Expensive database query
      return await prisma.feedItem.findMany({ ... });
    },
    { ttl: CACHE_TTL.FEED, tags: ["feed"] }
  );
  
  return NextResponse.json({ data });
}
```

**Cache Invalidation:**
```typescript
import { invalidateByTag } from "@/lib/performance/cache";

// After creating new feed item
await invalidateByTag("feed");
```

---

## Pagination

### Standard Pagination

**File:** `lib/performance/pagination.ts`

**Limits:**
```typescript
DEFAULT: 20       // Default page size
MAX: 100         // Maximum allowed
FEED: 50         // Feed items
LEADERBOARD: 100 // Leaderboard entries
MESSAGES: 30     // Messages
ACTIVITY: 20     // Activity items
```

**Usage:**
```typescript
import { 
  parsePaginationParams,
  createPaginatedResponse,
  getPrismaPagination 
} from "@/lib/performance/pagination";

export async function GET(req: NextRequest) {
  const { page, limit } = parsePaginationParams(req.nextUrl.searchParams);
  
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      ...getPrismaPagination(page, limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.item.count(),
  ]);
  
  return NextResponse.json(
    createPaginatedResponse(items, page, limit, total)
  );
}
```

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Cursor Pagination

For infinite scroll:

```typescript
import { 
  createCursorPaginatedResponse,
  getPrismaCursorPagination 
} from "@/lib/performance/pagination";

const { cursor, limit } = parsePaginationParams(searchParams);

const items = await prisma.item.findMany({
  ...getPrismaCursorPagination(cursor, limit),
  orderBy: { createdAt: "desc" },
});

return NextResponse.json(
  createCursorPaginatedResponse(items, limit)
);
```

---

## Bundle Optimization

### Bundle Analyzer

**Enabled:** Set `ANALYZE=true` environment variable

```bash
ANALYZE=true pnpm build
```

**Output:** `apps/web/.next/analyze/client.html`

### Import Optimization

**Optimized Packages** (in `next.config.js`):
```javascript
optimizePackageImports: [
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-popover',
  'lucide-react',
  'framer-motion',
]
```

**Best Practices:**
```typescript
// ❌ Bad: Imports entire library
import { Button, Dialog, Card } from "@/components/ui";

// ✅ Good: Specific imports
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

// ❌ Bad: Entire icon library
import * as Icons from "lucide-react";

// ✅ Good: Specific icons
import { User, Settings } from "lucide-react";
```

---

## Code Splitting

### Lazy Loading Components

**File:** `lib/performance/lazy-components.tsx`

**Usage:**
```typescript
import { AdminDashboard, LazyBoundary } from "@/lib/performance/lazy-components";

export default function AdminPage() {
  return (
    <LazyBoundary>
      <AdminDashboard />
    </LazyBoundary>
  );
}
```

**Available Lazy Components:**
- `AdminDashboard` - Admin panel (no SSR)
- `FeedItem` - Feed items
- `HeroStats` - Profile stats
- `InventoryModal` - Inventory (no SSR)
- `RechartsBarChart` - Charts (no SSR)
- `RechartsPieChart` - Charts (no SSR)

**Loading States:**
- `LoadingSpinner` - Generic spinner
- `LoadingCard` - Card skeleton
- `LoadingTable` - Table skeleton

### Dynamic Imports

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(
  () => import("@/components/HeavyComponent"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Disable SSR if not needed
  }
);
```

---

## React Optimizations

### Memoization

**File:** `lib/performance/react-optimizations.tsx`

**Memoized Components:**
```typescript
import { memo } from "react";

const ExpensiveItem = memo(function Item({ data }: Props) {
  // Heavy rendering logic
  return <div>{data.name}</div>;
});
```

**Memoized Values:**
```typescript
import { useMemo } from "react";

const sortedUsers = useMemo(
  () => users.sort((a, b) => b.xp - a.xp),
  [users]
);
```

**Memoized Callbacks:**
```typescript
import { useCallback } from "react";

const handleClick = useCallback(() => {
  setCount((c) => c + 1);
}, []);
```

### Custom Hooks

**useSortedData:**
```typescript
import { useSortedData } from "@/lib/performance/react-optimizations";

const sorted = useSortedData(users, (a, b) => b.xp - a.xp);
```

**useFilteredData:**
```typescript
import { useFilteredData } from "@/lib/performance/react-optimizations";

const active = useFilteredData(users, (u) => u.isActive);
```

**usePaginatedData:**
```typescript
import { usePaginatedData } from "@/lib/performance/react-optimizations";

const { items, totalPages, hasNext, hasPrev } = usePaginatedData(
  users,
  page,
  20
);
```

**useDebouncedCallback:**
```typescript
import { useDebouncedCallback } from "@/lib/performance/react-optimizations";

const debouncedSearch = useDebouncedCallback((query: string) => {
  search(query);
}, 300);
```

**useThrottledCallback:**
```typescript
import { useThrottledCallback } from "@/lib/performance/react-optimizations";

const throttledScroll = useThrottledCallback(() => {
  handleScroll();
}, 100);
```

---

## Image Optimization

### Next.js Image Component

```typescript
import Image from "next/image";

<Image
  src="/avatar.png"
  alt="User avatar"
  width={64}
  height={64}
  priority={false} // Set true for above-fold images
  placeholder="blur"
  blurDataURL="data:image/..." // Optional blur placeholder
/>
```

**Formats:** AVIF, WebP (automatic)

**Device Sizes:** 640, 750, 828, 1080, 1200, 1920, 2048, 3840

**Image Sizes:** 16, 32, 48, 64, 96, 128, 256, 384

### Static Asset Caching

**Assets:** 1 year cache
```
Cache-Control: public, max-age=31536000, immutable
```

**Audio (SFX):** 1 week cache
```
Cache-Control: public, max-age=604800, immutable
```

---

## API Performance Best Practices

### 1. Use Caching

```typescript
// Cache expensive queries
const data = await withCache(
  cacheKey,
  () => expensiveQuery(),
  { ttl: CACHE_TTL.FEED }
);
```

### 2. Implement Pagination

```typescript
// Always paginate lists
const { page, limit } = parsePaginationParams(searchParams);
const items = await prisma.item.findMany({
  ...getPrismaPagination(page, limit),
});
```

### 3. Select Only Needed Fields

```typescript
// ❌ Bad: Fetch everything
const user = await prisma.user.findUnique({ where: { id } });

// ✅ Good: Select only needed
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true },
});
```

### 4. Parallel Queries

```typescript
// ❌ Bad: Sequential
const user = await prisma.user.findUnique({ ... });
const posts = await prisma.post.findMany({ ... });

// ✅ Good: Parallel
const [user, posts] = await Promise.all([
  prisma.user.findUnique({ ... }),
  prisma.post.findMany({ ... }),
]);
```

### 5. Use Indexes

```prisma
model User {
  id    String @id
  email String @unique
  name  String
  
  @@index([email])  // Add index for frequent queries
  @@index([name])
}
```

---

## Frontend Performance

### 1. Code Splitting

```typescript
// Split routes
const AdminPage = dynamic(() => import("./admin/page"));

// Split heavy components
const Chart = dynamic(() => import("./Chart"), { ssr: false });
```

### 2. Lazy Load Non-Critical

```typescript
// Load below-fold content lazily
import { LazyBoundary } from "@/lib/performance/lazy-components";

<LazyBoundary>
  <HeavyFooter />
</LazyBoundary>
```

### 3. Optimize Re-renders

```typescript
// Prevent unnecessary re-renders
const MemoizedChild = memo(ChildComponent);

// Stable references
const handleClick = useCallback(() => { }, []);
const computed = useMemo(() => heavy(data), [data]);
```

### 4. Virtual Scrolling

For large lists (1000+ items):

```typescript
import { useVirtualScroll } from "@/lib/performance/react-optimizations";

const { visibleItems, totalHeight, offsetY } = useVirtualScroll(
  items,
  containerHeight,
  itemHeight
);
```

---

## Monitoring

### Performance Markers

```typescript
import { PerformanceMarker } from "@/lib/performance/react-optimizations";

const perf = new PerformanceMarker();

perf.mark("start");
await expensiveOperation();
perf.mark("end");

perf.measure("Operation", "start", "end");
// Output: [Performance] Operation: 125.43ms
```

### Lighthouse Metrics

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

**Run Lighthouse:**
```bash
# Chrome DevTools → Lighthouse tab
# Or
npx lighthouse https://your-app.com
```

### Vercel Analytics

**Install:**
```bash
pnpm add @vercel/analytics
```

**Usage:**
```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Performance Checklist

### API Endpoints

- [ ] Implement pagination (default 20, max 100)
- [ ] Add caching with appropriate TTL
- [ ] Select only needed fields
- [ ] Use parallel queries where possible
- [ ] Add database indexes
- [ ] Implement rate limiting

### Components

- [ ] Use `memo()` for expensive components
- [ ] Implement code splitting for heavy features
- [ ] Add loading states with Suspense
- [ ] Lazy load below-fold content
- [ ] Optimize images with Next.js Image

### Bundle

- [ ] Run bundle analyzer
- [ ] Remove unused dependencies
- [ ] Use specific imports (not barrel exports)
- [ ] Split large pages/routes
- [ ] Enable SWC minification

### Assets

- [ ] Optimize images (AVIF/WebP)
- [ ] Set proper cache headers
- [ ] Compress static files
- [ ] Use CDN for assets (if applicable)

---

## Common Issues & Solutions

### Issue: Large Initial Bundle

**Solution:**
```typescript
// Use dynamic imports
const Heavy = dynamic(() => import("./Heavy"), { ssr: false });
```

### Issue: Slow API Response

**Solution:**
```typescript
// Add caching + pagination
const data = await withCache(
  cacheKey,
  async () => {
    return await prisma.item.findMany({
      ...getPrismaPagination(page, limit),
    });
  },
  { ttl: CACHE_TTL.FEED }
);
```

### Issue: Unnecessary Re-renders

**Solution:**
```typescript
// Use memo + stable refs
const Child = memo(ChildComponent);
const handleClick = useCallback(() => { }, []);
```

### Issue: Slow List Rendering

**Solution:**
```typescript
// Virtual scrolling for 1000+ items
import { useVirtualScroll } from "@/lib/performance/react-optimizations";
```

---

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Last Updated:** v0.11.1 (2025-10-13)











