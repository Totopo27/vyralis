# Vyralis

Deterministic, code-driven vertical video rendering engine built on Remotion, Edge-TTS, Vyral Content 3-layer architecture, and provider-agnostic LLM adapters.

Vyralis compiles programmatic scripts into 60 FPS vertical (9:16) MP4 video using React components, spring physics animations, word-level audio synchronization, and high-retention visual widgets.

---

## Architecture

The rendering pipeline is organized around three concurrent layers per scene:

```
┌─────────────────────────────────────────────────────────────┐
│                        SCENE RUNTIME                        │
│                                                             │
│  1. verbalVoiceover (Audio Layer)                           │
│     - Script generated via anti-cliche humanized prompts    │
│     - Edge-TTS neural speech with WordBoundary metadata     │
│     - Millisecond timestamps mapped directly to frame ticks │
│                                                             │
│  2. onScreenText (Retention Typography Layer)               │
│     - High-contrast complementary visual copy               │
│     - Positioned in upper-middle focal viewport             │
│                                                             │
│  3. visualCue (Deterministic Motion Layer)                  │
│     - Reactive widgets animated with Remotion spring()      │
│     - Typologies: metric-callout, split-comparison,         │
│       warning-alert, badge-highlight                        │
└─────────────────────────────────────────────────────────────┘
```

Captions (`KineticCaptions`) are anchored to the bottom third of the viewport, highlighting words individually as playback reaches each word's `startMs` and `endMs`.

---

## Hook Archetypes

Script generation targets four retention structures:

- `contrarian`: Reframes common industry assumptions with verifiable counter-evidence.
- `investigator`: Documents deep code or architecture analysis over a fixed timeframe.
- `cost-confession`: Focuses on high-stakes production failures and root causes.
- `speed-run`: Minimalist implementation walk-through focusing on velocity and zero bloat.

---

## LLM Provider Layer (Strategy Pattern)

The LLM subsystem uses an adapter contract over native Node.js `fetch` without external SDK dependencies.

Supported targets:
- **OpenAI-Compatible**: OpenAI, Ollama (`http://localhost:11434/v1`), Groq, DeepSeek, OpenRouter.
- **Google Gemini**: Direct REST calls to Generative Language API (`gemini-2.5-flash`, `gemini-3.8-flash`).
- **Mock Deterministic**: Fallback for offline environments and CI/CD testing.

### Environment Configuration

```bash
# OpenAI or compatible endpoints
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1" # Optional

# Local Ollama instance
export OLLAMA_BASE_URL="http://localhost:11434"
export OLLAMA_MODEL="llama3"

# Google Gemini
export GEMINI_API_KEY="your-api-key"
export GEMINI_MODEL="gemini-2.5-flash"

# Explicit provider override (optional)
export LLM_PROVIDER="openai" # openai | gemini | ollama | mock
```

---

## Quickstart

### Prerequisites

- Node.js 20+ (Node 22 or 24 recommended)
- Python 3 with `edge-tts` installed (`pip install edge-tts`)
- FFmpeg installed in system PATH (for Remotion audio/video extraction)

### Installation

```bash
git clone https://github.com/Totopo27/vyralis.git
cd vyralis
npm install
```

### Commands

- **Render MP4**:
  ```bash
  npm run render
  ```
  Runs script generation, synthesizes scene audio, measures frame lengths, bundles the entrypoint, and outputs `out/video-output.mp4`.

- **Interactive Studio**:
  ```bash
  npm run dev
  ```
  Starts Remotion Preview Studio at `http://localhost:3000`.

- **Typecheck**:
  ```bash
  npx tsc --noEmit
  ```

---

## Repository Structure

```
src/
├── pipeline/
│   └── render-cli.ts           # CLI orchestrator: TTS -> calculateMetadata -> bundle -> render
├── remotion/
│   ├── components/
│   │   ├── KineticCaptions.tsx # Frame-accurate word-level karaoke caption component
│   │   ├── SceneView.tsx       # 9:16 layout container and spatial hierarchy
│   │   └── VisualCueView.tsx   # Spring-driven metric, alert, and comparison widgets
│   ├── Composition.tsx         # Sequence orchestrator
│   └── index.ts                # Remotion root registration and dynamic metadata calculation
├── services/
│   ├── llm/                    # Strategy pattern adapters (OpenAI, Gemini, Ollama, Mock)
│   ├── script-generator.ts     # 3-layer script generator adhering to anti-cliche prompt constraints
│   └── tts-engine.ts           # Edge-TTS subprocess wrapper with path sanitization and timeout guard
└── types/
    └── schema.ts               # Core data contracts for scripts, scenes, and visual cues
```

---

## License

MIT
