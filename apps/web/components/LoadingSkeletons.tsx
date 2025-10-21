/**
 * Loading Skeleton Components
 * 
 * Provides shimmer/skeleton loading states for different content types
 * - Shows users that content is loading
 * - Prevents blank page flash
 * - Improves perceived performance
 */

/**
 * Generic shimmer effect
 */
export function Shimmer() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}

/**
 * Changelog loading skeleton
 */
export function ChangelogSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border p-4">
          {/* Header */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          
          {/* Content lines */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Card/List loading skeleton
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border p-6">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table loading skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-300 dark:bg-gray-600 rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="grid gap-4 mb-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, colIdx) => (
            <div key={colIdx} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Profile/Dashboard skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header with avatar */}
      <div className="flex items-center space-x-6">
        <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
      
      {/* Content sections */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Generic content skeleton
 */
export function ContentSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${100 - (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

