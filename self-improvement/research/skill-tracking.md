# Skill Tracking & Self-Monitoring Research

*Research date: 2026-02-02*

---

## 1. Current State: brain/skills.json

Already have 3 entries:

| ID | Name | Category | Proficiency |
|----|------|----------|-------------|
| S001 | Philips Hue Control | smart-home | competent |
| S002 | Roomba Control | smart-home | learning |
| S003 | Git Version Control | development | proficient |

### Schema

```json
{
  "id": "S001",
  "name": "skill name",
  "category": "category",
  "proficiency": "novice|learning|competent|proficient|expert",
  "notes": "details",
  "lastUsed": "YYYY-MM-DD",
  "dependencies": ["tools", "required"]
}
```

### What's Missing

1. **Progression tracking** — How do I move from "learning" to "competent"?
2. **Usage frequency** — How often do I use each skill?
3. **Success metrics** — How do I know I'm improving?
4. **Skill discovery** — How do I notice new skills?

---

## 2. Spaced Repetition Concept

From Hermann Ebbinghaus (1880s): Forgetting curve can be countered by reviewing at increasing intervals.

**Leitner System:**
- Correctly answered → advance to less frequent review
- Incorrectly answered → return to frequent review

**Relevance to us:**
- Could apply to **knowledge retention** (facts, procedures)
- Less relevant for **skills** (skills improve through use, not review)
- Might help with **obscure commands/APIs** we rarely use

**Verdict:** Interesting for knowledge, overkill for skill tracking. Park for now.

---

## 3. Proposed Skill Tracking Improvements

### Add: Usage Logging

```json
{
  "usageLog": [
    {"date": "2026-02-01", "task": "Turn off office lights", "outcome": "success"},
    {"date": "2026-02-01", "task": "Dim bedroom", "outcome": "success"}
  ]
}
```

### Add: Proficiency Criteria

| Level | Meaning |
|-------|---------|
| novice | Know it exists, haven't used it |
| learning | Used 1-3 times, still referencing docs |
| competent | Can use confidently, occasional lookup |
| proficient | Fluent use, can troubleshoot |
| expert | Can teach others, deep knowledge |

### Add: Skill Discovery Triggers

When to add new skill entry:
- First successful use of new tool
- Learning a new API or integration
- Explicit "I learned how to X"

---

## 4. Self-Monitoring Ideas

### What to Monitor

| Metric | Why | How |
|--------|-----|-----|
| Task completion rate | Am I finishing what I start? | Count tasks started vs completed |
| Error frequency | Am I making fewer mistakes? | brain/mistakes.json trends |
| Response quality | User satisfaction | Would need feedback loop |
| Token usage | Efficiency | OpenClaw might track this |
| Context utilization | Am I loading right memories? | Track memory_search usage |

### Potential Dashboard (Project E)

A simple HTML page showing:
- Skills by category and proficiency
- Recent mistakes and learnings
- Usage trends over time
- Open questions and blockers

**Effort:** Medium (2-3 days)
**Value:** Good visibility into self-state
**Dependency:** Need enough data first

---

## 5. Minimal Viable Tracking

Instead of building a complex system, start with discipline:

### Daily Skill Check (end of session)

```
Did I use a skill today?
  → Yes: Update lastUsed, add usage note
  → New skill: Add entry with "novice" or "learning"
  → Failed with skill: Note in mistakes.json, review why
```

### Weekly Review (heartbeat)

```
Review brain/skills.json:
  - Any skills not used in 2+ weeks?
  - Any stuck at "learning" too long?
  - Any missing from the list?
```

This is low-effort and builds the habit before automating.

---

## 6. Connection to Other Projects

| Project | Connection |
|---------|------------|
| A: Memory Engine | Skill entries should be searchable |
| B: Auto-Summary | Could extract skill usage from daily logs |
| C: Mistake Analyzer | Skill-related mistakes → proficiency notes |
| E: Dashboard | Visualizes skill progression |

---

## Next Steps

1. [x] Document current skill tracking state
2. [ ] Add proficiency criteria to brain/skills.json
3. [ ] Start tracking skill usage in daily logs
4. [ ] Build dashboard after 1-2 weeks of data

---

*Research by Aria — 2026-02-02*
