# C4 â€” UI Atoms Merge (One Consistent UI Kit)

## Purpose

This document defines the plan for consolidating UI atoms into one consistent UI kit. It provides a unified atoms taxonomy, duplicate removal strategy, atomic design hierarchy, global UI rules, migration strategy, and risk map for structural planning.

---

# C4 â€” UI Atoms Merge (One Consistent UI Kit) â€” Planning Document

## 1. Unified Atoms Taxonomy

### Core Visual Primitives

**Button**
- Primary interactive element for user actions
- Handles variants (primary, secondary, ghost, danger) and states (default, hover, active, disabled, loading)

**Card**
- Container for grouped content
- Supports elevation, borders, padding, and optional header/footer

**Badge**
- Small status or count indicator
- Supports variants (info, success, warning, error, neutral) and sizes

**Input**
- Text input for forms
- Handles validation states, placeholders, labels, and error messages

**Select**
- Dropdown selection component
- Supports single/multi-select, search, and disabled states

**Textarea**
- Multi-line text input
- Handles validation, character count, and auto-resize

**Icon**
- Visual symbol component
- Supports sizing, color inheritance, and accessibility labels

**Modal**
- Overlay dialog for focused interactions
- Handles open/close, backdrop, focus trap, and scroll lock

**Text**
- Typography primitives (headings, body, labels, captions)
- Handles hierarchy, weight, color, and truncation

**Avatar**
- User profile image/initials display
- Supports sizes, fallbacks, and status indicators

**Progress**
- Progress indicator (bar or circular)
- Shows completion percentage and optional labels

**Spinner**
- Loading indicator
- Supports sizes and color variants

**Divider**
- Visual separator between sections
- Supports horizontal/vertical and spacing variants

**Tooltip**
- Contextual information on hover/focus
- Supports positioning, delay, and accessibility

**Toast**
- Temporary notification message
- Supports variants, auto-dismiss, and stacking

**Checkbox**
- Binary selection input
- Handles checked, unchecked, indeterminate, and disabled states

**Radio**
- Single selection from group
- Handles selection state and group coordination

**Switch**
- Toggle for binary settings
- Handles on/off states and labels

**Skeleton**
- Loading placeholder
- Supports various shapes and animation

---

## 2. Duplicate Removal List

### Button Variants

**Keep (Canonical):**
- Primary button (main actions)
- Secondary button (secondary actions)
- Ghost button (tertiary actions)
- Danger button (destructive actions)
- Icon-only button (toolbar actions)

**Deprecate:**
- Feature-specific button styles (challenge button, social button, etc.)
- Inline button variants that duplicate canonical styles
- Custom colored buttons that don't follow design system

**Merge:**
- All button variants into unified component with variant prop
- Loading states consolidated into single pattern
- Size variants (sm, md, lg) unified

### Card Variants

**Keep (Canonical):**
- Base card (standard container)
- Elevated card (with shadow)
- Bordered card (with border, no shadow)
- Interactive card (hover states for clickable cards)

**Deprecate:**
- Feature-specific cards (challenge card, profile card, etc.) â€” move to molecules
- Custom card styles that duplicate base patterns
- Inline card definitions scattered across features

**Merge:**
- All card padding/spacing variants into consistent system
- Header/footer patterns unified
- Card hover/focus states consolidated

### Modal/Dialog Variants

**Keep (Canonical):**
- Standard modal (centered dialog)
- Full-screen modal (mobile-first)
- Confirmation dialog (simple yes/no)
- Form modal (with form content)

**Deprecate:**
- Custom modal implementations per feature
- Inline modal code duplicated across components
- Feature-specific modal wrappers

**Merge:**
- All modal backdrops into single pattern
- Focus trap logic unified
- Animation/transition patterns consolidated
- Close button patterns unified

### Input/Select/Textarea Variants

**Keep (Canonical):**
- Text input (standard, with validation states)
- Select dropdown (single/multi-select)
- Textarea (multi-line)
- Search input (with search icon)
- Number input (with increment/decrement)

**Deprecate:**
- Custom input wrappers per feature
- Duplicate validation display patterns
- Feature-specific input styles

**Merge:**
- All validation states (error, success, warning) unified
- Label/helper text patterns consolidated
- Error message display unified
- Disabled state styling consistent

### Badges/Tags/Pills

**Keep (Canonical):**
- Badge (status indicator)
- Tag (removable label)
- Pill (rounded label, non-removable)

**Deprecate:**
- Feature-specific badge styles
- Duplicate tag implementations
- Custom pill components

**Merge:**
- All badge variants into single component with type prop
- Color schemes unified across badge/tag/pill
- Size variants consolidated

---

## 3. Atomic Design Hierarchy

### Atoms (Smallest Units)

**Visual Atoms:**
- Button, Card, Badge, Icon, Avatar, Progress, Spinner, Divider

**Form Atoms:**
- Input, Select, Textarea, Checkbox, Radio, Switch

**Feedback Atoms:**
- Toast, Tooltip, Modal, Skeleton

**Typography Atoms:**
- Text (Heading, Body, Label, Caption)

**Layout Atoms:**
- Container, Stack, Grid, Flex

### Molecules (Composed UI Units)

**Challenge Molecules:**
- ChallengeSummary (Title + Description + Progress + CTA)
- ChallengeCard (Card + ChallengeSummary + Badge)
- ChallengeProgress (Progress bar + Stats + Timer)

**Social Molecules:**
- UserCard (Card + Avatar + Text + Badge)
- ActivityItem (Avatar + Text + Timestamp + Actions)
- FollowButton (Button + Icon + State)

**Progression Molecules:**
- StatCard (Card + Icon + Stat + Label)
- XPRow (Text + Progress + Badge)
- StreakWidget (Icon + Stat + Visual indicator)

**Narrative Molecules:**
- LoreCard (Card + Image + Text + Badge)
- StoryChoice (Card + Text + Button)
- DiscoveryBadge (Badge + Icon + Text)

**Form Molecules:**
- FormField (Label + Input + Error message)
- FormGroup (Multiple FormFields with spacing)
- SearchBar (Input + Icon + Button)

### Organisms (Full Sections)

**Challenge Organisms:**
- DailyChallengePanel (ChallengeSummary + MetricsGrid + EventPreview)
- ChallengeList (Multiple ChallengeCards + Filters + Pagination)

**Social Organisms:**
- ActivityFeed (Multiple ActivityItems + LoadMore + Filters)
- UserProfile (Avatar + Stats + Bio + Actions)

**Dashboard Organisms:**
- DashboardMetrics (StatCard grid + Charts)
- ProgressOverview (XPRow + StreakWidget + LevelDisplay)

**Narrative Organisms:**
- StoryViewer (LoreCard + StoryChoice + Progress)
- DiscoveryFeed (LoreCard grid + Filters)

---

## 4. Global UI Rules

### Typography Hierarchy

- **H1:** Largest, page titles only
- **H2:** Section headers
- **H3:** Subsection headers
- **H4:** Card titles, small headers
- **Body:** Default text, readable size
- **Label:** Form labels, small text
- **Caption:** Helper text, timestamps, fine print

### Padding/Radius Rules

- Consistent spacing scale (4px base unit)
- Small padding: 8px (tight spaces)
- Medium padding: 16px (standard)
- Large padding: 24px (spacious)
- Extra large padding: 32px (hero sections)
- Border radius: Small (4px), Medium (8px), Large (12px), Full (999px)

### Icon Sizing Rules

- Small: 16px (inline with text)
- Medium: 24px (standard buttons, cards)
- Large: 32px (featured, hero sections)
- Extra large: 48px (empty states, illustrations)
- Icons inherit color from parent (with override option)

### State Behavior

- **Hover:** Subtle elevation/shadow increase, color shift
- **Active/Press:** Slight scale down (0.98), darker color
- **Disabled:** Reduced opacity (0.5), no pointer events, no hover
- **Focus:** Visible outline (accessibility), keyboard navigation
- **Loading:** Spinner replaces content, button shows loading state

### Color Usage (Conceptual)

- **Primary:** Main actions, links, active states
- **Secondary:** Secondary actions, borders
- **Success:** Positive feedback, completed states
- **Warning:** Caution, pending states
- **Error:** Errors, destructive actions
- **Neutral:** Backgrounds, text, borders
- Semantic colors used consistently across components

---

## 5. Migration Strategy

### Step 1: Audit & Tag Duplicates
- Identify all UI primitives across codebase
- Tag duplicates with categories (keep/deprecate/merge)
- Document current usage patterns
- Can run in parallel: Yes (multiple auditors)

### Step 2: Create Canonical Atoms
- Build unified atom components in UI kit
- Implement all variants and states
- Add comprehensive prop interfaces
- Can run in parallel: No (blocks Step 3)

### Step 3: Visual Regression Baseline
- Capture current UI state as baseline
- Set up visual regression testing
- Document expected visual differences
- Can run in parallel: After Step 2

### Step 4: Feature-by-Feature Migration
- Migrate one feature/module at a time
- Replace old components with canonical atoms
- Update imports and prop usage
- Can run in parallel: Yes (different features)

### Step 5: Gradual Rollout with Feature Flags
- Use feature flags for new UI kit components
- Enable per-feature or per-user segment
- Monitor for issues and regressions
- Can run in parallel: With Step 4

### Step 6: Deprecation & Cleanup
- Mark old components as deprecated
- Remove unused components
- Update documentation
- Can run in parallel: After Step 4 (gradual)

**Execution Order:**
- Steps 1-2: Serial (audit â†’ build)
- Step 3: After Step 2
- Steps 4-5: Parallel (migration + rollout)
- Step 6: After Step 4 (gradual cleanup)

---

## 6. Risk Map

### Breaking Layouts

**Risk:** New atoms may have different default spacing/sizing, causing layout shifts

**Mitigation:**
- Maintain backward-compatible prop defaults initially
- Use visual regression testing to catch layout changes
- Gradual migration allows fixing issues incrementally
- Document breaking changes in migration guide

### Inconsistent Props

**Risk:** Old components have different prop names/interfaces than new atoms

**Mitigation:**
- Create prop mapping layer during migration
- Document prop differences in migration guide
- Use TypeScript to catch prop mismatches
- Provide codemod scripts for common transformations

### Old Components Still Referenced

**Risk:** Deprecated components still used in untracked areas

**Mitigation:**
- Use static analysis to find all references
- Add deprecation warnings to old components
- Create usage tracking dashboard
- Set deadline for removal with clear communication

### Dark Mode/Contrast Mismatch

**Risk:** New atoms may not handle dark mode or accessibility properly

**Mitigation:**
- Test all atoms in both light and dark modes
- Verify contrast ratios meet WCAG AA standards
- Use design tokens for colors (not hardcoded)
- Include dark mode in visual regression tests

### Performance Regressions (Re-renders)

**Risk:** New atoms may cause unnecessary re-renders or bundle size increases

**Mitigation:**
- Profile component render performance
- Use React.memo where appropriate
- Code-split UI kit to reduce initial bundle
- Monitor bundle size changes
- Use performance budgets in CI

### Additional Risks

**Design Inconsistency:**
- Risk: New atoms don't match existing design language
- Mitigation: Design review before implementation, maintain design system documentation

**Developer Adoption:**
- Risk: Developers continue using old components
- Mitigation: Clear migration guide, training sessions, code review enforcement

**Third-party Dependencies:**
- Risk: UI kit dependencies conflict with existing ones
- Mitigation: Audit dependencies, use peer dependencies where possible, document conflicts

---

## Summary

This plan establishes:
- Unified atoms taxonomy with clear boundaries
- Duplicate removal strategy (keep/deprecate/merge)
- Atomic design hierarchy (atoms â†’ molecules â†’ organisms)
- Global UI rules for consistency
- Migration strategy with parallelization opportunities
- Risk map with mitigation strategies

Ready for review before implementation begins.
