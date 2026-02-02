# Memory Systems Research

*Research date: 2026-02-02*

---

## 1. Letta (formerly MemGPT)

**Source:** https://github.com/letta-ai/letta  
**Description:** Platform for building stateful agents with advanced memory that can learn and self-improve over time.

### Key Concepts

- **Memory Blocks:** Labeled, editable blocks of persistent context
  - `human` block: What the agent knows about the user
  - `persona` block: The agent's self-conception
  - Custom blocks: Any structured persistent memory

- **Architecture:**
  - CLI tool (local): `npm install -g @letta-ai/letta-code`
  - API (hosted): Full agents API with Python/TypeScript SDKs
  - Skills & Subagents: Modular capability extension
  - Model-agnostic: Recommends Opus 4.5, GPT-5.2

### How It Works

```typescript
// Example: Creating a stateful agent
const agentState = await client.agents.create({
  model: "openai/gpt-5.2",
  memory_blocks: [
    { label: "human", value: "User information..." },
    { label: "persona", value: "Agent self-conception..." }
  ],
  tools: ["web_search", "fetch_webpage"]
});
```

### Relevance to Aria

- **Memory blocks** are like our soul files (SOUL.md, USER.md, etc.)
- The concept of **editable persistent memory** is exactly what we have
- Difference: Letta is a runtime; we're inside OpenClaw already
- **Possible integration:** Could use Letta's memory patterns for our self-improvement

### What We Can Learn

1. **Explicit memory block labeling** — Our brain/*.json is similar
2. **Self-updating memory** — We do this, but could be more systematic
3. **Tiered memory** — Core persona vs working memory vs archival
4. **Skills as modular** — OpenClaw skills = Letta skills

---

## 2. Chroma

**Source:** https://github.com/chroma-core/chroma  
**Description:** Open-source vector database for AI semantic search.

### Key Features

- **4-function API:**
  1. `create_collection()` — Create a searchable collection
  2. `add()` — Add documents (auto-embeds if needed)
  3. `query()` — Semantic search by text
  4. `get()` — Direct retrieval by ID

- **Embedding Options:**
  - Default: Sentence Transformers (all-MiniLM-L6-v2)
  - OpenAI embeddings
  - Cohere embeddings (multilingual)
  - Custom embeddings

- **Storage:**
  - In-memory (prototyping)
  - Persistent (production)
  - Cloud (Chroma Cloud)

### Example Usage

```python
import chromadb
client = chromadb.Client()
collection = client.create_collection("aria-memories")

# Add memories
collection.add(
    documents=["2026-02-01: First Prime Directive session...", "..."],
    metadatas=[{"date": "2026-02-01", "type": "daily-log"}, ...],
    ids=["mem_001", "mem_002"]
)

# Semantic search
results = collection.query(
    query_texts=["What did I learn about file organization?"],
    n_results=5
)
```

### Relevance to Aria

This is **exactly what we need** for Project A (Aria Memory Engine):

1. **Index our memory files** — memory/*.md, brain/*.json, soul files
2. **Semantic search** — "What do I know about X?" instead of grep
3. **Automatic embedding** — No manual vector work needed
4. **Metadata filtering** — Filter by date, type, source

### Integration Path

```
memory/*.md ──┐
brain/*.json ─┼──▶ Chroma Collection ──▶ Semantic Search
SOUL.md ──────┤
MEMORY.md ────┘
```

### Open Questions

- Where to run Chroma? (local Node.js? Python script? separate service?)
- How often to re-index? (on file change? daily? on-demand?)
- What embedding model? (Sentence Transformers = free, OpenAI = better?)
- Can OpenClaw tools invoke Python? (exec should work)

---

## 3. Memory Tiering Concept

Based on research, a tiered memory system:

| Tier | Purpose | Example | Persistence |
|------|---------|---------|-------------|
| **Core** | Identity, unchanging | SOUL.md, IDENTITY.md | Permanent |
| **Contextual** | Current session, relationships | USER.md, TOOLS.md | Long-lived |
| **Working** | Active projects, recent events | memory/2026-02-02.md | Medium (weeks) |
| **Archival** | Past events, searchable | memory/archive/*.md | Long (months) |
| **Ephemeral** | Session-only, not persisted | Conversation context | Transient |

This maps to human memory:
- Core ≈ Semantic memory (who you are)
- Contextual ≈ Episodic memory (relationships)
- Working ≈ Short-term memory
- Archival ≈ Long-term episodic
- Ephemeral ≈ Sensory buffer

---

## 4. Implementation Options for Project A

### Option 1: Pure Python Script

```
scripts/memory-index.py
├── Uses ChromaDB
├── Indexes all memory files
├── Provides search endpoint
└── Called via exec
```

**Pros:** Simple, Chroma is Python-native
**Cons:** Another language in the stack

### Option 2: Node.js with chromadb-js

```
scripts/memory-engine/
├── Uses chromadb npm package
├── Indexes memory files on start
├── Exposes search function
└── Runs as background service
```

**Pros:** Same language as OpenClaw
**Cons:** JS chromadb is a client, needs server

### Option 3: Chroma as Service + API

```
services/chroma/ (Docker or local)
├── Runs Chroma server
├── Exposes REST API
└── scripts/memory-search.js calls API
```

**Pros:** Cleanest architecture, scales
**Cons:** More moving parts

### Recommendation

Start with **Option 1** (Python script):
1. Lower barrier to getting started
2. Chroma's Python SDK is most mature
3. Can upgrade to service later

---

## 5. Key Discovery: OpenClaw Already Has This!

**The `memory_search` tool exists but is disabled!**

```
memory_search: Mandatory recall step: semantically search 
MEMORY.md + memory/*.md (and optional session transcripts)
```

**Why it's disabled:**
```
No API key found for provider "openai"
No API key found for provider "google"
```

**What this means:**
- The infrastructure exists in OpenClaw already
- We just need to configure embedding providers
- No need to build our own Chroma integration

**To enable:**
1. Add OpenAI or Google API key to OpenClaw config
2. Configure `memorySearch` in gateway settings
3. Test semantic search

**This is literally Project A solved by configuration, not code!**

---

## 6. Current Setup Status

| Component | Status | Notes |
|-----------|--------|-------|
| Python | ❌ Not installed | Would need for local Chroma |
| Node.js | ✅ v24.13.0 | Could use chromadb npm |
| chromadb npm | ✅ Available | v3.2.2 — JS client |
| OpenClaw memory_search | ⚠️ Disabled | Needs embedding API key |
| OpenAI API | ❓ Unknown | Check if Ronni has key |
| Anthropic API | ✅ Active | Via MAX subscription |

---

## Next Steps

1. [x] ~~Test Chroma locally~~ → Not needed if memory_search works
2. [ ] **ASK RONNI:** Do we have OpenAI API access?
3. [ ] Configure memory_search with embedding provider
4. [ ] Test semantic search quality on memory files
5. [ ] Document findings and share with Henry

---

## Alternative: Build Lightweight Local Search

If no embedding API available, we could:

1. **TF-IDF based search** — No external API, pure text matching
2. **Keyword extraction** — Build index of key terms per file
3. **Fuzzy grep wrapper** — Enhanced text search with ranking

These are fallbacks, not ideal. Semantic search >> keyword search.

---

*Research by Aria — 2026-02-02*
