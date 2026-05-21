# CryOS Developer Documentation

> The Web3-Native Operating System - Build financial sovereignty into your device.

## Current Status: Production Alpha

| Component | Status |
|-----------|--------|
| Smart Contracts | ✅ v0.1.0 |
| Mobile SDK | ✅ Alpha |
| Desktop | ✅ Beta |
| P2P Network | ✅ Alpha |
| Mind AI | ✅ Alpha |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Android Studio (mobile)
- Hardhat

### Install & Build

```bash
# Clone
git clone https://github.com/pierrepriv99-ops/Cey.git
cd Cey

# Install deps
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

---

## Architecture

| Layer | Location |
|-------|----------|
| Cryo Interface (UI) | `/website` |
| Cryo Mind (AI) | `/mind` |
| Cryo Mobile/Station | `/mobile`, `/desktop` |
| Cryo Chain | `/contracts` |
| Cryo Vault | `/mobile` |
| Cryo Network | `/network` |

---

## Smart Contracts

### CRXToken
- **Name**: CryOS Token
- **Symbol**: CRX
- **Supply**: 21,000,000 max
- **Standard**: ERC-20

```solidity
// Key functions
mint(address to, uint256 amount);
burn(uint256 amount);
transfer(address to, uint256 amount);
```

### CryoStore
- App registration & publishing
- Revenue distribution

---

## SDK

### TypeScript
```bash
npm install @cryos/sdk
```

### Android
```kotlin
implementation 'io.cryosdk:mobile:0.1.0'
```

---

## Mobile (8 chains)
1. Ethereum
2. Polygon
3. BSC
4. Avalanche
5. Arbitrum
6. Optimism
7. Solana (soon)
8. Aptos (soon)

---

## Desktop
- Electron app
- Ubuntu 20.04+, macOS 12+
- Frameless window + Frost UI
- System tray

---

## P2P Network
- libp2p mesh
- Double Ratchet encryption
- NAT traversal

---

## Mind AI
```bash
cryos-mind "send 50 CRX to vault"
```

---

## API

| Endpoint | Method |
|-----------|--------|
| `/api/v1/auth/login` | POST |
| `/api/v1/wallet/balance` | GET |
| `/api/v1/transaction/send` | POST |

---

## Support
- Discord: https://discord.gg/cryos
- Email: support@cryos.io

---

*Version: 0.1.0-alpha | Updated: May 2026*

### Deployment

```bash
# Deploy to local hardhat network
npx hardhat run scripts/deploy.ts

# Deploy to testnet (needs RPC URL and PRIVATE_KEY in .env)
npx hardhat run scripts/deploy.ts --network sepolia
```

## Tokenomics (CRX)

| Allocation | Percentage | Amount |
|-----------|-----------|--------|
| Ecosystem & Network Rewards | 35% | 7,350,000 CRX |
| Development Fund | 20% | 4,200,000 CRX |
| Community & Grants | 15% | 3,150,000 CRX |
| Public Sale | 15% | 3,150,000 CRX |
| Team & Founders | 10% | 2,100,000 CRX |
| Strategic Partners | 5% | 1,050,000 CRX |

## Roadmap

See [PLAN.md](../.agents_tmp/PLAN.md) for the full roadmap.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## Security

For security vulnerabilities, please contact security@cryos.io

## License

MIT