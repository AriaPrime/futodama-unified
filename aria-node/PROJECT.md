# Aria Node - iOS/Android Gateway Client

A mobile node app that connects to the OpenClaw gateway on ARIAS_PALACE.

## Status: MVP In Progress

### Completed
- [x] Project scaffold (Expo + TypeScript)
- [x] Gateway protocol types
- [x] WebSocket connection service
- [x] Device identity (secure storage)
- [x] Location service
- [x] Camera service (basic)
- [x] Command handler routing
- [x] Main UI with connection settings
- [x] Permission handling
- [x] App configuration for iOS/Android

### TODO
- [ ] Apple Developer Account setup
- [ ] EAS CLI login + project link
- [ ] First cloud build
- [ ] TestFlight deployment
- [ ] Test gateway pairing flow
- [ ] Camera capture debugging
- [ ] Notifications support
- [ ] Voice wake (future)
- [ ] Talk mode (future)

## Architecture

```
aria-node/
├── App.tsx                 # Main UI
├── app.json               # Expo config
├── eas.json               # EAS build config
└── src/
    ├── services/
    │   ├── gateway.ts     # WebSocket + protocol
    │   ├── camera.ts      # Camera capture
    │   ├── location.ts    # Location queries
    │   └── commands.ts    # Command routing
    └── types/
        └── protocol.ts    # Protocol types
```

## Building

### Prerequisites
1. Apple Developer Account ($99/year)
2. Expo account (done: AriaPrime)

### Steps
```bash
# Login to Expo
npx eas-cli login

# Link project
npx eas-cli init

# Build for iOS (internal distribution)
npx eas-cli build --platform ios --profile preview

# Or production
npx eas-cli build --platform ios --profile production
```

### TestFlight
After production build, submit to TestFlight:
```bash
npx eas-cli submit --platform ios
```

## Gateway Connection

Default port: 18789
Protocol version: 3
Role: node

### Capabilities
- `camera` (camera.snap, camera.list)
- `location` (location.get)

## Credentials
- Expo: See credentials/expo.json
- Apple Developer: TBD
