# CryOS Mind

AI Shell Assistant for CryOS

## Features

- **Interactive Chat** - Natural language interface
- **Agent System** - AutoGPT-style autonomous agents
- **Tool Integration** - Wallet, contracts, network tools
- **Command Line** - Terminal convenience
- **Extensible** - Add custom commands

## Installation

```bash
npm install -g @cryos/mind
```

## Usage

### Interactive Chat
```bash
mind chat
```

This starts an interactive shell where you can talk to Mind.

### Execute Commands
```bash
mind exec status
mind exec wallet balance
mind exec send 1.0 0x123...
```

### Agent Mode
```bash
mind agent "deploy a token contract"
mind agent "transfer 10 CRX to 0x456..."
```

## Commands

| Command | Description |
|---------|-------------|
| `help` | Show help |
| `status` | Show connection status |
| `wallet balance` | Check CRX balance |
| `wallet address` | Show wallet address |
| `wallet create` | Create new wallet |
| `send <amt> <addr>` | Send CRX |
| `call <func> <args>` | Call contract |
| `exit` | Exit |

## Configuration

```javascript
// config.json
{
  "name": "Mind",
  "color": true,
  "verbose": false
}
```

## Architecture

```
Mind/
├── src/
│   ├── index.js    # Main shell
│   ├── agent.js   # Agent system
│   └── commands.js # Bot commands
├── mind.sh       # Shell wrapper
└── package.json
```

## Development

```bash
# Development mode
npm run dev

# Watch mode
npm run watch
```

## Future Features

- Voice input/activation
- Multi-modal input
- Plugin system
- Memory/persistence
- Team collaboration