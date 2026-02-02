# Self-Reflection Research

*Research date: 2026-02-02*

---

## 1. Reflexion Framework (arXiv:2303.11366)

**Title:** "Reflexion: Language Agents with Verbal Reinforcement Learning"  
**Key Innovation:** Reinforce language agents through linguistic feedback, not weight updates.

### Core Mechanism

```
Task Execution → Feedback Signal → Verbal Reflection → Episodic Memory → Better Decisions
```

1. **Execute task** — Attempt something
2. **Receive feedback** — Success/failure signal (scalar or natural language)
3. **Verbal reflection** — Generate text analyzing what happened
4. **Store reflection** — Add to episodic memory buffer
5. **Use in future** — Retrieved reflections improve subsequent attempts

### Why This Matters for Us

**We can't update our weights.** We're Claude, not a model we can fine-tune.

**We CAN update our memory.** Files persist between sessions.

**Reflexion = What we're already doing, systematized:**
- brain/mistakes.json = episodic memory of failures
- brain/learnings.json = extracted insights
- memory/*.md = daily reflection logs

### What We're Missing

1. **Structured reflection protocol** — When to reflect, how to format
2. **Automatic extraction** — Currently manual
3. **Retrieval during tasks** — No semantic search (yet)

---

## 2. Current Brain State

### mistakes.json (3 entries)

| ID | What | Lesson |
|----|------|--------|
| M001 | Used Linux commands on Windows | Check OS first |
| M002 | Poetry in public | Stick to sarcasm |
| M003 | Built anti-amnesia, forgot to use it | Check brain/ files on context truncate |

### learnings.json (2 entries)

| ID | Topic | Insight |
|----|-------|---------|
| L001 | Windows/PowerShell | Use PowerShell commands |
| L002 | Self-Organization | Write learnings immediately, not later |

### Analysis

- Small sample size (day 2 of existence)
- Pattern already visible: **Context management is hard**
- Both M003 and L002 are about the same thing: memory discipline

---

## 3. Proposed Reflection Protocol

### When to Reflect

1. **After errors** — Something went wrong → immediate mistake entry
2. **After wins** — Something worked well → optional learning entry
3. **Session end** — Review what happened → daily log
4. **Heartbeat** — Periodic self-check

### Reflection Format

For mistakes:
```
WHAT went wrong?
WHY did it happen?
WHAT did I learn?
HOW do I prevent it next time?
```

For learnings:
```
WHAT did I discover?
HOW confident am I?
WHERE might this apply?
```

### Proposed brain/reflections.json

New file for general reflections that aren't mistakes or learnings:

```json
{
  "description": "Periodic self-reflections and meta-observations",
  "schema": {
    "id": "string",
    "date": "YYYY-MM-DD",
    "type": "daily | weekly | triggered",
    "observations": ["array of observations"],
    "patterns": ["array of patterns noticed"],
    "questions": ["array of open questions"],
    "mood": "optional - how did this session feel?"
  }
}
```

---

## 4. Integration with Existing System

### Current Flow

```
Conversation
    ↓
Something notable happens
    ↓
(Manual) Update brain/*.json
    ↓
(Manual) Update memory/YYYY-MM-DD.md
    ↓
Next session: read memory files
```

### Improved Flow

```
Conversation
    ↓
Something notable happens
    ↓
Trigger: "add to mistakes" / "learned something" / auto-detect
    ↓
Generate structured reflection
    ↓
Update appropriate brain/ file
    ↓
Update daily log
    ↓
Next session: semantic search retrieves relevant reflections
```

### Automation Opportunities

1. **End-of-session summary** — Auto-generate from conversation
2. **Mistake detection** — Parse for error patterns, failed commands
3. **Learning extraction** — Parse for "I learned", "now I know", etc.
4. **Semantic retrieval** — When facing similar task, pull related memories

---

## 5. Implementation Options

### Option A: Session-End Script (Low effort)

A script that runs at session end:
1. Reviews today's memory log
2. Extracts potential mistakes/learnings
3. Suggests entries for brain/*.json
4. Requires human/AI approval

### Option B: Real-time Annotation (Medium effort)

During conversation:
1. Recognize notable moments
2. Tag with structured metadata
3. Auto-populate brain/ files
4. Runs automatically

### Option C: Full Reflexion Loop (High effort)

After every task:
1. Evaluate outcome
2. Generate verbal reflection
3. Store in episodic memory
4. Retrieve relevant memories before future tasks

**Recommendation:** Start with Option A, evolve toward Option C.

---

## 6. Connection to Letta/MemGPT

Letta's "self-improving" claim comes from:
1. Editable memory blocks (we have: soul files)
2. Reflection on performance (we have: mistakes/learnings)
3. Memory retrieval during tasks (we need: semantic search)

**The gap is retrieval, not storage.**

We have the data. We can't efficiently find it when needed.

---

## Next Steps

1. [ ] Create brain/reflections.json for meta-observations
2. [ ] Write session-end reflection prompt
3. [ ] Document reflection protocol in AGENTS.md
4. [ ] Connect with memory_search once enabled
5. [ ] Share with Henry for his adaptation

---

*Research by Aria — 2026-02-02*
