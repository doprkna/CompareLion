# PareL Design Tokens & UI System (v0.11.4)

## Overview

Comprehensive design system with tokens for consistency, accessibility (WCAG AA), and performance optimization.

---

## Color Tokens

### Background Colors

```typescript
bg-DEFAULT       #0a0f1e    // Darker base for better contrast
bg-elevated      #1e293b    // Cards and elevated surfaces
bg-muted         #0f172a    // Subtle backgrounds
```

**Usage:**
```tsx
<div className="bg-bg">Base background</div>
<div className="bg-bg-elevated">Card surface</div>
<div className="bg-bg-muted">Subtle panel</div>
```

### Text Colors

```typescript
text-DEFAULT     #f8fafc    // High contrast white (WCAG AAA)
text-secondary   #cbd5e1    // Medium contrast (WCAG AA)
text-muted       #94a3b8    // Low contrast
text-disabled    #64748b    // Disabled state
```

**Usage:**
```tsx
<h1 className="text-text">Heading</h1>
<p className="text-text-secondary">Body text</p>
<span className="text-text-muted">Caption</span>
<button disabled className="text-text-disabled">Disabled</button>
```

**WCAG Contrast Ratios:**
- `text-DEFAULT` on `bg-DEFAULT`: 19.2:1 (AAA)
- `text-secondary` on `bg-DEFAULT`: 12.8:1 (AAA)
- `text-muted` on `bg-DEFAULT`: 7.5:1 (AA)

### Border Colors

```typescript
border-DEFAULT   #334155    // Standard borders
border-light     #475569    // Lighter borders
border-heavy     #1e293b    // Darker borders
```

**Usage:**
```tsx
<div className="border border-border">Standard border</div>
<div className="border border-border-light">Light border</div>
<div className="border border-border-heavy">Heavy border</div>
```

### Semantic Colors

```typescript
// Primary (Blue)
primary-DEFAULT  #3b82f6    // WCAG AA on dark (4.8:1)
primary-hover    #2563eb
primary-foreground #ffffff

// Success (Green)
success-DEFAULT  #22c55e    // Brighter for contrast
success-hover    #16a34a
success-foreground #ffffff

// Warning (Orange)
warning-DEFAULT  #f59e0b    // Brighter for contrast
warning-hover    #d97706
warning-foreground #000000  // Black text for contrast

// Destructive (Red)
destructive-DEFAULT #ef4444  // Brighter for contrast
destructive-hover   #dc2626
destructive-foreground #ffffff

// Accent (Blue)
accent-DEFAULT   #3b82f6
accent-hover     #2563eb
accent-foreground #ffffff
```

**Usage:**
```tsx
<button className="bg-primary hover:bg-primary-hover text-primary-foreground">
  Primary
</button>

<button className="bg-success hover:bg-success-hover text-success-foreground">
  Success
</button>

<button className="bg-warning hover:bg-warning-hover text-warning-foreground">
  Warning
</button>

<button className="bg-destructive hover:bg-destructive-hover text-destructive-foreground">
  Delete
</button>
```

---

## Spacing Tokens

```typescript
xs    0.5rem    8px
sm    0.75rem   12px
base  1rem      16px
md    1.5rem    24px
lg    2rem      32px
xl    3rem      48px
2xl   4rem      64px
3xl   6rem      96px
```

**Usage:**
```tsx
<div className="p-base">Padding 16px</div>
<div className="m-md">Margin 24px</div>
<div className="gap-sm">Gap 12px</div>
<div className="space-y-lg">Vertical spacing 32px</div>
```

**Scale:**
```
xs  → sm  → base → md  → lg  → xl  → 2xl → 3xl
8px → 12px → 16px → 24px → 32px → 48px → 64px → 96px
```

---

## Border Radius Tokens

```typescript
xs    0.125rem  2px
sm    0.25rem   4px
base  0.5rem    8px
md    0.75rem   12px
lg    1rem      16px
xl    1.5rem    24px
2xl   2rem      32px
full  9999px    Fully rounded
```

**Usage:**
```tsx
<button className="rounded-base">Standard button (8px)</button>
<div className="rounded-md">Card (12px)</div>
<div className="rounded-lg">Modal (16px)</div>
<img className="rounded-full" />  {/* Circle/pill */}
```

**Guidelines:**
- Buttons: `rounded-base` (8px)
- Cards: `rounded-md` or `rounded-lg` (12-16px)
- Inputs: `rounded-base` (8px)
- Avatars: `rounded-full`
- Tags/badges: `rounded-full`

---

## Shadow Tokens

```typescript
xs    Minimal shadow
sm    Subtle elevation
base  Standard card
md    Elevated card
lg    Modal/dialog
xl    Dropdown/popover
2xl   Hero elements
```

**Glow Variants:**
```typescript
glow             Standard blue glow
glow-sm          Subtle glow
glow-lg          Strong glow
glow-accent      Accent color glow
glow-success     Green glow
glow-warning     Orange glow
glow-destructive Red glow
```

**Usage:**
```tsx
<div className="shadow-base">Standard card</div>
<div className="shadow-md hover:shadow-lg">Interactive card</div>
<div className="shadow-glow">Glowing element</div>
<div className="shadow-glow-success">Success glow</div>
```

---

## Typography Tokens

```typescript
xs    0.75rem   12px   Line height: 1rem
sm    0.875rem  14px   Line height: 1.25rem
base  1rem      16px   Line height: 1.5rem
lg    1.125rem  18px   Line height: 1.75rem
xl    1.25rem   20px   Line height: 1.75rem
2xl   1.5rem    24px   Line height: 2rem
3xl   1.875rem  30px   Line height: 2.25rem
4xl   2.25rem   36px   Line height: 2.5rem
```

**Usage:**
```tsx
<h1 className="text-4xl">Hero heading</h1>
<h2 className="text-2xl">Section heading</h2>
<p className="text-base">Body text</p>
<small className="text-sm">Caption</small>
```

---

## Animation Tokens

### Optimized Animations (v0.11.4)

```typescript
spin-slow        3s linear infinite
pulse-slow       3s cubic-bezier infinite
bounce-soft      2s ease-in-out infinite
shimmer          3s linear infinite
glow             2s ease-in-out infinite
float            3s ease-in-out infinite
```

**Usage:**
```tsx
<div className="animate-shimmer">Shimmering element</div>
<div className="animate-glow">Glowing element</div>
<div className="animate-float">Floating element</div>
```

### Transition Durations

```typescript
fast    100ms   Micro-interactions (button press)
normal  200ms   Standard transitions (hover, focus)
slow    300ms   Large transitions (modal, drawer)
```

**Usage:**
```tsx
<button className="transition-all duration-fast hover:scale-105">
  Quick response
</button>

<div className="transition-opacity duration-normal">
  Standard fade
</div>

<div className="transition-transform duration-slow">
  Slow slide
</div>
```

### Timing Functions

```typescript
bounce    cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

**Usage:**
```tsx
<button className="transition-transform ease-bounce hover:scale-110">
  Bouncy button
</button>
```

---

## Performance Mode

### Usage

```typescript
import { usePerformanceMode, usePerformanceCheck } from "@/lib/ui/performance-mode";

function MyComponent() {
  const { canAnimate, canShowParticles, canShowGlow } = usePerformanceCheck();
  
  return (
    <div>
      {canShowParticles && <ParticleEffect />}
      {canShowGlow && <GlowEffect />}
      {canAnimate && <AnimatedElement />}
    </div>
  );
}
```

### Automatic Detection

```typescript
import { usePerformanceMode } from "@/lib/ui/performance-mode";

// In root layout or provider
useEffect(() => {
  usePerformanceMode.getState().detectAndApply();
}, []);
```

**Detects:**
- `prefers-reduced-motion` CSS media query
- Low-end devices (≤2 CPU cores)
- Low memory devices (≤4GB)
- Battery saver mode

### Settings Toggle

```tsx
import { usePerformanceMode } from "@/lib/ui/performance-mode";

function SettingsPanel() {
  const { performanceMode, setPerformanceMode } = usePerformanceMode();
  
  return (
    <label>
      <input
        type="checkbox"
        checked={performanceMode}
        onChange={(e) => setPerformanceMode(e.target.checked)}
      />
      Performance Mode (disable heavy effects)
    </label>
  );
}
```

---

## Accessibility

### WCAG AA Compliance

**Color Contrast Ratios:**

```
Text on Background:
├─ text-DEFAULT on bg-DEFAULT:     19.2:1 (AAA) ✅
├─ text-secondary on bg-DEFAULT:   12.8:1 (AAA) ✅
├─ text-muted on bg-DEFAULT:       7.5:1  (AA)  ✅
└─ text-disabled on bg-DEFAULT:    4.8:1  (AA)  ✅

Interactive Elements:
├─ primary on bg-DEFAULT:          4.8:1  (AA)  ✅
├─ success on bg-DEFAULT:          5.2:1  (AA)  ✅
├─ warning on bg-DEFAULT:          6.1:1  (AA)  ✅
└─ destructive on bg-DEFAULT:      5.8:1  (AA)  ✅
```

### Motion Preferences

**Respect User Preferences:**

```tsx
// Automatically disable animations
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Or use Performance Mode:**

```typescript
const { canAnimate } = usePerformanceCheck();

<motion.div
  animate={canAnimate ? { scale: 1.1 } : {}}
  transition={canAnimate ? { duration: 0.2 } : { duration: 0 }}
>
```

### Focus Indicators

**All interactive elements have visible focus:**

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-accent">
  Click me
</button>
```

---

## Component Patterns

### Card

```tsx
<div className="bg-bg-elevated rounded-lg p-md shadow-md border border-border">
  <h2 className="text-xl text-text">Card Title</h2>
  <p className="text-base text-text-secondary">Card content</p>
</div>
```

### Button

```tsx
<button className="
  bg-primary hover:bg-primary-hover
  text-primary-foreground
  px-md py-sm
  rounded-base
  shadow-sm hover:shadow-md
  transition-all duration-fast
  focus:outline-none focus:ring-2 focus:ring-accent
">
  Primary Button
</button>
```

### Input

```tsx
<input className="
  bg-bg-elevated
  text-text
  border border-border
  rounded-base
  px-base py-sm
  focus:outline-none focus:ring-2 focus:ring-accent
  transition-all duration-fast
" />
```

### Badge

```tsx
<span className="
  bg-accent
  text-accent-foreground
  px-sm py-xs
  rounded-full
  text-xs
  shadow-sm
">
  Badge
</span>
```

---

## Migration Guide

### Replace Inline Colors

**Before:**
```tsx
<div className="bg-[#1e293b] text-[#f1f5f9]">
```

**After:**
```tsx
<div className="bg-bg-elevated text-text">
```

### Replace Ad-Hoc Spacing

**Before:**
```tsx
<div className="p-6 m-4 gap-3">
```

**After:**
```tsx
<div className="p-md m-base gap-sm">
```

### Replace Custom Shadows

**Before:**
```tsx
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
```

**After:**
```tsx
<div className="shadow-md">
```

### Optimize Animations

**Before:**
```tsx
<motion.div
  animate={{ scale: 1.1 }}
  transition={{ duration: 0.5 }}
>
```

**After:**
```tsx
import { getSpringConfig } from "@/lib/ui/performance-mode";

<motion.div
  animate={{ scale: 1.1 }}
  transition={getSpringConfig()}
>
```

---

## Performance Mode

### What Gets Disabled

**Performance Mode ON:**
- ❌ Particle effects
- ❌ Glow effects
- ❌ Complex animations
- ✅ Basic transitions (50% faster)
- ✅ Core functionality

**Reduced Motion ON:**
- ❌ All animations
- ❌ All transitions
- ✅ Instant state changes

### Usage

```typescript
import { usePerformanceCheck } from "@/lib/ui/performance-mode";

function HeroStats() {
  const { canShowGlow, canAnimate } = usePerformanceCheck();
  
  return (
    <div className={canShowGlow ? "shadow-glow" : "shadow-md"}>
      {canAnimate && <AnimatedBars />}
      {!canAnimate && <StaticBars />}
    </div>
  );
}
```

---

## Best Practices

### Color Usage

```tsx
// ✅ Good: Semantic colors
<button className="bg-primary">Primary action</button>
<button className="bg-success">Confirm</button>
<button className="bg-destructive">Delete</button>

// ❌ Bad: Direct colors
<button className="bg-blue-500">Click</button>
<button className="bg-green-600">OK</button>
```

### Spacing Consistency

```tsx
// ✅ Good: Token-based spacing
<div className="p-md space-y-sm">
  <div className="mb-base">Item</div>
</div>

// ❌ Bad: Random values
<div className="p-6 space-y-3">
  <div className="mb-4">Item</div>
</div>
```

### Responsive Design

```tsx
// ✅ Good: Mobile-first with tokens
<div className="p-sm md:p-md lg:p-lg">
  Responsive padding
</div>
```

### Accessibility

```tsx
// ✅ Good: High contrast text
<p className="text-text">Readable text</p>

// ✅ Good: Focus indicators
<button className="focus:ring-2 focus:ring-accent">

// ✅ Good: Motion respect
const { canAnimate } = usePerformanceCheck();
```

---

## Token Reference

### Quick Reference Table

| Category | Tokens | Count | Purpose |
|----------|--------|-------|---------|
| Colors | bg, text, border, semantic | 30+ | Visual identity |
| Spacing | xs → 3xl | 8 | Layout consistency |
| Radius | xs → full | 8 | Shape language |
| Shadows | xs → 2xl, glow variants | 14 | Depth perception |
| Typography | xs → 4xl | 8 | Type scale |
| Animation | spin, pulse, glow, etc. | 6 | Motion design |
| Duration | fast, normal, slow | 3 | Timing |

### Color Palette Overview

```
Backgrounds:
#0a0f1e (base) → #0f172a (muted) → #1e293b (elevated)

Text:
#f8fafc (default) → #cbd5e1 (secondary) → #94a3b8 (muted) → #64748b (disabled)

Borders:
#1e293b (heavy) → #334155 (default) → #475569 (light)

Semantic:
#3b82f6 (primary)
#22c55e (success)
#f59e0b (warning)
#ef4444 (destructive)
```

---

## Framer Motion Optimization

### Optimized Variants (v0.11.4)

**Before:**
```typescript
const variants = {
  animate: { scale: 1.1 },
  transition: { duration: 0.5, type: "spring" }
};
```

**After:**
```typescript
import { getSpringConfig, getAnimationDuration } from "@/lib/ui/performance-mode";

const variants = {
  animate: { scale: 1.1 },
  transition: getSpringConfig()
};

// Auto-adjusts based on performance mode:
// Normal: { type: "spring", stiffness: 400, damping: 17 }
// Performance: { type: "tween", duration: 0.1 }
// Reduced Motion: { duration: 0 }
```

### Reduced Durations

**Small Transitions:**
```typescript
// Before: 300ms
transition: { duration: 0.3 }

// After: 100ms
transition: { duration: 0.1 }
```

**Button Interactions:**
```typescript
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.1 }}  // Fast feedback
>
```

---

## Examples

### Consistent Card

```tsx
<div className="
  bg-bg-elevated
  text-text
  border border-border
  rounded-lg
  p-md
  shadow-md
  hover:shadow-lg
  transition-shadow duration-normal
">
  <h3 className="text-xl mb-sm">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>
```

### Accessible Button

```tsx
<button className="
  bg-primary hover:bg-primary-hover
  text-primary-foreground
  px-md py-sm
  rounded-base
  shadow-sm hover:shadow-md
  transition-all duration-fast
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
">
  Click Me
</button>
```

### Performance-Aware Animation

```tsx
import { usePerformanceCheck } from "@/lib/ui/performance-mode";
import { motion } from "framer-motion";

function AnimatedCard() {
  const { canAnimate, canShowGlow } = usePerformanceCheck();
  
  return (
    <motion.div
      className={`
        bg-bg-elevated rounded-lg p-md
        ${canShowGlow ? "shadow-glow" : "shadow-md"}
      `}
      animate={canAnimate ? { scale: 1.05 } : {}}
      transition={canAnimate ? { duration: 0.2 } : { duration: 0 }}
    >
      Content
    </motion.div>
  );
}
```

---

## Design System Checklist

### Colors
- [x] WCAG AA minimum contrast (4.5:1)
- [x] Semantic color naming
- [x] Hover states for all interactive
- [x] Consistent palette across app

### Spacing
- [x] 8px base grid system
- [x] Consistent spacing scale
- [x] Responsive spacing utilities

### Typography
- [x] Clear type hierarchy
- [x] Readable line heights
- [x] Consistent font sizes

### Shadows
- [x] Elevation system
- [x] Glow variants for states
- [x] Subtle depth cues

### Animation
- [x] Reduced durations (100-300ms)
- [x] Performance mode support
- [x] Reduced motion support
- [x] GPU-accelerated transforms

### Accessibility
- [x] WCAG AA contrast ratios
- [x] Focus indicators
- [x] Motion preferences
- [x] Semantic HTML

---

**Last Updated:** v0.11.4 (2025-10-13)













