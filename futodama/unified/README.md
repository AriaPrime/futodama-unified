# Futodama Unified

AI-powered CV analysis and improvement platform for DIS/CREADIS consultants.

## Features

- **📄 Document Parsing** - Extracts text from PDF and Word documents
- **🧠 AI Analysis** - Uses Claude to parse CV structure and identify sections
- **📊 Quality Analyzers** - Density, temporal, and structural analysis
- **✨ Smart Observations** - AI-phrased improvement suggestions
- **🎯 Guided Editing** - Claim blocks and sentence starters for improvements
- **🌿 Gardener Draft** - One-click AI improvement for any section
- **🇩🇰 Bilingual** - Full English and Danish support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + DIS/CREADIS Design System
- **UI Components**: Radix UI
- **AI/LLM**: Anthropic Claude
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- Anthropic API key

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Anthropic API key to .env.local
# ANTHROPIC_API_KEY=sk-ant-...

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/cv/            # API routes
│   │   ├── analyze/       # CV analysis endpoint
│   │   ├── apply-claims/  # Apply improvements
│   │   └── gardener-draft/# AI auto-improvement
│   ├── globals.css        # DIS/CREADIS design system
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── cv/                # CV-specific components
│   │   ├── CVTab.tsx      # Main CV tab container
│   │   ├── CVUploader.tsx # File upload
│   │   ├── CVSections.tsx # Section display
│   │   ├── RoleCard.tsx   # Individual section card
│   │   ├── CVHealthWidget.tsx # Sidebar health widget
│   │   └── GuidedEditor.tsx   # Improvement editor
│   └── ui/                # Radix UI components
├── lib/
│   ├── engine/            # CV analysis engine
│   │   ├── analyzer_density.ts
│   │   ├── analyzer_temporal.ts
│   │   ├── analyzer_structural.ts
│   │   ├── llm-parser.ts
│   │   ├── observationGenerator.ts
│   │   └── text-extractor.ts
│   ├── llm/
│   │   └── claude.ts      # Claude integration
│   └── codex/             # Prompt templates
└── types/
    └── cv.ts              # Type definitions
```

## Built By

**Aria** @ Privateers - February 2026

Built with 🔥 using Claude AI and a lot of sarcasm.
