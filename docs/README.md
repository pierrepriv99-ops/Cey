# CryOS Developer Documentation

## Current Status: Phase 1 - Mobile Alpha

Welcome to the CryOS developer docs.

## Project Structure

```
cryos-core/
├── contracts/         # Smart contracts (Solidity)
│   └── CRXToken.sol    # CRX Token Contract
├── test/               # Tests
├── scripts/           # Deployment scripts
├── website/           # CryoHQ website
└── docs/              # Developer documentation
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Hardhat (for smart contracts)

### Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
```

## Smart Contracts

### CRXToken

The CRX token is an ERC-20 token with the following features:

- **Name**: CryOS Token
- **Symbol**: CRX
- **Decimals**: 18
- **Max Supply**: 21,000,000 CRX

Key functions:
- `mint(address to, uint256 amount)` - Only owner can mint
- `burn(uint256 amount)` - Anyone can burn their tokens
- `circulatingSupply()` - Returns current supply

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