<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="128" height="128" alt="Clippy">
</p>

<h1 align="center">Clippy</h1>

<p align="center">
  <strong>A desktop pet companion for macOS that watches you code.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri_2-000?style=flat&logo=tauri&logoColor=ffc131" alt="Tauri 2">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=000" alt="React 19">
  <img src="https://img.shields.io/badge/Rust-000?style=flat&logo=rust&logoColor=white" alt="Rust">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/macOS-000?style=flat&logo=apple&logoColor=white" alt="macOS">
</p>

---

Clippy is a fully interactive desktop pet that lives on top of your screen. It tracks your mouse, reacts to your typing and scrolling, celebrates when your AI tools finish working, reminds you to stretch, and runs a Pomodoro timer. Built with Tauri 2, React 19, and native macOS APIs.

20 hand-drawn characters. 15 animation states. 54,000 lines of code across 55 source files. Zero web dependencies at runtime.

---

## Features

**Reactive Behavior** -- Clippy watches what you do and responds in real time. Type fast enough and it overheats with steam particles. Scroll through code and it unrolls. Move your cursor quickly and it chases you. Leave it alone for five minutes and it falls asleep.

**Eye Tracking** -- The character's eyes follow your cursor everywhere on screen, using macOS CGEvent APIs to poll the global cursor position at 30fps. The pupil offset is lerped at 25% per frame for smooth, natural-feeling movement.

**20 Characters** -- Classic Clippy (silver, gold, dark, neon), Parrot, Robot, Fox, Rubber Duck, Dog, Owl, Cat, UFO, Octopus, Cactus, Coffee Cup, Dice, Penguin, Mushroom, Lightbulb, and Ghost. Each character has its own personality, speech lines, color scheme, and custom Canvas rendering code.

**AI Tool Integration** -- Detects when Claude Code, Cursor, Codex, or Kiro are running via process watching. Enters a "thinking" animation while the tool works, then celebrates with a victory dance and particle burst when the task completes.

**Coin Sound Hook** -- A Claude Code Stop hook plays a Mario coin sound every time Claude finishes a response in your terminal. Filters by `CLAUDE_CODE_ENTRYPOINT=cli` so background SDK sessions don't trigger it. Configurable volume and 5-second cooldown.

**Productivity Tools** -- Right-click the character for a Pomodoro timer, stretch reminders, pinned notes, and scheduled reminders. The stretch overlay goes full-screen to make sure you actually stand up.

**Click-Through Overlay** -- The window is transparent and always on top. A Rust hit-test loop polls every 16ms and toggles `setIgnoresCursorEvents` based on whether the cursor is over any interactive region. You can click through the empty space to your IDE underneath.

**Drag and Drop** -- Click and drag the character anywhere on screen. On release, it bounces with spring physics (damping 0.85, sine-based squash and stretch).

**Petting** -- Hover slowly over the character's head for 1 second and it triggers a petting animation with floating heart particles.

**Speech Bubbles** -- Contextual dialogue tied to each animation state. Character-specific overrides give each pet its own voice and personality.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    macOS Screen                      │
│                                                      │
│   ┌──────────────────────────────────────────────┐  │
│   │          Transparent Tauri Window             │  │
│   │          (always on top, 1920x1080)           │  │
│   │                                               │  │
│   │   ┌─────────┐  ┌──────────┐  ┌───────────┐  │  │
│   │   │ Character│  │  Speech  │  │  Context  │  │  │
│   │   │ Canvas   │  │  Bubble  │  │   Menu    │  │  │
│   │   └────┬─────┘  └──────────┘  └───────────┘  │  │
│   │        │                                      │  │
│   └────────┼──────────────────────────────────────┘  │
│            │                                         │
│   ┌────────┴──────────────────────────────────────┐  │
│   │              Rust Backend (Tauri)              │  │
│   │                                               │  │
│   │  ┌──────────┐  ┌──────────┐  ┌────────────┐ │  │
│   │  │ Hit-Test  │  │ Keyboard │  │  Process   │ │  │
│   │  │ Polling   │  │ EventTap │  │  Watcher   │ │  │
│   │  │ (16ms)    │  │ (CGEvent)│  │ (ps aux)   │ │  │
│   │  └──────────┘  └──────────┘  └────────────┘ │  │
│   └───────────────────────────────────────────────┘  │
│                                                      │
│   ┌───────────────────────────────────────────────┐  │
│   │  ~/.desktop-clippy/                           │  │
│   │  ├── config.json      (persisted settings)    │  │
│   │  ├── ai-status.json   (AI tool state)         │  │
│   │  ├── coin.wav         (sound effect)          │  │
│   │  ├── play-coin.sh     (Claude Code hook)      │  │
│   │  └── coin.log         (hook audit log)        │  │
│   └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### How the Click-Through Works

The hardest problem in a desktop pet is making it clickable without blocking your IDE underneath. Here's how Clippy solves it:

1. The Tauri window covers the entire screen, transparent, always on top, decorations off.
2. On startup, the window calls `setIgnoresMouseEvents(YES)` — everything passes through.
3. The React frontend sends a list of interactive region rectangles to Rust via IPC: the character bounds, any open context menu, settings panel, Pomodoro widget, etc.
4. A Rust thread polls the global cursor position every 16ms using `CGEvent`.
5. If the cursor is inside any registered region, it calls `setIgnoresMouseEvents(NO)` so clicks hit the React UI. If outside, clicks pass through to whatever's underneath.
6. When a modal (settings, stretch overlay, context menu) opens, a `FORCE_INTERACTIVE` atomic flag bypasses region checking entirely — the whole window becomes clickable until the modal closes.

### How Input Monitoring Works

Clippy uses macOS `CGEventTap` to globally monitor keyboard and scroll events without requiring focus. This needs Accessibility permissions, which the app requests on first launch.

The event tap runs on a background thread with its own `CFRunLoop`. It counts keystrokes (with timestamps for WPM calculation) and scroll deltas, which the frontend polls every 33ms via Tauri IPC. The frontend derives behavioral triggers:

| Signal | Threshold | Triggers |
|---|---|---|
| Typing | KPS > 1.5 | `typing_along` animation |
| Fast typing | KPS > 8 for 5s+ | `overheat` with steam particles |
| Scrolling | Event in last 500ms | `paper_unroll` animation |
| Fast cursor | Velocity > 1200 px/s | `chasing` behavior |
| Idle | No input for 5 min | `sleeping` with Z particles |

### How the AI Hook Works

The coin sound is triggered by a Claude Code **Stop hook** — a shell script that runs every time Claude finishes a response.

```bash
# ~/.desktop-clippy/play-coin.sh
ENTRY="${CLAUDE_CODE_ENTRYPOINT:-unknown}"

# Only play for interactive terminal sessions
if [ "$ENTRY" != "cli" ]; then
  exit 0
fi

# 5-second cooldown
if [ -f "$LOCK" ]; then
  LAST=$(cat "$LOCK")
  if [ $((NOW - LAST)) -lt 5 ]; then exit 0; fi
fi

afplay -v "$VOL" ~/.desktop-clippy/coin.wav &
```

The key insight: `CLAUDE_CODE_ENTRYPOINT` distinguishes interactive CLI sessions (`cli`) from background SDK sessions (`sdk-cli`). Without this filter, TrueMemory's background extraction hooks would trigger the coin sound randomly.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Tauri 2.11 | Desktop app shell, IPC, window management |
| Frontend | React 19 + Zustand 5 | UI rendering, state management |
| Rendering | HTML5 Canvas API | Procedural character drawing at 30fps |
| Language | TypeScript 6 + Rust | Frontend logic + native backend |
| Input | CGEventTap (Core Graphics) | Global keyboard and scroll monitoring |
| Window | Cocoa (AppKit) | Transparency, click-through, activation policy |
| Sound | Web Audio API + afplay | In-app blips + system coin sound |
| Build | Vite 8 + Cargo | Frontend bundling + Rust compilation |
| Icons | @napi-rs/canvas | Server-side Canvas rendering for app icons |

---

## Project Structure

```
desktop-clippy/
├── src/
│   ├── App.tsx                          # Root component
│   ├── store.ts                         # Zustand state (position, animation, config)
│   ├── main.tsx                         # React entry point
│   │
│   ├── components/
│   │   ├── ClippyCanvas.tsx             # 30fps canvas render loop
│   │   ├── SpeechBubble.tsx             # Floating dialogue (left of character)
│   │   ├── ContextMenu.tsx              # Right-click menu
│   │   ├── SettingsPanel.tsx            # Character picker, scale, config
│   │   ├── PomodoroWidget.tsx           # Focus/break timer
│   │   ├── ReminderToast.tsx            # Scheduled notifications
│   │   ├── FixedNote.tsx                # Pinned note above character
│   │   └── StretchOverlay.tsx           # Full-screen stretch reminder
│   │
│   ├── hooks/
│   │   ├── useClippy.ts                 # Animation state machine + behaviors
│   │   ├── useInput.ts                  # Polls Rust for cursor/keys/scroll
│   │   ├── useInteractiveRegions.ts     # Manages click-through hitboxes
│   │   ├── useAIStatus.ts               # AI tool detection + victory trigger
│   │   ├── useConfig.ts                 # Persistence to ~/.desktop-clippy/
│   │   └── useTimers.ts                 # Pomodoro + stretch countdown
│   │
│   ├── engine/
│   │   ├── ClippyRenderer.ts            # Legacy paperclip renderer (833 lines)
│   │   ├── ParticleSystem.ts            # Hearts, steam, sparkles, Z's
│   │   └── characters/
│   │       ├── index.ts                 # Character registry
│   │       ├── utils.ts                 # Shared eye/expression drawing
│   │       ├── clippy.ts               # Classic silver paperclip
│   │       ├── parrot.ts               # Green parrot (752 lines)
│   │       ├── robot.ts                # Chrome robot
│   │       ├── fox.ts                  # Orange fox
│   │       ├── ... (16 more)
│   │       └── ghost.ts                # Translucent ghost
│   │
│   ├── systems/
│   │   ├── SoundSystem.ts              # Web Audio synthesis
│   │   ├── IdleBehavior.ts             # Progressive idle escalation
│   │   └── AIStatusSystem.ts           # Status file polling
│   │
│   ├── config/
│   │   ├── defaults.ts                 # AppConfig type + defaults
│   │   └── speechLines.ts              # 230 lines of dialogue
│   │
│   └── utils/
│       └── math.ts                     # lerp, clamp, distance, springDamp
│
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs                      # App setup, tray, transparency
│   │   ├── commands.rs                 # 11 Tauri IPC commands
│   │   ├── input/
│   │   │   ├── keyboard.rs             # CGEventTap (keys + scroll)
│   │   │   └── mouse.rs                # Cursor polling + hit-test loop
│   │   └── process/
│   │       └── watcher.rs              # AI tool process detection
│   ├── icons/
│   │   ├── icon.icns                   # App icon (Canvas-rendered parrot)
│   │   └── tray-icon-44x44.rgba        # Menu bar icon (gray silhouette)
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── generate-icons-canvas.mjs           # Icon generator (@napi-rs/canvas)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- macOS 11.0 or later
- Node.js 18+
- Rust (via [rustup](https://rustup.rs))
- Xcode Command Line Tools (`xcode-select --install`)

### Development

```bash
git clone https://github.com/buildingjoshbetter/Clippy.git
cd Clippy
npm install
npm run tauri dev
```

On first launch, macOS will ask for **Accessibility permissions** (System Settings > Privacy & Security > Accessibility). This is required for keyboard and scroll monitoring via CGEventTap. The app will prompt you to enable it.

### Build

```bash
npm run tauri build
```

Outputs:
- `src-tauri/target/release/bundle/macos/Clippy.app`
- `src-tauri/target/release/bundle/dmg/Clippy_0.1.0_aarch64.dmg`

### Coin Sound Hook (optional)

To play a Mario coin sound every time Claude Code finishes a response:

1. Copy `coin.wav` to `~/.desktop-clippy/coin.wav`
2. Add a Stop hook to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": ["~/.desktop-clippy/play-coin.sh"]
      }
    ]
  }
}
```

---

## Animation States

| State | Trigger | Visual | Particles |
|---|---|---|---|
| `idle` | Default | Subtle breathing, random look-around | -- |
| `eye_follow` | Cursor nearby | Eyes track cursor position | -- |
| `typing_along` | KPS > 1.5 | Nods along with keystrokes | -- |
| `overheat` | KPS > 8 for 5s | Red tint, shaking | Steam |
| `paper_unroll` | Scrolling | Unrolling animation | -- |
| `chasing` | Cursor > 1200 px/s | Moves 3px/frame toward cursor | -- |
| `dragging` | Left-click + drag | Follows cursor with wobble | -- |
| `wobble` | After drag release | Spring physics bounce | -- |
| `petting` | Slow hover on head | Happy expression | Hearts |
| `thinking` | AI tool active | Thought bubble animation | Dots |
| `victory` | AI tool finished | Celebration dance | Sparkles |
| `stretching` | 45 min of work | Stretch reminder | -- |
| `waving` | Greeting / reminder | Arm wave | -- |
| `sleeping` | 5 min idle | Eyes closed, slow breathing | Z's |

---

## Characters

| Character | Style | Personality |
|---|---|---|
| Clippy (Classic) | Silver metallic paperclip | Helpful, slightly sarcastic |
| Clippy Gold | Gold premium variant | Refined, encouraging |
| Clippy Dark | Carbon fiber black | Mysterious, concise |
| Clippy Neon | Glowing cyan/magenta | Energetic, excitable |
| Parrot | Green with orange crest | Chatty, enthusiastic |
| Robot | Chrome with LED eyes | Logical, efficient |
| Fox | Orange with bushy tail | Clever, warm |
| Rubber Duck | Yellow classic duck | Patient, Socratic |
| Dog | Golden retriever | Loyal, encouraging |
| Owl | Brown with large eyes | Wise, contemplative |
| Cat | Gray with green eyes | Aloof, witty |
| UFO | Metallic saucer | Curious, alien perspective |
| Octopus | Purple with tentacles | Multitasking jokes |
| Cactus | Green with flower | Dry humor, resilient |
| Coffee Cup | Steaming mug | Caffeinated, energetic |
| Dice | White with dots | Random, playful |
| Penguin | Tuxedo black and white | Formal, chill |
| Mushroom | Red cap with spots | Whimsical, nature-oriented |
| Lightbulb | Glowing filament | Ideas-focused, bright |
| Ghost | Translucent white | Spooky humor, ethereal |

---

## Configuration

Settings are persisted to `~/.desktop-clippy/config.json`:

```json
{
  "characterVariant": "parrot",
  "characterScale": 3,
  "lastX": 800,
  "lastY": 600,
  "userName": "",
  "coinVolume": 10,
  "stretchInterval": 45,
  "pomodoroFocus": 25,
  "pomodoroBreak": 5,
  "pinnedNote": "",
  "reminders": []
}
```

---

## License

MIT

---

<p align="center">
  Built by <a href="https://github.com/buildingjoshbetter">@building_josh</a>
</p>
