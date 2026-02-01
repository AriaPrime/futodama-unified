# Smart Home Controls 🏠

Scripts for controlling smart home devices at Ronni's place in Århus.

## Devices

### Charles the Roomba 🤖
- **Location:** `charles/charles.js`
- **Model:** iRobot i7
- **IP:** 192.168.0.209
- **Library:** dorita980

**Commands:**
```javascript
// In charles.js
start()      // Start cleaning
stop()       // Stop
pause()      // Pause
resume()     // Resume
dock()       // Return to dock
getRobotState() // Get status
```

### Philips Hue Lights 💡
- **Location:** `hue/hue.js`
- **Bridge IP:** 192.168.0.78

**Commands:**
```bash
node hue.js list              # List all lights
node hue.js on [id]           # Turn on (all or specific)
node hue.js off [id]          # Turn off
node hue.js brightness [id] [%] # Set brightness
node hue.js scene [name]      # Activate scene
```

**Lights:**
1. Soveværelse (Hue Iris, color)
2. Stuen - Sofalampe (Color lamp)
3. Kontor: Midte (Runner spot)
4. Kontor: Ronni (Runner spot)
5. Kontor: Ana (Runner spot)

## Credentials

All credentials stored in `../credentials/` (gitignored):
- `charles-roomba.json`
- `hue-bridge.json`

## Network

- Gateway: 192.168.0.1
- ARIAS_PALACE: 192.168.0.194
- Charles: 192.168.0.209
- Hue Bridge: 192.168.0.78
