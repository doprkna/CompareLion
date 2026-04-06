# C21: Arc System (Internal Flow Engine)

**Version:** v0.47.17  
**Aligns with:** Flow Choice (C18), Distance Rules (C19), Tag System, Post-Flow Insights

## Concept

An **Arc** is an internal sequencing structure used to generate question flows.  
Users interact with **Flows**, while **Arcs operate internally** to organize question progression.

Arcs ensure that questions follow a coherent narrative path instead of appearing randomly.

---

## Relationship to Flow System

```
Flow (user-visible)
  → Arc generation (internal sequencing)
  → Question delivery
  → Insight checkpoints
```

Flow topics are selected by users via the Flow Choice system (C18).

**Example:**

- User chooses "Work & Career"
- System generates Arc:  
  career satisfaction → ambition → promotion → salary expectations → work-life balance

---

## Flow Length

Flows can be longer than traditional short arcs.

| Type   | Count    |
|--------|----------|
| Minimum | 4 questions |
| Common  | 8–12 questions |
| Maximum | ~20 questions |

Users should never feel stuck in a long survey. To prevent fatigue, flows include **insight checkpoints**.

---

## Insight Checkpoints

After several questions, the system pauses to show insights.

**Checkpoint frequency:** every 7–10 questions

**Checkpoint examples:**
- comparison insight
- surprising statistic
- parallels discovery
- disagreement highlight
- progress stats

**Example:**
> "You answered 8 questions about work."  
> "68% of people like you would change jobs for more freedom."

**User options at checkpoint:**
- Continue flow
- Return to Flow Choice
- Share insight

---

## Final Flow Report

When the flow ends, show a final summary.

**Elements:**
- topic summary
- key comparison insights
- parallel matches
- surprising disagreements
- shareable card

This acts as the final reward moment.

---

## Arc Structure (4-Step Narrative Model)

Each arc should follow a psychological progression.

| Step | Type | Purpose |
|------|------|---------|
| 1 | **Entry Question** | Light and accessible; pulls user into the topic |
| 2 | **Context Question** | Builds relevance and personal context |
| 3 | **Reflection Question** | Encourages deeper thought or self-comparison |
| 4 | **Comparison Trigger** | Creates insight potential for reports and statistics |
| 5 (optional) | **Wildcard Question** | Unexpected or provocative; adds energy |

This structure increases completion rates and insight quality.

---

## Arc Generation Rules

Arc generation must respect:
- **Distance rules** (C19)
- **Tag similarity**
- **Question history**
- **Flow topic branch**

Questions should feel connected but not repetitive.

---

## Design Guidelines

Good arcs should:
- start light
- gradually deepen
- avoid repeating wording
- create insight opportunities
- support meaningful comparisons

---

## Performance Requirements

Arc generation must remain cheap.

**Rules:**
- No heavy queries
- No AI calls
- Pre-filter candidate questions
- Use tags and categories for fast selection

Flow must start instantly.

---

## Integration Points

| System | Role |
|--------|------|
| Flow Choice (C18) | Topic selection, flow start |
| Distance Rules (C19) | Prevent similar questions clustering |
| Tag System | Semantic grouping, flow generation |
| Parallels (C16) | Post-flow insight, comparison |
| Skip Topic Suggestion | Graceful exit to Flow Choice |

---

## Goal

Transform question answering into structured thematic exploration.

Users should feel like they are entering meaningful topic journeys instead of answering isolated questions.
