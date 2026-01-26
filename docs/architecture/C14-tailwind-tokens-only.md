## C14 â€” Tailwind Tokens Only

### Purpose

This document defines the plan for establishing a Tailwind tokens-only styling system in Parel. It provides a styling problems audit, token-only philosophy, color/spacing/typography token systems, component rules, per-page style removal plan, governance, migration strategy, and risk map for structural planning.

---

# C14 â€” Tailwind Tokens Only â€” Planning Document

## 1. Current Styling Problems Audit

### Issue 1: Per-Page Custom Styles

**Problem:** Individual pages have custom CSS styles that override or extend base styles

**Impact:**
- Inconsistent styling across pages
- Hard to maintain and update
- Difficult to ensure design consistency
- Code duplication
- Poor reusability

### Issue 2: Inconsistent Color Usage

**Problem:** Colors used inconsistently across components and pages

**Impact:**
- Visual inconsistency
- Hard to maintain brand colors
- Difficult to update colors globally
- Poor design system adherence
- Confusion about which colors to use

### Issue 3: One-Off Spacing Hacks

**Problem:** Developers use arbitrary spacing values to fix layout issues

**Impact:**
- Inconsistent spacing throughout application
- Hard to maintain consistent rhythm
- Poor visual hierarchy
- Difficult to update spacing globally
- Technical debt accumulation

### Issue 4: Duplicated Typography Patterns

**Problem:** Typography styles duplicated across components and pages

**Impact:**
- Inconsistent typography
- Hard to maintain typography system
- Difficult to update typography globally
- Poor design consistency
- Code duplication

### Issue 5: Ad-Hoc Tailwind Classes Everywhere

**Problem:** Tailwind classes used arbitrarily without following design system

**Impact:**
- Inconsistent styling
- Hard to maintain
- Poor design system adherence
- Difficult to refactor
- No clear styling patterns

### Issue 6: Mixed Inline Styles + Tailwind

**Problem:** Components mix inline styles with Tailwind classes

**Impact:**
- Inconsistent styling approach
- Hard to maintain
- Difficult to override styles
- Poor separation of concerns
- Confusion about styling approach

### Issue 7: Random `!important` Usage

**Problem:** `!important` declarations used to override styles

**Impact:**
- Hard to override styles
- Specificity wars
- Poor maintainability
- Difficult to debug
- Indicates design system gaps

### Issue 8: Hardcoded Colors Instead of Tokens

**Problem:** Colors hardcoded directly in components instead of using tokens

**Impact:**
- Cannot update colors globally
- Inconsistent color usage
- Hard to maintain brand colors
- Difficult to support themes
- Poor design system adherence

### Issue 9: Arbitrary Pixel Values

**Problem:** Arbitrary pixel values used for spacing, sizing, etc.

**Impact:**
- Inconsistent spacing and sizing
- Hard to maintain design system
- Poor visual consistency
- Difficult to update globally
- No design system rhythm

### Issue 10: Missing Design Token System

**Problem:** No centralized design token system for colors, spacing, typography

**Impact:**
- No single source of truth
- Hard to maintain consistency
- Difficult to update design system
- Poor design system governance
- No clear design language

### Issue 11: Inconsistent Border Radius Usage

**Problem:** Border radius values used inconsistently across components

**Impact:**
- Visual inconsistency
- Hard to maintain
- Poor design system adherence
- Difficult to update globally
- No clear design language

### Issue 12: Shadow and Elevation Inconsistency

**Problem:** Shadows and elevation used inconsistently without token system

**Impact:**
- Inconsistent visual hierarchy
- Hard to maintain
- Poor design system adherence
- Difficult to update globally
- No clear elevation system

---

## 2. Token-Only Philosophy

### All Colors Must Map to Tokens

**Rule:** Every color used in the application must come from the design token system

**Benefits:**
- Single source of truth for colors
- Easy to update colors globally
- Consistent color usage
- Theme support capability
- Better design system adherence

### Spacing from Defined Scale

**Rule:** All spacing must use values from the defined spacing scale

**Benefits:**
- Consistent spacing rhythm
- Visual harmony
- Easy to maintain
- Better design consistency
- Clear spacing system

### Typography via Named Styles

**Rule:** Typography must use named typography tokens, not arbitrary values

**Benefits:**
- Consistent typography
- Easy to update typography globally
- Better design consistency
- Clear typography hierarchy
- Maintainable typography system

### No Raw Hex Values in Components

**Rule:** Components cannot use raw hex color values directly

**Benefits:**
- Forces token usage
- Prevents color inconsistencies
- Enables theme support
- Better design system adherence
- Easier color maintenance

### No Arbitrary Pixel Values in Normal Flow

**Rule:** Avoid arbitrary pixel values, use tokens from the design system

**Benefits:**
- Consistent sizing and spacing
- Better design system adherence
- Easier to maintain
- Visual consistency
- Clear design language

### Token-Based Design System

**Rule:** All design decisions flow through the token system

**Benefits:**
- Single source of truth
- Consistent design language
- Easy to maintain and update
- Better design governance
- Clear design system

### Enforced Through Tooling

**Rule:** Linting and tooling enforce token-only usage

**Benefits:**
- Prevents bypassing tokens
- Ensures consistency
- Catches violations early
- Better developer experience
- Maintains design system integrity

### Design System as Foundation

**Rule:** Design tokens form the foundation of all styling decisions

**Benefits:**
- Clear design language
- Consistent visual identity
- Easy to maintain
- Better design governance
- Scalable design system

---

## 3. Color Token System (Conceptual)

### Primary / Secondary / Accent

**Primary Colors:**
- Main brand color
- Primary actions and highlights
- Key UI elements
- Brand identity expression

**Secondary Colors:**
- Supporting brand colors
- Secondary actions
- Complementary elements
- Brand color variations

**Accent Colors:**
- Emphasis and highlights
- Special UI elements
- Attention-grabbing elements
- Accent brand colors

### Semantic Colors (Success, Warning, Error, Info)

**Success Colors:**
- Positive feedback
- Success states
- Completed actions
- Confirmation messages

**Warning Colors:**
- Caution and warnings
- Pending states
- Attention needed
- Warning messages

**Error Colors:**
- Errors and failures
- Destructive actions
- Error states
- Error messages

**Info Colors:**
- Informational messages
- Neutral information
- General notifications
- Info states

### Background Tiers (bg, surface, elevated)

**Base Background:**
- Main application background
- Page background
- Default background color
- Foundation background

**Surface Background:**
- Card and container backgrounds
- Elevated surface backgrounds
- Component backgrounds
- Content area backgrounds

**Elevated Background:**
- Modal and overlay backgrounds
- Dropdown backgrounds
- Popup backgrounds
- Highest elevation backgrounds

### Border & Outline Colors

**Border Colors:**
- Default borders
- Input borders
- Card borders
- Divider borders

**Outline Colors:**
- Focus outlines
- Active outlines
- Selection outlines
- Interactive element outlines

### Text Tiers (primary, secondary, muted)

**Primary Text:**
- Main content text
- Headings
- Important text
- High contrast text

**Secondary Text:**
- Supporting text
- Descriptions
- Secondary content
- Medium contrast text

**Muted Text:**
- Helper text
- Placeholders
- Disabled text
- Low contrast text

---

## 4. Spacing & Layout Tokens

### Spacing Scale

**Scale Levels:**
- Extra small (xs) â€” Tight spacing
- Small (sm) â€” Compact spacing
- Medium (md) â€” Standard spacing
- Large (lg) â€” Spacious spacing
- Extra large (xl) â€” Very spacious
- 2xl, 3xl â€” Maximum spacing

**Usage:**
- Consistent spacing rhythm
- Visual harmony
- Predictable spacing
- Easy to maintain
- Clear spacing system

### Usage Rules (Padding vs Margin, Vertical vs Horizontal)

**Padding Usage:**
- Internal component spacing
- Content area spacing
- Container internal spacing
- Component padding

**Margin Usage:**
- External component spacing
- Component separation
- Layout spacing
- Component margins

**Vertical Spacing:**
- Stack spacing
- Vertical rhythm
- Section spacing
- Vertical component spacing

**Horizontal Spacing:**
- Row spacing
- Horizontal rhythm
- Column spacing
- Horizontal component spacing

### Layout Primitives (Gaps, Stack Spacing)

**Gap Tokens:**
- Grid gaps
- Flex gaps
- Layout gaps
- Container gaps

**Stack Spacing:**
- Vertical stack spacing
- List spacing
- Section spacing
- Content spacing

**Layout Rules:**
- Use gap tokens for layout spacing
- Use stack spacing for vertical layouts
- Consistent spacing in layouts
- Predictable layout behavior

### Constraints (Avoid Random Values)

**Forbidden Patterns:**
- Arbitrary spacing values
- Random pixel values
- One-off spacing hacks
- Inconsistent spacing

**Required Patterns:**
- Use spacing scale tokens
- Consistent spacing values
- Predictable spacing
- Design system spacing

---

## 5. Typography Tokens

### Heading Levels (h1â€“h4)

**Heading Hierarchy:**
- H1 â€” Page titles, hero headings
- H2 â€” Section headings, major headings
- H3 â€” Subsection headings, minor headings
- H4 â€” Small headings, card titles

**Heading Characteristics:**
- Consistent sizing
- Clear hierarchy
- Predictable styling
- Easy to maintain

### Body Text Variants

**Body Text Types:**
- Standard body text
- Large body text
- Small body text
- Body text variants

**Body Text Usage:**
- Main content text
- Paragraphs
- Content areas
- Readable text

### Label/Caption Text

**Label Text:**
- Form labels
- Field labels
- Input labels
- Component labels

**Caption Text:**
- Helper text
- Captions
- Fine print
- Supporting text

### Font Weight Tiers

**Weight Levels:**
- Light â€” Subtle emphasis
- Regular â€” Standard weight
- Medium â€” Moderate emphasis
- Semibold â€” Strong emphasis
- Bold â€” Maximum emphasis

**Weight Usage:**
- Consistent weight application
- Clear hierarchy
- Predictable styling
- Easy to maintain

### Line-Height & Letter-Spacing as Part of Tokens

**Line-Height:**
- Included in typography tokens
- Consistent line spacing
- Readable text
- Predictable spacing

**Letter-Spacing:**
- Included in typography tokens
- Consistent character spacing
- Readable text
- Predictable spacing

---

## 6. Component-Level Token Rules

### Buttons (Which Tokens They Can Use)

**Button Token Usage:**
- Primary/secondary/accent colors
- Spacing tokens for padding
- Typography tokens for text
- Border radius tokens
- Shadow/elevation tokens

**Button Constraints:**
- Cannot use arbitrary colors
- Must use spacing scale
- Must use typography tokens
- Must use design system tokens

### Cards (Spacing + Radius + Shadow Tokens)

**Card Token Usage:**
- Background tokens (surface/elevated)
- Spacing tokens for padding
- Border radius tokens
- Shadow/elevation tokens
- Border color tokens

**Card Constraints:**
- Cannot use arbitrary values
- Must use design system tokens
- Consistent card styling
- Predictable card appearance

### Modals (Background + Overlay Tokens)

**Modal Token Usage:**
- Elevated background tokens
- Overlay background tokens
- Spacing tokens for padding
- Border radius tokens
- Shadow/elevation tokens

**Modal Constraints:**
- Cannot use arbitrary values
- Must use design system tokens
- Consistent modal styling
- Predictable modal appearance

### Inputs (Border + Focus Tokens)

**Input Token Usage:**
- Border color tokens
- Focus outline tokens
- Background tokens
- Spacing tokens for padding
- Typography tokens for text

**Input Constraints:**
- Cannot use arbitrary values
- Must use design system tokens
- Consistent input styling
- Predictable input appearance

---

## 7. Per-Page Style Removal Plan

### Step 1: Identify Pages with Custom Styling

**Process:**
- Audit all pages for custom styles
- Catalog per-page CSS files
- Document custom styling patterns
- Identify styling inconsistencies
- Map custom styles to components

**Output:**
- List of pages with custom styles
- Documentation of custom patterns
- Styling inconsistency report

### Step 2: Map Styles to Tokens

**Process:**
- Analyze custom styles
- Map to design tokens
- Identify missing tokens
- Create token mapping
- Document token equivalents

**Output:**
- Token mapping for custom styles
- Missing token identification
- Token creation requirements

### Step 3: Move Special Cases into Component-Level Variants

**Process:**
- Identify special case styles
- Create component variants
- Move styles to components
- Update component APIs
- Document component variants

**Output:**
- Component variants created
- Styles moved to components
- Updated component documentation

### Step 4: Ban Per-Page Custom CSS Except Rare Exceptions

**Process:**
- Establish ban on per-page CSS
- Define exception criteria
- Document exception process
- Enforce ban via linting
- Review exceptions regularly

**Output:**
- Per-page CSS ban policy
- Exception criteria defined
- Linting rules enforced

### Step 5: Refactor Pages to Use Tokens

**Process:**
- Replace custom styles with tokens
- Update page components
- Remove custom CSS files
- Test visual consistency
- Validate token usage

**Output:**
- Pages refactored to tokens
- Custom CSS removed
- Token usage validated

### Step 6: Document Token Usage Patterns

**Process:**
- Document common patterns
- Create usage examples
- Update style guide
- Provide developer guidance
- Maintain documentation

**Output:**
- Token usage documentation
- Style guide updated
- Developer guidance provided

---

## 8. Design Token Governance

### Who Can Introduce New Tokens

**Token Creation Authority:**
- Design system team
- Design leads
- Architecture team
- With design review
- Following token creation process

**Process:**
- Request token creation
- Design review required
- Technical review required
- Documentation required
- Approval process

### How New Tokens Are Reviewed

**Review Process:**
- Design review for visual consistency
- Technical review for implementation
- Usage review for necessity
- Documentation review
- Approval from design system team

**Review Criteria:**
- Fits design system
- Necessary and not redundant
- Well-documented
- Consistent with existing tokens
- Follows naming conventions

### Constraints on Adding Tokens

**Constraints:**
- Must not duplicate existing tokens
- Must follow naming conventions
- Must be documented
- Must have clear use case
- Must be reviewed and approved

**Limitations:**
- Avoid token explosion
- Maintain token simplicity
- Keep token count manageable
- Ensure token necessity
- Prevent token redundancy

### Process to Deprecate Tokens

**Deprecation Process:**
- Identify unused tokens
- Mark tokens as deprecated
- Provide migration path
- Update documentation
- Remove after migration period

**Deprecation Rules:**
- Deprecation period required
- Migration guidance provided
- Usage audit before removal
- Communication to team
- Gradual removal process

### Mapping Tokens to Figma (if used)

**Figma Integration:**
- Map tokens to Figma styles
- Keep Figma and code in sync
- Document token mapping
- Regular synchronization
- Version control for tokens

**Integration Benefits:**
- Design-code consistency
- Single source of truth
- Easier handoff
- Better collaboration
- Reduced design drift

---

## 9. Migration Strategy

### Step 1: Audit Direct Tailwind Usage and Custom CSS

**Process:**
- Identify all Tailwind usage
- Catalog custom CSS files
- Document styling patterns
- Identify token violations
- Map current styling approach

**Output:**
- Styling audit report
- Token violation list
- Custom CSS inventory
- Can run in parallel: Yes (multiple auditors)

### Step 2: Define Token Map (Colors, Spacing, Typography)

**Process:**
- Design color token system
- Define spacing scale
- Create typography tokens
- Document token system
- Create token reference

**Output:**
- Complete token map
- Token documentation
- Token reference guide
- Can run in parallel: No (requires Step 1)

### Step 3: Refactor Primitives (Buttons/Cards/Inputs) to Tokens

**Process:**
- Update button components
- Update card components
- Update input components
- Use design tokens
- Test visual consistency

**Output:**
- Primitive components using tokens
- Visual consistency validated
- Can run in parallel: After Step 2

### Step 4: Refactor Key Pages to Token-Only Usage

**Process:**
- Identify key pages
- Refactor to use tokens
- Remove custom CSS
- Test visual consistency
- Validate token usage

**Output:**
- Key pages using tokens
- Custom CSS removed
- Can run in parallel: After Step 3

### Step 5: Gradually Remove Raw Values

**Process:**
- Identify remaining raw values
- Replace with tokens
- Update components
- Test changes
- Validate consistency

**Output:**
- Raw values removed
- Token usage complete
- Can run in parallel: After Step 4

### Step 6: Enforce via Lint/Style Checks

**Process:**
- Configure linting rules
- Add style checks
- Enforce token usage
- Prevent raw values
- Monitor compliance

**Output:**
- Linting rules configured
- Style checks enforced
- Token usage enforced
- Can run in parallel: After Step 5

**Execution Order:**
- Steps 1-2: Serial (audit â†’ define)
- Steps 3-4: Can run in parallel (primitives â†’ pages)
- Steps 5-6: Serial (remove â†’ enforce)

---

## 10. Risk Map

### Visual Regressions

**Risk:** Migrating to tokens may cause visual changes

**Mitigation:**
- Visual regression testing
- Careful token mapping
- Gradual migration
- Visual comparison tools
- Design review process
- Staged rollout
- Rollback plan

### Incomplete Token Coverage

**Risk:** Token system may not cover all styling needs

**Mitigation:**
- Comprehensive token audit
- Identify missing tokens early
- Expand token system as needed
- Document token gaps
- Regular token review
- Token usage monitoring
- Feedback collection

### Devs Bypassing Tokens with Arbitrary Values

**Risk:** Developers may bypass tokens using arbitrary values

**Mitigation:**
- Linting rules enforcement
- Code review requirements
- Developer education
- Clear token guidelines
- Tooling enforcement
- Regular audits
- Token usage monitoring

### Token Explosion (Too Many Variants)

**Risk:** Token system may grow too large with too many variants

**Mitigation:**
- Token governance process
- Review new token requests
- Consolidate similar tokens
- Regular token audit
- Token deprecation process
- Limit token variants
- Document token rationale

### Design System Drift

**Risk:** Token system may drift from design intent

**Mitigation:**
- Regular design review
- Design-code synchronization
- Design system documentation
- Design team involvement
- Token usage monitoring
- Design audit process
- Alignment checks

### Performance Impact

**Risk:** Token system may impact build or runtime performance

**Mitigation:**
- Performance testing
- Optimize token usage
- Monitor build times
- Profile runtime performance
- Optimize token compilation
- Performance budgets
- Regular performance audits

### Migration Complexity

**Risk:** Migrating to tokens may be complex and error-prone

**Mitigation:**
- Gradual migration strategy
- Clear migration plan
- Migration tools and scripts
- Comprehensive testing
- Staged rollout
- Migration documentation
- Support and guidance

---

## Summary

This plan establishes:
- Current styling problems audit identifying 12 key issues
- Token-only philosophy with 8 core principles
- Color token system (primary/secondary/accent, semantic colors, backgrounds, borders, text)
- Spacing and layout tokens (scale, usage rules, layout primitives, constraints)
- Typography tokens (headings, body, labels/captions, weights, line-height/letter-spacing)
- Component-level token rules (buttons, cards, modals, inputs)
- Per-page style removal plan with 6 steps
- Design token governance (creation, review, constraints, deprecation, Figma mapping)
- Migration strategy with 6 steps
- Risk map with mitigation strategies

Ready for review before implementation begins.
