# PareL UI Design System

Unified design system for consistent styling across the application.

## Design Tokens

### Colors

#### Semantic Colors
```typescript
bg: '#0f172a'      // Main background
card: '#1e293b'    // Card backgrounds
text: '#f1f5f9'    // Primary text
subtle: '#94a3b8'  // Secondary text
border: '#334155'  // Borders and dividers
```

#### Variant Colors
```typescript
primary: '#3b82f6'     // Primary actions (blue)
success: '#16a34a'     // Success states (green)
warning: '#ea580c'     // Warning states (orange)
destructive: '#dc2626' // Destructive actions (red)
accent: '#3b82f6'      // Accent highlights (blue)
muted: '#334155'       // Muted elements (gray)
```

### Spacing Scale
```typescript
xs: 0.5rem   // 8px  - Tight spacing
sm: 0.75rem  // 12px - Small padding
base: 1rem   // 16px - Standard spacing
md: 1.5rem   // 24px - Medium padding
lg: 2rem     // 32px - Large spacing
xl: 3rem     // 48px - Extra large
2xl: 4rem    // 64px - Section spacing
```

### Border Radius
```typescript
sm: 0.25rem   // 4px  - Small elements
base: 0.5rem  // 8px  - Default
md: 0.75rem   // 12px - Medium
lg: 1rem      // 16px - Cards
xl: 1.5rem    // 24px - Large cards
2xl: 2rem     // 32px - Modals
full: 9999px  // Circular/pills
```

### Shadows
```typescript
sm: subtle depth          // Hover states
base: standard elevation  // Cards
md: medium elevation      // Dropdowns
lg: high elevation        // Modals
xl: maximum elevation     // Popovers
2xl: dramatic depth       // Overlays
glow: blue accent glow    // Active states
glow-accent: dynamic glow // Theme-aware
```

## Component Guidelines

### Button
```tsx
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Delete</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card
```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Badge
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
```

### Input
```tsx
<Input 
  placeholder="Enter text" 
  className="bg-bg border-border text-text"
/>
```

## Usage Examples

### Standard Card Layout
```tsx
<Card className="bg-card border-border text-text">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-accent" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content with consistent spacing */}
  </CardContent>
</Card>
```

### Button Group
```tsx
<div className="flex gap-2">
  <Button className="flex-1">Primary</Button>
  <Button variant="outline" className="flex-1">Secondary</Button>
</div>
```

### Form Field
```tsx
<div className="space-y-2">
  <label className="text-sm text-subtle">Field Label</label>
  <Input className="bg-bg border-border text-text" />
  <p className="text-xs text-muted">Helper text</p>
</div>
```

## Best Practices

1. **Consistent Spacing**
   - Use `space-y-4` for vertical stacks
   - Use `gap-4` for flex/grid layouts
   - Use `p-4` or `p-6` for card padding

2. **Color Hierarchy**
   - Primary text: `text-text`
   - Secondary text: `text-subtle`
   - Tertiary text: `text-muted`
   - Accents: `text-accent`

3. **Border Consistency**
   - Default borders: `border-border`
   - Accent borders: `border-accent`
   - Always use `border-2` for prominent borders

4. **Shadows**
   - Cards: `shadow-base` or no shadow
   - Modals: `shadow-xl`
   - Hover states: `hover:shadow-lg`
   - Active elements: `shadow-glow`

5. **Responsive Design**
   - Mobile-first approach
   - Use `md:` and `lg:` breakpoints
   - Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## Component Locations

All UI components are in:
- `/components/ui/` - Core shadcn/ui components
- `/components/` - Custom application components

Import pattern:
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

## Migration Guide

Old patterns → New patterns:

```tsx
// Old
className="p-2 rounded-lg"

// New
className="p-sm rounded-lg"

// Old
className="shadow-md"

// New
className="shadow-md" // (same, but now documented)

// Old
className="bg-zinc-900 text-white"

// New
className="bg-card text-text"
```











