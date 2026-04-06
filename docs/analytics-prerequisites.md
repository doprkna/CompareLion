# Analytics Prerequisites — Microsoft Clarity + GA4

## Goal

Prepare the app for low-friction session insight and analytics before first real testers. This is preparation only, not activation.

---

## Scope

**Include:**
- Microsoft Clarity
- Google Analytics 4

**Exclude:**
- PostHog
- Tag Manager (unless needed later)
- Advanced replay/recording tools
- Implementation details

---

## Why These Tools

- **Clarity** — session replay, heatmaps
- **GA4** — traffic, event analytics
- Simple enough for alpha
- Lower maintenance than heavier stacks

---

## Microsoft Clarity — Prerequisites

- Microsoft account with Clarity access
- Create Clarity project
- Obtain Project ID / tracking code
- Confirm production and staging domain(s)
- Define who has admin access
- Decide when tracking becomes active
- Verify privacy/legal readiness if required
- Note: tracking code will be added to app head/layout later

---

## Google Analytics 4 — Prerequisites

- Google account with Analytics access
- Create GA4 property
- Create web data stream
- Obtain Measurement ID
- Confirm production and staging domain(s)
- Define who has admin/editor access
- Decide whether direct Google tag is used first
- Decide activation moment for first testers
- Verify privacy/legal readiness if required

---

## App / Codebase Prerequisites

- Confirm app uses Next.js App Router
- Identify root layout location for global script placement
- Identify environment variable strategy
- Reserve env vars:
  - `CLARITY_PROJECT_ID`
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Confirm central analytics toggle / feature flag strategy
- Confirm test/staging/prod rollout approach
- Identify where custom analytics events will live
- Identify where route-change tracking will be handled (if needed)
- Identify CSP implications if CSP is enabled

---

## Event Planning Prerequisites

Starter list of events to define before implementation:

| Event | Purpose |
|-------|---------|
| `first_question_answered` | First question answered in session/flow |
| `first_flow_completed` | User completes first flow |
| `report_shown` | Report/comparison result displayed |
| `parallel_opened` | Parallel profile opened |
| `compare_clicked` | Compare action clicked |
| `feedback_submitted` | Feedback form submitted |

Final naming and payload shape must be standardized before coding.

---

## Privacy / Operations Checklist

- Update privacy policy / tester notice if needed
- Decide whether analytics run only for signed-in testers or all visitors
- Decide whether localhost/dev environments are excluded
- Define who reviews Clarity sessions
- Define who reviews GA4 events/funnels

---

## Deferred Until Later

- No implementation yet
- No package install yet (unless chosen during implementation)
- No advanced custom event architecture yet
- No screen recording tool beyond Clarity
- No auto-capture bug reporting integration yet
