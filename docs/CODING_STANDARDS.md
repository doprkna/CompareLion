# PareL Coding Standards (v0.11.0)

## Overview

This document defines the coding standards and conventions for the PareL project to ensure consistency, maintainability, and quality.

---

## Naming Conventions

### Files & Directories

| Type | Convention | Example | Location |
|------|------------|---------|----------|
| **Components** | PascalCase | `UserProfile.tsx` | `/components`, `/app/*/components` |
| **Routes** | kebab-case | `user-profile/` | `/app/*` |
| **Utilities** | camelCase | `formatDate.ts` | `/lib/*` |
| **Hooks** | useCamelCase | `useAuth.ts` | `/lib/hooks` |
| **Types** | PascalCase | `UserProfile.ts` | `/types` |
| **API Routes** | kebab-case | `/api/user-profile` | `/app/api/*` |
| **Models** | PascalCase | `UserProfile` | `schema.prisma` |

### Variables & Functions

```typescript
// Variables: camelCase
const userId = "123";
const userProfile = fetchUser();

// Functions: camelCase
function calculateXp(level: number): number { }

// Components: PascalCase
function UserProfile() { }

// Types/Interfaces: PascalCase
interface UserData { }
type UserId = string;

// Constants: UPPER_SNAKE_CASE
const MAX_LEVEL = 100;
const API_BASE_URL = "https://api.example.com";

// Private variables: _camelCase (prefix underscore)
const _internalState = {};
```

---

## TypeScript Standards

### Strict Mode (Enforced)

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

### Type Annotations

```typescript
// ✅ Good: Explicit return types for functions
function getUserXp(userId: string): number {
  return 100;
}

// ✅ Good: Type parameters
async function fetchData<T>(url: string): Promise<T> {
  // ...
}

// ❌ Bad: Implicit any
function processData(data) { }

// ✅ Good: Proper typing
function processData(data: UserData): ProcessedData { }
```

### Null Safety

```typescript
// ✅ Good: Handle nulls explicitly
function getUser(id: string): User | null {
  return user ?? null;
}

const user = getUser("123");
if (user) {
  console.log(user.name); // Safe access
}

// ✅ Good: Optional chaining
const userName = user?.profile?.name;

// ✅ Good: Nullish coalescing
const displayName = userName ?? "Anonymous";
```

---

## Code Organization

### Directory Structure

```
apps/web/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (kebab-case)
│   ├── (auth)/            # Route groups
│   └── [dynamic]/         # Dynamic routes
├── components/            # Shared components (PascalCase)
│   ├── ui/               # shadcn/ui components
│   └── feature/          # Feature-specific components
├── lib/                   # Utilities and business logic
│   ├── hooks/            # Custom hooks (useCamelCase)
│   ├── utils/            # Helper functions (camelCase)
│   └── services/         # Business logic services
├── data/                  # Static data and configs (JSON)
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

### Import Organization

```typescript
// 1. External dependencies
import { useState } from "react";
import { motion } from "framer-motion";

// 2. Internal absolute imports
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";

// 3. Relative imports
import { formatDate } from "../utils/date";
import type { User } from "./types";

// 4. Styles (if any)
import styles from "./Component.module.css";
```

---

## React/Next.js Standards

### Component Structure

```typescript
'use client'; // If needed

import { useState } from "react";
import type { ComponentProps } from "./types";

// Props interface
interface UserProfileProps {
  userId: string;
  showBadges?: boolean;
}

// Component
export default function UserProfile({ userId, showBadges = true }: UserProfileProps) {
  // 1. Hooks
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, [userId]);
  
  // 3. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 4. Render helpers
  const renderBadges = () => {
    // ...
  };
  
  // 5. Early returns
  if (isLoading) return <LoadingSpinner />;
  
  // 6. Main render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Server vs Client Components

```typescript
// ✅ Server Component (default)
// app/profile/page.tsx
export default async function ProfilePage() {
  const user = await fetchUser();
  return <ProfileView user={user} />;
}

// ✅ Client Component (interactive)
// components/ProfileView.tsx
'use client';

export default function ProfileView({ user }: Props) {
  const [expanded, setExpanded] = useState(false);
  return <div onClick={() => setExpanded(!expanded)}>...</div>;
}
```

---

## API Route Standards

### File Structure

```typescript
// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // ...
}
```

### Response Format

```typescript
// ✅ Success
return NextResponse.json({ 
  data: result,
  meta: { timestamp: Date.now() }
});

// ✅ Error
return NextResponse.json({ 
  error: "User not found",
  code: "USER_NOT_FOUND"
}, { status: 404 });

// ✅ Validation Error
return NextResponse.json({
  error: "Validation failed",
  details: validationErrors
}, { status: 400 });
```

---

## Database Standards

### Prisma Schema

```prisma
// ✅ Model naming: PascalCase
model UserProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  
  // Fields: camelCase
  displayName String?
  bio         String?
  
  // Relations: camelCase
  user        User     @relation(fields: [userId], references: [id])
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Indexes
  @@index([userId])
  @@map("user_profiles") // Table name: snake_case
}
```

### Query Patterns

```typescript
// ✅ Good: Type-safe queries
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    profile: {
      select: { bio: true }
    }
  }
});

// ✅ Good: Use transactions for multi-step operations
await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.activity.create({ ... })
]);

// ✅ Good: Handle not found
const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new Error("User not found");
}
```

---

## Error Handling

### Client-Side

```typescript
// ✅ Good: Try-catch with proper error handling
async function fetchUserData() {
  try {
    const response = await fetch("/api/user");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user:", error);
    toast.error("Failed to load user data");
    return null;
  }
}
```

### Server-Side

```typescript
// ✅ Good: Structured error responses
export async function GET(req: NextRequest) {
  try {
    // ...
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

## Comments & Documentation

### JSDoc Comments

```typescript
/**
 * Calculate user XP based on completed actions
 * 
 * @param userId - The user's unique identifier
 * @param actions - Array of completed action types
 * @returns Total XP earned
 * 
 * @example
 * const xp = calculateXp("user123", ["answer", "challenge"]);
 */
function calculateXp(userId: string, actions: string[]): number {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ Good: Explain WHY, not WHAT
// Using exponential backoff to prevent API rate limiting
const delay = Math.pow(2, retryCount) * 1000;

// ❌ Bad: Stating the obvious
// Increment counter by 1
counter++;

// ✅ Good: Explain complex logic
// Convert karma to tier: -100→0 = Evil, 0→100 = Good, 100+ = Saint
const karmaTier = karma < 0 ? "Evil" : karma > 100 ? "Saint" : "Good";
```

---

## Testing Standards

### Unit Tests

```typescript
// ✅ Good: Descriptive test names
describe("calculateXp", () => {
  it("should return 0 for empty actions", () => {
    expect(calculateXp("user123", [])).toBe(0);
  });
  
  it("should sum XP from multiple actions", () => {
    expect(calculateXp("user123", ["answer", "challenge"])).toBe(60);
  });
  
  it("should apply level multiplier correctly", () => {
    expect(calculateXp("user123", ["answer"], 5)).toBe(100);
  });
});
```

---

## Performance Best Practices

### React Optimization

```typescript
// ✅ Good: Memoize expensive calculations
const sortedUsers = useMemo(
  () => users.sort((a, b) => b.xp - a.xp),
  [users]
);

// ✅ Good: Memoize callbacks
const handleClick = useCallback(() => {
  setCount((c) => c + 1);
}, []);

// ✅ Good: Split components
function ExpensiveList() {
  return items.map((item) => <ExpensiveItem key={item.id} item={item} />);
}

const ExpensiveItem = memo(function ExpensiveItem({ item }: Props) {
  // Heavy rendering logic
});
```

---

## Security Best Practices

```typescript
// ✅ Always validate user input
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// ✅ Sanitize user content
import DOMPurify from "isomorphic-dompurify";
const clean = DOMPurify.sanitize(userInput);

// ✅ Use environment variables for secrets
const apiKey = process.env.API_KEY;

// ❌ Never expose secrets
const apiKey = "sk-1234..."; // BAD!
```

---

## Git Commit Standards

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
perf: Performance improvements
test: Add/update tests
chore: Build/tooling changes

# Examples:
feat(auth): Add OAuth login support
fix(profile): Fix avatar upload validation
docs(readme): Update setup instructions
refactor(api): Extract user service logic
```

---

## Placeholder Code Standards

For features not yet implemented:

```typescript
/**
 * PLACEHOLDER: User archetype detection
 * 
 * This function will use ML to detect user personality
 * based on answer patterns.
 * 
 * @todo Implement ML model integration
 * @todo Add caching layer
 * @version 0.12.0 (planned)
 */
export function detectArchetype(userId: string): string {
  console.log(`[Archetype] PLACEHOLDER: Would detect for user ${userId}`);
  return "Adventurer"; // Default placeholder
}
```

---

## Audit Scripts

Run these regularly:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Structure audit
pnpm audit:structure
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [React Performance](https://react.dev/learn/render-and-commit)

---

**Last Updated:** v0.11.0 (2025-10-13)










