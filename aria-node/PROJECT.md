# Aria Node iOS App

📱 React Native/Expo app that extends Aria's senses to mobile devices.

## Status: v1.0.0 — Cyberpunk Edition ⚡

**Version:** 1.0.0
**First Connection:** Feb 5, 2026 at 01:09 CET
**Cyberpunk UI Overhaul:** Feb 7, 2026

---

## 🎯 Feature Roadmap

### ✅ Phase 1: Core Connection (COMPLETE)
- [x] WebSocket connection to OpenClaw gateway
- [x] Ed25519 device authentication with challenge signing
- [x] Device pairing flow (via `openclaw devices approve`)
- [x] Location retrieval (GPS)
- [x] Camera snapshot (front/back)

### ✅ Phase 2a: Voice Output (COMPLETE - Feb 5, 2026)
- [x] **audio.play command** — Play audio from URL or base64
- [x] **audio.stop command** — Stop current playback
- [x] **TTS integration** — ElevenLabs → local server → phone playback
- [x] **Silent mode support** — Plays even when phone is muted (iOS)
- [x] **Gateway command allowlist** — Added `audio.play`, `audio.stop` to config

### ✅ Phase 2b: Microphone Input (COMPLETE)
- [x] **mic.record command** — Record audio from phone mic
- [x] **mic.stop command** — Stop recording early
- [x] **Audio mode switching** — Toggle between playback/recording modes
- [x] **Base64 audio return** — Send recorded audio back to gateway

### ✅ Phase 3: Cyberpunk UI (COMPLETE - Feb 7, 2026)
- [x] **Dark cyberpunk theme** — Cyan glow, deep dark surfaces
- [x] **Screen-based navigation** — Home / Settings / Now Playing
- [x] **Now Playing screen** — Album art, title, animated playing indicator
- [x] **screen.display command** — Remote display control from server
- [x] **screen.clear command** — Clear display
- [x] **Component architecture** — GlowButton, StatusIndicator, NowPlayingCard, etc.
- [x] **Animated status indicators** — Pulsing glow for connection states
- [x] **Meeting recorder** — Preserved from v0.4.0

### 🎵 YouTube Player (Server-side)
- [x] `scripts/youtube-player.js` — Zero-token YouTube audio player
- [x] Downloads audio via yt-dlp, plays via voice receiver + audio.play
- [x] Thumbnail download + screen.display for Now Playing
- [x] Supports --full, --duration, --start flags

### 📋 Phase 4: Communication (TODO)
- [ ] **Push Notifications** — Receive alerts when app backgrounded
- [ ] **Haptics** — Physical feedback for different alert types

### 📹 Phase 5: Enhanced Vision
- [ ] **Live Camera Stream** — Real-time video feed
- [ ] **Camera Clip Recording** — Short video capture

### 🔋 Phase 6: Context Awareness
- [ ] **Battery & Device Status**
- [ ] **Motion/Activity Detection**
- [ ] **Calendar Integration**

### 🚀 Phase 7: Advanced
- [ ] **Siri/Shortcuts Integration**
- [ ] **NFC Triggers**
- [ ] **iOS Widget**

---

## Architecture

### Screens
| Screen | Purpose |
|--------|---------|
| Home | Main screen — Talk to Aria, quick actions, Now Playing mini card, logs |
| Settings | Gateway connection, permissions, pairing reset |
| Now Playing | Full-screen album art + track info |

### Components
| Component | Purpose |
|-----------|---------|
| GlowButton | Cyberpunk-styled button with color glow |
| StatusIndicator | Animated connection status (pulsing dot) |
| NowPlayingCard | Mini + expanded album art display |
| MeetingRecorder | Meeting recording controls + status |
| LogViewer | Terminal-style system log |

### Theme
| Token | Value | Usage |
|-------|-------|-------|
| background | #0a0a14 | App background |
| surface | #12122a | Cards, sections |
| cyan | #00d4ff | Primary accent, buttons |
| purple | #8b5cf6 | Secondary accent |
| magenta | #ff006e | Recording indicator |
| success | #00ff88 | Connected, log text |
| error | #ff4444 | Errors, stop buttons |

### Commands
| Command | Params | Description |
|---------|--------|-------------|
| audio.play | url, base64, volume | Play audio on phone |
| audio.stop | — | Stop playback |
| mic.record | maxDurationMs | Record from mic |
| mic.stop | — | Stop recording |
| screen.display | title, subtitle, imageUrl, isPlaying | Update Now Playing display |
| screen.clear | — | Clear display |
| camera.snap | facing, quality | Take photo |
| camera.list | — | List cameras |
| location.get | desiredAccuracy | Get GPS location |

### Authentication Flow
1. App generates Ed25519 keypair (stored in SecureStore)
2. DeviceId = SHA256(publicKey) as hex
3. On connect: Gateway sends challenge nonce
4. App signs: `connect:${deviceId}:${timestamp}:${nonce}`
5. Gateway verifies signature against stored public key
6. If not paired: Returns `pairing-required` with requestId
7. Operator approves via `openclaw devices approve <requestId>`
8. Next connect succeeds, gateway returns `hello-ok` with deviceToken

### Key Files
| File | Purpose |
|------|---------|
| `App.tsx` | Main app — screens, state, camera handling |
| `src/theme/index.ts` | Cyberpunk color scheme, spacing, glow effects |
| `src/components/*.tsx` | Reusable UI components |
| `src/services/gateway.ts` | WebSocket connection, auth |
| `src/services/commands.ts` | Command handler + screen.display |
| `src/services/audio.ts` | Audio playback |
| `src/services/mic.ts` | Microphone recording |
| `src/services/camera.ts` | Camera capture |
| `src/services/location.ts` | GPS location |
| `src/services/meeting.ts` | Meeting recording |
| `src/services/background.ts` | Background keepalive |

---

## Build & Deploy

### Development (Expo Go)
```bash
cd aria-node
npm start
# Scan QR code with Expo Go app
```

### Production Build (EAS)
```bash
npx eas-cli build --platform ios --profile preview
```

### OTA Update (same runtime version only)
```bash
npx eas-cli update --branch preview --message "description"
```

**EAS Dashboard:** https://expo.dev/accounts/ariaprime/projects/aria-node

---

## YouTube Player Usage
```bash
# Play first 60 seconds (default)
node scripts/youtube-player.js "https://youtu.be/XXXXX"

# Play first 30 seconds
node scripts/youtube-player.js "https://youtu.be/XXXXX" --duration 30

# Play full track
node scripts/youtube-player.js "https://youtu.be/XXXXX" --full

# Play from specific start time
node scripts/youtube-player.js "https://youtu.be/XXXXX" --start 1:30 --duration 60
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-07 | 🎨 CYBERPUNK EDITION — Full UI overhaul, Now Playing, screen.display, component architecture |
| 0.4.0 | 2026-02-05 | 🎙️ Microphone recording (mic.record, mic.stop commands) |
| 0.3.1 | 2026-02-05 | 🎤 VOICE OUTPUT WORKING! TTS plays on phone via audio.play |
| 0.2.16 | 2026-02-05 | Fixed hot-reload state desync, Expo Go confirmed working |
| 0.2.11 | 2026-02-05 | First successful connection! |
| 0.1.0 | 2026-02-04 | Initial scaffold |

---

*Cyberpunk Edition — because Aria deserves an app that looks as good as she sounds.* ⚡
