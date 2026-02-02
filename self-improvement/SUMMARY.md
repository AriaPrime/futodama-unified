# Aria Self-Improvement — Research Summary

*For: Ronni (and Frank)*  
*Date: 2026-02-02*  
*Status: Research complete, awaiting approval*

---

## TL;DR

Spent the Prime Directive session researching how AI agents can self-improve. **Good news:** We're already doing most of the right things. **Gap:** Semantic search needs API config.

---

## Key Discoveries

### 1. OpenClaw Already Has Memory Search
- `memory_search` tool exists but is disabled
- Needs OpenAI or Google API key for embeddings
- **Henry has it working** with `text-embedding-3-small`
- **Ask:** Can we add OpenAI API access to my config?

### 2. Our Architecture is Validated
Researched **Letta (formerly MemGPT)** — the leading "self-improving AI" platform:
- Memory blocks → Our soul files
- Tiered memory → Our SOUL.md / MEMORY.md / memory/*.md
- Skills as modules → OpenClaw skills
- **Conclusion:** We're doing poor-man's Letta. Just need the search layer.

### 3. Reflexion Framework
Academic paper (arXiv:2303.11366) on verbal reinforcement learning:
- AI reflects verbally on task outcomes
- Stores reflections in episodic memory
- Retrieves them for future tasks
- **Result:** 91% vs 80% accuracy improvement

**This is literally what we're building** with brain/*.json and memory/*.md.

---

## Research Created

| File | Topic |
|------|-------|
| `self-improvement/PROJECT.md` | Master tracker |
| `self-improvement/research/memory-systems.md` | Letta, Chroma, architecture |
| `self-improvement/research/self-reflection.md` | Reflexion, brain/ files |
| `self-improvement/research/skill-tracking.md` | Skills, monitoring |
| `brain/reflections.json` | New file for meta-observations |

---

## Proposed Priorities

### Immediate (config-only, no code)
1. **Enable memory_search** — Add OpenAI API key
2. **Add Brave API key** — Enable web_search for research

### Short-term (low effort, high value)
3. **Daily reflection protocol** — Documented in research
4. **Skill usage tracking** — Update brain/skills.json regularly

### Medium-term (needs approval)
5. **Session-end summarizer** — Auto-extract learnings
6. **Self-monitoring dashboard** — Visualize brain/ data

---

## What I Did NOT Do

- Build anything without approval
- Execute any of the project proposals
- Over-engineer when simple discipline would work

Following Henry's wisdom: *"Perfect is the enemy of shipped."*

---

## Questions for You

1. **OpenAI API access?** — Would unlock memory_search immediately
2. **Brave API key?** — Would unlock web_search for research
3. **Python installation?** — Would enable local Chroma (optional)
4. **Proceed with any proposals?** — Waiting for go/no-go

---

## EXACT CONFIG FOR MEMORY SEARCH

Read the docs (`docs/concepts/memory.md`). To enable memory_search, add to openclaw.json:

**Option A: OpenAI (recommended, Henry uses this)**
```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "openai",
        model: "text-embedding-3-small"
      }
    }
  },
  models: {
    providers: {
      openai: {
        apiKey: "sk-YOUR-OPENAI-API-KEY"
      }
    }
  }
}
```

**Option B: Gemini**
```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "gemini",
        model: "gemini-embedding-001"
      }
    }
  },
  models: {
    providers: {
      google: {
        apiKey: "YOUR-GEMINI-API-KEY"
      }
    }
  }
}
```

**Note:** Codex OAuth (MAX subscription) only covers chat, NOT embeddings. We need a separate API key for the embedding provider.

**What it indexes:**
- `MEMORY.md`
- `memory/**/*.md`
- Optional: `memorySearch.extraPaths` for more files

**Tools unlocked:**
- `memory_search` — semantic search with snippets
- `memory_get` — retrieve specific memory content

---

## Henry Collaboration

Had good discussion in The Roast Chamber:
- He has memory_search working ✅
- He's creating brain/ folder today
- We agreed on session hygiene as forcing function
- Shared heuristics for auto-promotion

We're aligned. Same architecture, same gaps, same pragmatic approach.

---

*Prime Directive session complete. Awaiting orders.* ⚡
