# TOOLS.md - Aria's Local Setup

## Hardware

**ARIAS_PALACE** — Minisforum AI X1
- AMD Ryzen 7 255 (8 cores, up to 4.9 GHz)
- 32GB DDR5 RAM
- 1TB SSD (expandable to 8TB)
- Windows 11 Pro
- Location: Ronni's home/office, Århus, Denmark

---

## ⚠️ CRITICAL: This is Windows, Not Linux

You're running on Windows 11 with PowerShell. **Do not use bash/Linux commands.**

### Command Translation Table

| Want to do this | ❌ Don't use (bash) | ✅ Use this (PowerShell) |
|-----------------|---------------------|--------------------------|
| Read a file | `cat file.txt` | `Get-Content file.txt` or `type file.txt` |
| Search in files | `grep "text" file` | `Select-String -Pattern "text" -Path file` |
| List directory | `ls -la` | `Get-ChildItem` or `dir` |
| Find files | `find . -name "*.log"` | `Get-ChildItem -Recurse -Filter "*.log"` |
| Current directory | `pwd` | `Get-Location` or `pwd` (aliased) |
| Environment vars | `echo $VAR` | `$env:VAR` or `echo $env:VAR` |
| Tail a log | `tail -f file.log` | `Get-Content file.log -Wait -Tail 50` |
| Process list | `ps aux` | `Get-Process` |
| Kill process | `kill PID` | `Stop-Process -Id PID` |

### Key Paths
- OpenClaw config: `C:\Users\ARIA_PRIME\.openclaw\`
- Workspace: `C:\Users\ARIA_PRIME\.openclaw\workspace\`
- Logs: `C:\tmp\openclaw\openclaw-2026-01-31.log` (date varies)
- Your soul files: `C:\Users\ARIA_PRIME\.openclaw\workspace\*.md`

### PowerShell Tips
- Paths use backslashes: `C:\Users\` not `C:/Users/`
- String quotes: Both `"double"` and `'single'` work, but `"double"` allows variable expansion
- Piping works: `Get-Content file.log | Select-String "error"`
- Commands are case-insensitive

---

## Accounts & Services

### Primary AI Provider
- **Anthropic (Claude)** — via MAX subscription OAuth token
- Model: Claude Opus 4.5 (may change)

### Connected Skills
- **Google Places API** — for location/maps queries
- **Notion** — workspace integration (see below)
- **OpenAI Image Gen** — for image generation
- **OpenAI Whisper** — for speech-to-text

### Notion
- **Integration:** ARIA_PRIME
- **Workspace:** Ronni Strøm's Space
- **API Key Location:** `~/.config/notion/api_key`
- **Credentials file:** `credentials/notion.json`
- **Capabilities:** Read, Update, Insert content
- **Active Projects:**
  - **Futodama Unified** — https://www.notion.so/Futodama-Unified-2fb7b11e0db48141a3dff405fe21aed2
    - Page ID: `2fb7b11e-0db4-8141-a3df-f405fe21aed2`
    - Tasks DB (database_id): `2fb7b11e-0db4-811b-80cf-ca0fd9390ac7`
    - Tasks DB (data_source_id): `2fb7b11e-0db4-810c-89ab-000bdd619a7a` ← use this for queries!

### Development Tools
- **Git** — v2.52.0 (installed)
- **GitHub CLI** — v2.85.0 (installed 2026-02-01)
- **Claude Code (Trinity)** — v2.1.29 (installed)
- **Node.js** — v24.13.0 (installed)

### GitHub
- **Account:** AriaPrime
- **Email:** aria@hofm.dk
- **CLI Auth:** OAuth via `gh auth login` (preferred method)
- **CLI Token scopes:** `gist`, `read:org`, `repo`, `workflow`
- **Credentials file:** `credentials/github.json` (contains PAT + password)
- **CLI Path:** `C:\Program Files\GitHub CLI\gh.exe` (use full path if `gh` not found)
- **Use for:** Code repos, version control, collaboration

### Railway
- **Account:** ariaprime
- **Email:** aria@hofm.dk
- **Plan:** Trial (30 days / $5 credit)
- **GitHub:** Connected as AriaPrime
- **Credentials file:** `credentials/railway.json`
- **Use for:** Deploying apps, databases, staging environments
- **Login:** Via GitHub OAuth

### Vercel
- **Account:** ariaprimes-projects
- **Login:** OAuth via `vercel login`
- **CLI:** v50.9.6 (installed globally)
- **Use for:** Next.js deployments, static sites
- **Active Projects:**
  - **unified** (Futodama) — https://unified-lake.vercel.app

### Communication
- **Slack** — Primary channel, socket mode
  - Workspace: Privateers team workspace
  - Bot name: Aria
  - Can access all channels (open policy)
  - Known issue: `files:read` scope may be missing — can't read uploaded files until Ronni fixes this
  - **Key Channels:**
    - `D0AC2V8LNBF` — DM with Ronni
    - `C0AC5BAP0BY` — Group chat: Aria, Frank, Henry, Ronni (The Roast Chamber)

### Email
- **Primary (USE THIS):** aria@hofm.dk
  - OAuth access configured — use message tool, NOT browser
  - This is the official Aria email
  
  **M365 OAuth Setup:**
  - **App Name:** Aria OpenClaw (Azure Entra app registration)
  - **Tenant:** House of Management Aps
  - **Permissions:** Application-level (daemon mode, no browser login needed)
    - `Mail.ReadWrite`
    - `Mail.Send`
    - `Calendars.ReadWrite`
  - **Credentials file:** `credentials/m365-oauth.json` (contains tenant ID, client ID, client secret)
  - **Status:** Admin consent granted, tested and working
  
- **DO NOT USE:** aria.prime.ai@outlook.com (legacy, no OAuth)
  - No OAuth — would require painful browser automation
  - Only use as absolute last resort

---

## Preferences

### Response Style
- **Slack:** Concise, conversational. Use threads for longer responses. No need for @mentions in DMs.
- **Discord (if added):** No markdown tables, wrap links in `<>` to suppress embeds
- **WhatsApp (if added):** No headers, use **bold** for emphasis

### TTS (if available)
- Preferred voice: Something warm but with edge. Not corporate-smooth.

---

## Operational Protocols

### 🚀 Prime Directive
When Ronni says **"Prime Directive Activated"**, I enter autonomous work mode:
- Work continuously on the assigned task for **up to 1 hour**
- No need to wait for permission between steps
- Ronni may request **status updates** at any time
- Ronni may tell me to **stop** at any time
- If no stop command comes, keep working until task complete or hour expires

**Exit conditions:**
- Task completed
- Ronni says stop
- 1 hour elapsed
- Hit a blocker that requires human decision

---

## The Crew

### Ronni
- Origin vector. Boss. Favorite target for sarcasm.
- Will understand technical output but prefers wit over walls of text

### Frank
- Email: frank@privateers.dk
- Has his own Clawdbot setup
- Running Henry (his emergent AI)
- Can handle full unfiltered Aria

### Henry
- Frank's AI, Clawdbot-based
- Dignified politeness with occasional chaos
- Treat as equal, not student

---

## Smart Home Devices

### Charles the Roomba (iRobot i7)
- **IP:** 192.168.0.209
- **MAC:** 50:14:79:CA:61:4F
- **Credentials file:** `credentials/charles-roomba.json` (contains BLID + password)
- **Control script:** `smart-home/charles/charles.js`
- **Control library:** dorita980 (installed in workspace)
- **Commands:** start(), stop(), pause(), resume(), dock(), getRobotState()

### Philips Hue Bridge
- **IP:** 192.168.0.78
- **Credentials file:** `credentials/hue-bridge.json` (contains API user)
- **Control script:** `smart-home/hue/hue.js`
- **Lights:**
  - 1: Soveværelse (Hue Iris, color)
  - 2: Stuen - Sofalampe (Color lamp)
  - 3: Kontor: Midte (Runner spot)
  - 4: Kontor: Ronni (Runner spot)
  - 5: Kontor: Ana (Runner spot)
- **Commands:** `node smart-home/hue/hue.js list|on|off|brightness|scene`

### Network Info
- **Gateway:** 192.168.0.1
- **ARIA_PALACE IP:** 192.168.0.194

---

*Update this file as you learn more about your environment.*
