# Tailwind Tokens — Usage Guide

Central design tokens for PareL UI. Prefer tokens over raw values so styling stays consistent and maintainable.

## Token Categories

### Backgrounds
| Token | Use |
|-------|-----|
| `bg-bg` | Page/root background |
| `bg-bg-muted` | Muted page background (slightly lighter) |
| `bg-bg-elevated` | Elevated surfaces |
| `bg-card` | Card, panel, modal backgrounds |
| `bg-card/80` | Semi-transparent card (e.g. overlay) |

### Text
| Token | Use |
|-------|-----|
| `text-text` | Primary content |
| `text-text-secondary` | Supporting text |
| `text-subtle` | Muted/secondary text (theme-aware) |
| `text-text-muted` | Low-contrast, disabled |

### Borders
| Token | Use |
|-------|-----|
| `border-border` | Default borders |
| `border-border-light` | Lighter borders |
| `border-border-heavy` | Darker dividers |

### Accent / Brand
| Token | Use |
|-------|-----|
| `border-accent` | Accent outline |
| `text-accent` | Accent text |
| `bg-accent` | Primary actions |

### Radius
| Token | Use |
|-------|-----|
| `rounded-lg` | Cards, panels |
| `rounded-xl` | Large cards, sections |
| `rounded-base` | Buttons, inputs |

### Shadows
| Token | Use |
|-------|-----|
| `shadow-panel` | Card/panel elevation |
| `shadow-base` | Default card shadow |
| `shadow-md` | Modals, dropdowns |

## Before / After

**Before (per-page hacks):**
```tsx
<div className="min-h-screen bg-[#0f172a] p-6 text-slate-100">
  <input className="rounded-lg border border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500" />
  <aside className="rounded-xl border border-slate-600 bg-slate-800/80">
```

**After (semantic tokens):**
```tsx
<div className="min-h-screen bg-bg-muted p-6 text-text">
  <input className="rounded-lg border border-border bg-card text-text placeholder:text-subtle" />
  <aside className="rounded-xl border border-border bg-card/80">
```

## Rule

Prefer semantic tokens (`bg-card`, `text-subtle`, `border-border`) over raw palette classes (`bg-slate-800`, `text-slate-100`). This keeps the UI consistent when themes change and reduces style drift.

## Theme Integration

`text-subtle` and related colors resolve via CSS variables (`--color-subtle`) set by ThemeManager. Default values live in `globals.css`; runtime themes override them. Use token names, not hex values.
