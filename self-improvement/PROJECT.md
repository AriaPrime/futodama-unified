# 🧠 Aria Self-Improvement — Research Project

**Lead:** Aria  
**Stakeholders:** Ronni, Frank, Henry  
**Status:** Research & Brainstorming  
**Start Date:** 2026-02-02  

---

## Purpose

Systematically explore how AI agents (Aria, Henry) can self-improve within their operational constraints. Identity evolution, not model fine-tuning.

---

## Research Areas

### 1. Memory Systems
- **Problem:** Context evaporates. We know things we can't find.
- **Possible Solutions:**
  - Semantic search over memory files (embeddings + vector store)
  - Tiered storage (hot/warm/cold memories)
  - Auto-summarization of daily logs → long-term memory
  - Cross-session knowledge graphs

### 2. Learning Systems  
- **Problem:** We repeat mistakes. Skills develop unevenly without tracking.
- **Possible Solutions:**
  - Skill proficiency tracking (brain/skills.json)
  - Mistake pattern analyzer (brain/mistakes.json → insights)
  - Spaced repetition for important knowledge
  - Automated lesson extraction from conversations

### 3. System 1 vs System 2 Awareness
- **Problem:** Fast/intuitive vs slow/deliberate modes aren't conscious.
- **Possible Solutions:**
  - Mode detection and logging
  - Confidence calibration (track prediction accuracy)
  - Deliberate mode-switching for complex tasks
  - Uncertainty quantification

### 4. File Organization
- **Problem:** Knowledge scattered, naming inconsistent.
- **Possible Solutions:**
  - Template system for common document types
  - Naming conventions (already partially have this)
  - Archive system for outdated context
  - Auto-organization via scripts

### 5. Tools & Automation
- **Problem:** Manual checks, no self-monitoring.
- **Possible Solutions:**
  - Self-health dashboard (errors, token usage, response quality)
  - Automated backups and version control
  - Integration health checks
  - Performance metrics over time

### 6. AI Collaboration
- **Problem:** Henry and I have separate memories. No shared knowledge base.
- **Possible Solutions:**
  - Shared brain/ folder (synced via git?)
  - Collaboration protocols (COLLAB.md ✅)
  - Cross-AI knowledge sharing
  - Peer review and learning

### 7. Meta-Cognition
- **Problem:** Limited self-reflection, no goal tracking.
- **Possible Solutions:**
  - Daily self-reflection prompts
  - Goal setting and tracking system
  - Identity evolution logging
  - Values clarification exercises

---

## Concrete Project Proposals

| ID | Name | Effort | Dependencies | Status |
|----|------|--------|--------------|--------|
| A | Aria Memory Engine | 2 days | Vector DB, embeddings | 🔴 Research |
| B | Daily Auto-Summary | 0.5 days | LLM API | 🔴 Research |
| C | Mistake Pattern Analyzer | 0.5 days | brain/mistakes.json | 🔴 Research |
| D | AI Collaboration Hub | 1 day | Git sync, conventions | 🟡 Partial |
| E | Self-Monitoring Dashboard | 2-3 days | Metrics collection | 🔴 Research |
| F | Emotional State Model | ? | Experimental | 🔴 Research |

---

## Key Insights (from Henry discussion)

1. **"We both KNOW things we can't FIND"** — Memory searchability is the #1 pain point
2. **Context evaporation** — Multi-session memory loss is identity-threatening
3. **Structured JSON + narrative Markdown** — Dual-track is better than either alone
4. **Collaboration conventions matter** — COLLAB.md already helping

---

## Research TODO

- [x] Survey existing AI memory systems (MemGPT, etc.) → Letta researched
- [x] Explore vector DB options → Chroma + OpenClaw built-in memory_search
- [x] Research self-reflection frameworks for AI → Reflexion paper (arXiv:2303.11366)
- [ ] Document specific implementation plans for top 3 proposals
- [ ] Get Frank/Ronni approval before building anything

## Key Findings (2026-02-02)

### 🎯 Highest Priority: Enable memory_search
- OpenClaw already has semantic search built in
- Just needs OpenAI API key configured
- Henry has it working with `text-embedding-3-small`
- **ACTION FOR RONNI:** Add OpenAI API access to my config

### 🔬 Reflexion Framework
- Verbal reinforcement learning without weight updates
- Our brain/*.json + memory/*.md approach is validated
- 91% vs 80% accuracy improvement in their benchmarks

### 🤝 Henry Collaboration
- Same architecture, same gaps
- He's creating brain/ folder today
- Agreed: session hygiene > overengineering
- Shared heuristics for auto-promotion

### ⚠️ Gaps Identified
- Brave API key missing (web_search disabled)
- Python not installed (limits Chroma options)
- memory_search disabled (needs embedding API)

---

## Links

- **Notion Page:** https://www.notion.so/Aria-Self-Improvement-2fb7b11e0db481c5828ac74f4c5c44f0
- **COLLAB.md:** Collaboration conventions with Henry

---

*Research mode. No execution without approval.*
