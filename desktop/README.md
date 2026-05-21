# CryOS Station

Desktop client for CryOS - Financial Sovereignty on Your Desktop

## Features

- Custom frameless window with Frost UI
- Wallet integration (send/receive CRX)
- Built-in app browser
- P2P encrypted messaging
- System tray support
- Cross-platform (Windows, macOS, Linux)

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for distribution
npm run dist
```

## Building

### Windows
```bash
npm run dist  # Creates installer in dist/
```

### macOS
```bash
npm run dist  # Creates .dmg in dist/
```

### Linux
```bash
npm run dist  # Creates AppImage in dist/
```

## Structure

```
desktop/
├── src/
│   ├── main.js       # Electron main process
│   ├── preload.js   # Context bridge
│   └── renderer/    # UI (HTML/JS)
├── assets/          # Icons, images
└── package.json
```

## Window Controls

The window uses a custom frameless design with:
- Custom titlebar with native-style window controls
- Minimize/Maximize/Close buttons
- Draggable title area

## System Tray

CryOS Station minimizes to system tray when closed (configurable). Right-click tray icon for quick actions:

- Show station
- Copy wallet address
- Quit