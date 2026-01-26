# C1 â€” Daily Challenge Dashboard Design Specification

## Purpose

This document defines the expanded Daily Challenge dashboard section design. It provides wireframe-level layouts, component taxonomy, responsive behavior rules, and event feed placement options for planning purposes only.

---

# Daily Challenge Dashboard â€” Design Specification

## 1. Wireframe-level layouts

### Variant A: Compact (Desktop)
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Daily Challenge Dashboard                                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚  â”‚ Daily Challenge      â”‚  â”‚ Streaks              â”‚        â”‚
â”‚  â”‚                      â”‚  â”‚                      â”‚        â”‚
â”‚  â”‚ [Challenge Title]    â”‚  â”‚ ðŸ”¥ 7 days            â”‚        â”‚
â”‚  â”‚ [Description]        â”‚  â”‚ Best: 12 days        â”‚        â”‚
â”‚  â”‚                      â”‚  â”‚                      â”‚        â”‚
â”‚  â”‚ [Progress Bar]       â”‚  â”‚ [Visual Streak]      â”‚        â”‚
â”‚  â”‚                      â”‚  â”‚                      â”‚        â”‚
â”‚  â”‚ [CTA Button]         â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                   â”‚
â”‚                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚  â”‚ XP / Progress        â”‚  â”‚ Rotation Timer       â”‚        â”‚
â”‚  â”‚                      â”‚  â”‚                      â”‚        â”‚
â”‚  â”‚ Today: +150 XP       â”‚  â”‚ Next challenge in:   â”‚        â”‚
â”‚  â”‚ Total: 2,450 XP     â”‚  â”‚ 14h 23m              â”‚        â”‚
â”‚  â”‚                      â”‚  â”‚                      â”‚        â”‚
â”‚  â”‚ [Level Progress]     â”‚  â”‚ [Circular Timer]     â”‚        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Mini-Event Preview (Optional)                        â”‚  â”‚
â”‚  â”‚                                                       â”‚  â”‚
â”‚  â”‚ ðŸŽ‰ Event: [Name] - [Time Remaining]                  â”‚  â”‚
â”‚  â”‚ [Join Button]                                        â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Variant B: Expanded (Desktop)
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Daily Challenge Dashboard                                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Daily Challenge (Primary)                            â”‚  â”‚
â”‚  â”‚                                                       â”‚  â”‚
â”‚  â”‚ [Challenge Title]                                     â”‚  â”‚
â”‚  â”‚ [Full Description + Requirements]                    â”‚  â”‚
â”‚  â”‚                                                       â”‚  â”‚
â”‚  â”‚ [Detailed Progress Bar]                              â”‚  â”‚
â”‚  â”‚ [Sub-tasks/Checklist if applicable]                  â”‚  â”‚
â”‚  â”‚                                                       â”‚  â”‚
â”‚  â”‚ [CTA Button] [Secondary Action]                      â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚
â”‚  â”‚ Streaks      â”‚  â”‚ XP/Progress  â”‚  â”‚ Timer        â”‚     â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚              â”‚     â”‚
â”‚  â”‚ ðŸ”¥ 7 days    â”‚  â”‚ Today: +150  â”‚  â”‚ Next: 14h    â”‚     â”‚
â”‚  â”‚ Best: 12     â”‚  â”‚ Total: 2,450 â”‚  â”‚ 23m          â”‚     â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚              â”‚     â”‚
â”‚  â”‚ [Visual]     â”‚  â”‚ [Level Bar]  â”‚  â”‚ [Timer]      â”‚     â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚
â”‚                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Mini-Event Preview                                    â”‚  â”‚
â”‚  â”‚ [Event Card with Image/Icon]                         â”‚  â”‚
â”‚  â”‚ [Join/View Details]                                  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Variant C: Mobile-first (Stacked)
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Daily Challenge         â”‚
â”‚                         â”‚
â”‚ [Challenge Title]       â”‚
â”‚ [Description]           â”‚
â”‚                         â”‚
â”‚ [Progress Bar]          â”‚
â”‚                         â”‚
â”‚ [CTA Button]            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Streaks                 â”‚
â”‚ ðŸ”¥ 7 days               â”‚
â”‚ Best: 12 days           â”‚
â”‚ [Visual]                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ XP / Progress           â”‚
â”‚ Today: +150 XP          â”‚
â”‚ Total: 2,450 XP         â”‚
â”‚ [Level Bar]             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Rotation Timer          â”‚
â”‚ Next challenge in:      â”‚
â”‚ 14h 23m                 â”‚
â”‚ [Timer Display]         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Mini-Event Preview      â”‚
â”‚ [Event Card]            â”‚
â”‚ [Action Button]         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2. Component taxonomy

### Atoms (Smallest units)
- `title` â€” Challenge title text
- `label` â€” Section labels, stat labels
- `stat` â€” Numeric display (streak count, XP value)
- `icon` â€” Icon component (fire, trophy, clock)
- `badge` â€” Status/achievement badge
- `timer` â€” Countdown display component
- `CTA` â€” Primary/secondary button
- `progressBar` â€” Progress indicator
- `avatar` â€” User avatar/icon

### Molecules (Composed atoms)
- `challengeSummary` â€” Title + description + progress + CTA
- `streakWidget` â€” Stat + icon + visual indicator + best record
- `xpRow` â€” Today XP + total XP + level progress bar
- `eventPreview` â€” Event card with title, time, action button
- `timerBlock` â€” Label + countdown timer + visual indicator
- `statCard` â€” Container for stat + label + optional icon

### Sections (Full panels)
- `dailyChallengePanel` â€” Main challenge display area
- `dashboardRow` â€” Horizontal container for widgets
- `dashboardColumn` â€” Vertical container for stacked widgets
- `metricsGrid` â€” Grid layout for streaks/XP/timer
- `eventSection` â€” Optional mini-event preview area

---

## 3. Responsive behavior rules

### Mobile (< 768px)
- Stacking: All sections stack vertically
- Order: Challenge â†’ Streaks â†’ XP â†’ Timer â†’ Event (if visible)
- Visibility: Event preview collapses to compact card or hidden
- Spacing: Consistent vertical spacing between sections
- Full-width: All tiles take full width

### Tablet (768px - 1024px)
- Layout: 2-column grid for metrics (Streaks + XP, Timer standalone)
- Challenge: Full-width primary section
- Event: Full-width below metrics or side-by-side with timer
- Collapse: Event preview can toggle expand/collapse

### Desktop (> 1024px)
- Layout: Challenge full-width top, metrics in 3-column grid below
- Event: Full-width below metrics or right sidebar (if space allows)
- Expansion: Challenge section can expand to show full details
- Hover: Interactive states on cards/widgets

### Visibility rules
- Event preview: Hidden by default on mobile, toggleable on tablet+, always visible on desktop if active
- Timer: Always visible, compact on mobile, expanded on desktop
- Streaks: Always visible, simplified on mobile
- XP: Always visible, condensed on mobile

---

## 4. Event feed placement options

### Option 1: Below metrics row (full-width)
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Daily Challenge                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Metrics: Streaks | XP | Timer]     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Recent Events Feed                  â”‚
â”‚ [Event 1] [Event 2] [Event 3]       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Pros:
- Clear separation from challenge content
- Full-width for multiple events
- Natural reading flow

Cons:
- Pushes content down
- Less prominent on long pages

When to prefer: Multiple events, detailed event cards, primary focus on challenge

---

### Option 2: Right sidebar (desktop only)
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Daily Challenge      â”‚ Recent Events â”‚
â”‚                      â”‚               â”‚
â”‚ [Metrics Grid]       â”‚ [Event 1]     â”‚
â”‚                      â”‚ [Event 2]     â”‚
â”‚                      â”‚ [Event 3]     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Pros:
- Efficient use of horizontal space
- Always visible without scrolling
- Side-by-side comparison

Cons:
- Requires desktop width
- Mobile needs separate placement
- Can feel cramped on smaller screens

When to prefer: Desktop-first, limited vertical space, 1â€“2 events

---

### Option 3: Collapsible drawer/accordion
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Daily Challenge                     â”‚
â”‚ [Metrics]                           â”‚
â”‚                                     â”‚
â”‚ â–¼ Recent Activity (3) [Toggle]     â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ [Event 1]                       â”‚ â”‚
â”‚ â”‚ [Event 2]                       â”‚ â”‚
â”‚ â”‚ [Event 3]                       â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Pros:
- Saves space when collapsed
- User controls visibility
- Works on all screen sizes
- Can show count badge

Cons:
- Hidden by default (discoverability)
- Extra interaction required
- May be overlooked

When to prefer: Optional/secondary content, space-constrained layouts, progressive disclosure

---

## Notes for next step

1. Data requirements:
   - Challenge data structure (title, description, progress, requirements)
   - Streak calculation logic
   - XP calculation and leveling system
   - Timer/rotation schedule
   - Event data format

2. State management:
   - Challenge completion state
   - Timer countdown state
   - Event visibility/collapse state
   - Real-time updates for timer/streaks

3. Interactions:
   - Challenge CTA action flow
   - Event join/view flow
   - Expand/collapse animations
   - Progress update animations

4. Accessibility:
   - ARIA labels for timers and progress
   - Keyboard navigation for collapsible sections
   - Screen reader announcements for updates

5. Performance:
   - Timer update frequency (1s vs 1m)
   - Lazy loading for event feed
   - Memoization for stat calculations

Ready for implementation when approved.
