## C8 â€” Storybook / Docs Rationalization

### Purpose

This document defines the plan for rationalizing Storybook stories and documentation structure. It provides a usage audit, documentation strategy, removal plan, future structure, markdown rules, minimal Storybook spec, migration strategy, and risk map for consolidating and organizing component documentation.

---

# C8 â€” Storybook / Docs Rationalization â€” Planning Document

## 1. Storybook Usage Audit

### Useful Stories

**Characteristics:**
- Document reusable UI primitives (atoms, molecules)
- Show component variants and states clearly
- Demonstrate component API and props
- Include accessibility examples
- Used by designers and developers for reference
- Regularly maintained and updated

**Examples:**
- Button component with all variants (primary, secondary, ghost, danger)
- Input components with validation states
- Card components with different content layouts
- Icon registry showcase
- Typography scale display
- Color palette and design tokens

### Outdated Stubs

**Characteristics:**
- Placeholder stories created during initial setup
- No real examples or use cases
- Missing props or incomplete implementations
- Created for components that were never finished
- No longer reflect current component API

**Examples:**
- Empty story files with just component import
- Stories with "TODO" comments
- Stories showing components in broken states
- Stories for deprecated components still in Storybook

### Broken/Legacy Stories

**Characteristics:**
- Stories that no longer compile or run
- Reference removed components or APIs
- Use outdated patterns or dependencies
- Cause Storybook build failures
- Reference non-existent props or methods

**Examples:**
- Stories importing deleted components
- Stories using old prop names that changed
- Stories with TypeScript errors
- Stories referencing removed dependencies
- Stories using deprecated component patterns

### Duplicated Stories

**Characteristics:**
- Multiple stories showing same component
- Stories in different locations showing same thing
- Feature-specific stories duplicating shared component stories
- Stories with slight variations but same purpose

**Examples:**
- Button story in both shared and feature folders
- Challenge card story duplicated across features
- Form input stories repeated in multiple modules

### Stories That Should Be Docs Instead

**Characteristics:**
- Complex feature-level components
- Components with extensive business logic
- Integration examples showing multiple components
- Workflow demonstrations
- Configuration guides
- Best practices and patterns

**Examples:**
- Complete challenge flow story (should be in feature docs)
- Social feed integration story (should be in feature docs)
- Authentication flow story (should be in auth docs)
- API integration examples (should be in API docs)
- Deployment guides (should be in deployment docs)

---

## 2. Documentation Strategy

### When a Component SHOULD Have a Storybook Story

**UI Primitives (Atoms):**
- All shared UI atoms should have Storybook stories
- Examples: Button, Input, Card, Badge, Icon, Modal
- Stories show all variants, states, and use cases
- Stories demonstrate accessibility features
- Stories serve as living style guide

**Reusable Molecules:**
- Shared molecules used across features
- Examples: FormField, StatCard, UserCard, ActivityItem
- Stories show composition patterns
- Stories demonstrate prop combinations
- Stories show responsive behavior

**Design System Components:**
- Components that define visual language
- Examples: Typography, Colors, Spacing, Shadows
- Stories serve as design reference
- Stories show token usage
- Stories demonstrate consistency

### When Documentation SHOULD Live in Module README

**Feature-Level Components:**
- Components specific to a feature
- Examples: ChallengeCard, StoryViewer, EventDashboard
- Documentation in feature module README
- Include usage examples and integration guides
- Show how components work together

**Business Logic Components:**
- Components with complex state management
- Components with API integration
- Components with feature-specific behavior
- Documentation explains business rules
- Documentation shows data flow

**Integration Guides:**
- How to use multiple components together
- Feature workflows and user journeys
- API integration patterns
- Configuration and setup guides
- Troubleshooting and FAQs

### Clear Rules for Documentation Locations

**Component-Level Docs:**
- Simple props documentation â†’ Storybook
- Variant examples â†’ Storybook
- Visual reference â†’ Storybook
- Basic usage â†’ Storybook

**Module-Level Docs:**
- Module README for feature modules
- Architecture decisions â†’ `/docs/architecture/`
- API documentation â†’ `/docs/api/` or module README
- Integration guides â†’ Module README

**Cross-Cutting Docs:**
- Design system â†’ `/docs/design-system/`
- Architecture decisions â†’ `/docs/architecture/`
- Developer guides â†’ `/docs/guides/`
- Feature roadmaps â†’ `/docs/architecture/`
- Migration guides â†’ `/docs/guides/`

**Feature Docs:**
- Feature-specific components â†’ Feature module README
- Feature workflows â†’ Feature module README
- Feature configuration â†’ Feature module README
- Feature API â†’ Feature module README

---

## 3. Removal & Consolidation Plan

### Step 1: Comprehensive Storybook Audit
- Identify all stories across Storybook
- Categorize stories (useful/outdated/broken/duplicate/should-be-docs)
- Document story locations and dependencies
- Map stories to components
- Can run in parallel: Yes (multiple auditors)

### Step 2: Tag Stories for Action
- Tag stories as keep/remove/migrate-to-docs
- Document rationale for each decision
- Identify stories that need updates
- Create removal list
- Can run in parallel: After Step 1

### Step 3: Fix Broken Stories
- Fix compilation errors
- Update outdated prop references
- Remove references to deleted components
- Ensure all kept stories run successfully
- Can run in parallel: After Step 2

### Step 4: Remove Outdated and Broken Stories
- Delete placeholder stories
- Remove broken stories that can't be fixed
- Remove duplicate stories (keep canonical)
- Clean up unused story files
- Can run in parallel: After Step 3

### Step 5: Migrate Feature Stories to Docs
- Extract feature-level stories to module READMEs
- Convert complex integration stories to guides
- Move workflow demonstrations to feature docs
- Create markdown documentation from stories
- Can run in parallel: After Step 4

### Step 6: Consolidate Duplicate Stories
- Merge duplicate stories into canonical versions
- Update imports across codebase
- Ensure single source of truth for each component
- Remove redundant story files
- Can run in parallel: After Step 4

### Step 7: Update Remaining Stories
- Ensure all kept stories follow minimal Storybook mode
- Add missing accessibility examples
- Standardize story structure
- Add proper documentation
- Can run in parallel: After Steps 5-6

### Step 8: Clean Up Storybook Configuration
- Remove unused addons
- Simplify Storybook config
- Remove feature-specific configurations
- Document minimal Storybook setup
- Can run in parallel: After Step 7

**Execution Order:**
- Steps 1-2: Serial (audit â†’ tag)
- Steps 3-4: Can run in parallel (fix â†’ remove)
- Steps 5-6: Can run in parallel (migrate â†’ consolidate)
- Steps 7-8: Serial (update â†’ cleanup)

---

## 4. Future Documentation Structure

### Recommended `/docs/` Folder Structure

```
/docs/
â”œâ”€â”€ architecture/          # System architecture, roadmaps, refactor plans
â”œâ”€â”€ design-system/         # Design tokens, component guidelines, visual reference
â”œâ”€â”€ components/            # Component API documentation (if not in Storybook)
â”œâ”€â”€ features/              # Feature-specific documentation
â”‚   â”œâ”€â”€ challenges/
â”‚   â”œâ”€â”€ social/
â”‚   â”œâ”€â”€ progression/
â”‚   â””â”€â”€ narrative/
â”œâ”€â”€ guides/                # Developer guides, tutorials, migration guides
â”œâ”€â”€ api/                   # API documentation (if separate from code)
â””â”€â”€ README.md              # Documentation index and navigation
```

### What Belongs in Each

**`/docs/architecture/`:**
- System architecture decisions
- Roadmaps and planning documents (C1-C8)
- Refactor plans and technical debt tracking
- Module boundaries and dependencies
- Performance and scaling considerations

**`/docs/design-system/`:**
- Design token definitions
- Color palette and usage guidelines
- Typography scale and hierarchy
- Spacing and layout rules
- Component composition patterns
- Accessibility guidelines

**`/docs/components/`:**
- Component API documentation (if not in Storybook)
- Component usage patterns
- Component composition examples
- Component testing guidelines
- Component migration guides

**`/docs/features/`:**
- Feature-specific component documentation
- Feature workflows and user journeys
- Feature configuration guides
- Feature API documentation
- Feature integration examples

**`/docs/guides/`:**
- Developer onboarding guides
- Setup and installation guides
- Migration guides between versions
- Best practices and patterns
- Troubleshooting guides
- FAQ documents

**`/docs/api/`:**
- API endpoint documentation (if separate from code)
- API authentication guides
- API rate limiting and usage
- API versioning information
- API examples and SDKs

---

## 5. Markdown Rules

### Headers

**Header Hierarchy:**
- Use `#` for document title (one per document)
- Use `##` for major sections
- Use `###` for subsections
- Use `####` for sub-subsections
- Never skip header levels (don't go from `##` to `####`)

**Header Naming:**
- Use sentence case for headers
- Be descriptive and specific
- Avoid generic names like "Overview" or "Details"
- Use consistent naming patterns across documents

### Sections

**Section Structure:**
- Each major section should have a brief introduction
- Use consistent section ordering across similar documents
- Include "Summary" section at end of planning documents
- Use horizontal rules (`---`) sparingly, only for major breaks

**Content Organization:**
- Use bullet lists for multiple items
- Use numbered lists for sequential steps
- Use tables for structured data
- Use code blocks for examples

### Code Blocks

**Language Tags:**
- Always specify language for code blocks
- Use `typescript` for TypeScript code
- Use `javascript` for JavaScript code
- Use `bash` for shell commands
- Use `json` for JSON data
- Use `markdown` for markdown examples

**Code Block Formatting:**
- Include relevant context, not just snippets
- Add comments explaining complex code
- Keep code blocks focused and readable
- Use inline code (backticks) for short references

### Diagrams

**Diagram Formats:**
- Use ASCII art for simple diagrams
- Use Mermaid for complex diagrams (if supported)
- Include diagram descriptions
- Keep diagrams simple and readable
- Use diagrams to illustrate architecture and flows

**When to Use Diagrams:**
- System architecture
- Component relationships
- Data flow
- User workflows
- Module dependencies

### Linking Rules

**Internal Links:**
- Use relative paths for internal documentation links
- Link to specific sections using `#section-name`
- Keep link text descriptive
- Verify links work after file moves

**External Links:**
- Use full URLs for external links
- Include link text that describes destination
- Consider adding `(external)` label for clarity

**Cross-References:**
- Link between related documents
- Link from component docs to architecture docs
- Link from guides to feature docs
- Maintain link integrity during refactors

---

## 6. "Minimal Storybook Mode" Spec

### Scope: Atoms/Molecules Only

**What Belongs in Storybook:**
- All UI atoms (Button, Input, Card, Badge, Icon, etc.)
- Shared molecules (FormField, StatCard, UserCard, etc.)
- Design system components (Typography, Colors, Spacing)
- Layout primitives (Container, Stack, Grid)

**What Does NOT Belong:**
- Feature-specific components
- Complex integration examples
- Business logic components
- Workflow demonstrations
- API integration examples

### No Feature-Level Stories

**Rationale:**
- Feature components belong in feature module READMEs
- Feature stories create maintenance burden
- Feature stories become outdated quickly
- Feature documentation is better in markdown

**Migration Path:**
- Extract feature stories to markdown docs
- Include screenshots or GIFs in markdown
- Document usage patterns in feature READMEs
- Use Storybook only for reusable primitives

### Minimal Addons

**Required Addons:**
- **Controls:** For interactive prop exploration
- **Viewport:** For responsive design testing
- **A11y:** For accessibility testing

**Optional Addons:**
- **Actions:** For event logging (if needed)
- **Docs:** For auto-generated docs (if useful)

**Removed Addons:**
- Complex state management addons
- API mocking addons
- Feature-specific addons
- Unused or rarely-used addons

### Configuration Guidelines

**Keep Configuration Simple:**
- Minimal webpack configuration
- Standard TypeScript configuration
- No custom loaders unless necessary
- No complex build processes

**Story Structure:**
- Consistent story file naming
- One story file per component
- Standard story export format
- Clear story organization

**Performance:**
- Fast build times
- Quick hot reload
- Minimal bundle size
- No unnecessary dependencies

---

## 7. Migration Strategy

### Step 1: Comprehensive Audit
- Audit all Storybook stories
- Categorize stories (useful/outdated/broken/duplicate/migrate)
- Document current Storybook structure
- Identify dependencies between stories
- Can run in parallel: Yes (multiple auditors)

### Step 2: Tag Keep/Remove/Move
- Tag each story with action (keep/remove/migrate-to-docs)
- Document rationale for decisions
- Create migration plan for each story
- Prioritize stories by importance
- Can run in parallel: After Step 1

### Step 3: Migrate Feature Stories to Docs
- Extract feature stories to markdown
- Create feature module READMEs if missing
- Convert stories to documentation format
- Add screenshots or examples to docs
- Can run in parallel: After Step 2

### Step 4: Remove Outdated Stories
- Delete broken and outdated stories
- Remove duplicate stories
- Clean up unused story files
- Update Storybook configuration
- Can run in parallel: After Step 3

### Step 5: Update Remaining Stories
- Ensure stories follow minimal Storybook mode
- Add missing accessibility examples
- Standardize story structure
- Add proper documentation
- Can run in parallel: After Step 4

### Step 6: Cleanup Storybook Config
- Remove unused addons
- Simplify Storybook configuration
- Remove feature-specific configs
- Document minimal setup
- Can run in parallel: After Step 5

### Step 7: Publish Minimal Storybook
- Build and test Storybook
- Verify all stories work correctly
- Update Storybook deployment
- Document new Storybook structure
- Can run in parallel: After Step 6

**Execution Order:**
- Steps 1-2: Serial (audit â†’ tag)
- Steps 3-4: Can run in parallel (migrate â†’ remove)
- Steps 5-6: Can run in parallel (update â†’ cleanup)
- Step 7: After Steps 5-6 (publish)

---

## 8. Risk Map

### Losing Visual Regressions

**Risk:** Removing stories may lose visual regression testing capabilities

**Mitigation:**
- Keep visual regression tests separate from Storybook
- Use dedicated visual regression tool (Chromatic, Percy, etc.)
- Maintain visual tests for critical components
- Document visual testing strategy
- Ensure visual tests cover all important variants

### Documentation Inconsistencies

**Risk:** Migrating stories to docs may create inconsistencies

**Mitigation:**
- Use consistent documentation templates
- Review all migrated documentation
- Establish documentation standards
- Regular documentation audits
- Clear ownership of documentation areas

### Designers Losing References

**Risk:** Removing stories may remove designer reference points

**Mitigation:**
- Keep essential design system stories
- Create design system documentation
- Provide alternative reference (design system site)
- Communicate changes to design team
- Ensure designers have access to component library

### Broken Storybook Builds

**Risk:** Migration may break Storybook builds

**Mitigation:**
- Test Storybook builds after each migration step
- Fix broken stories before removing others
- Maintain working Storybook during migration
- Rollback plan for each step
- CI/CD checks for Storybook builds

### Lost Component Examples

**Risk:** Removing stories may lose valuable usage examples

**Mitigation:**
- Extract examples to documentation before removing
- Create component usage guides
- Document common patterns
- Include examples in module READMEs
- Maintain example code in documentation

### Maintenance Overhead

**Risk:** Storybook may still require significant maintenance

**Mitigation:**
- Keep Storybook scope minimal (atoms/molecules only)
- Automate Storybook updates where possible
- Clear ownership of Storybook maintenance
- Regular cleanup of unused stories
- Document maintenance responsibilities

### Developer Confusion

**Risk:** New structure may confuse developers

**Mitigation:**
- Clear documentation of new structure
- Migration guide for developers
- Update developer onboarding
- Communicate changes clearly
- Provide examples of new documentation locations

### Incomplete Migration

**Risk:** Some stories may not be properly migrated

**Mitigation:**
- Comprehensive audit before migration
- Track migration progress
- Review all migrated content
- Verify no important content lost
- Get stakeholder sign-off before final removal

---

## Summary

This plan establishes:
- Storybook usage audit categorizing all stories
- Clear documentation strategy for components vs modules vs features
- Removal and consolidation plan with 8 steps
- Future documentation structure with clear organization
- Markdown rules for consistent documentation
- Minimal Storybook mode spec (atoms/molecules only)
- Migration strategy with parallelization opportunities
- Risk map with mitigation strategies

Ready for review before implementation begins.
