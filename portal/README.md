# CryOS Developer Portal

Welcome to the CryOS Developer Portal. Build the future of Web3 mobile computing.

## Quick Links

- [📱 Mobile SDK Reference](#)
- [🛒 CryoStore Integration](#)
- [💰 CRX Token Docs](../contracts/CRXToken.sol)
- [🔐 Vault Integration](#)

## Getting Started

### 1. Install SDK

```bash
npm install @cryos/sdk
```

### 2. Initialize SDK

```javascript
import { CryOSSDK } from '@cryos/sdk';

const sdk = new CryOSSDK({
  network: 'sepolia',
  crxTokenAddress: '0x...',  // CRX token address
  cryoStoreAddress: '0x...'   // CryoStore contract
});

// Connect wallet
await sdk.connect(privateKey);

// Get wallet info
const wallet = await sdk.getWalletInfo();
console.log(`Address: ${wallet.address}`);
console.log(`Balance: ${wallet.balance} wei`);
```

### 3. Transfer CRX

```javascript
// Transfer 10 CRX
const amount = ethers.parseEther('10');
await sdk.transferCRX(recipientAddress, amount);
```

### 4. Integrate CryoStore

```javascript
// Get app details
const app = await sdk.getApp(appId);
console.log(`App: ${app.name}`);
console.log(`Price: ${ethers.formatEther(app.price)} CRX`);

// Download app (auto-purchases if paid)
await sdk.downloadApp(appId);

// Rate app (1-5 stars)
await sdk.rateApp(appId, 5);
```

## CryoStore App Categories

| Category | ID | Description |
|----------|-----|------------|
| Finance | 0x46494e414e4345 | DeFi, wallets, trading |
| Social | 0x534f4349414c | Messaging, social |
| NFT | 0x4e465400000000 | NFT marketplaces |
| Games | 0x47414d455300 | Gaming dapps |
| Tools | 0x544f4f quatro | Utilities |
| Storage | 0x53544f524147 | Decentralized storage |

## Mobile Integration (Native Android)

### Gradle Setup

```kotlin
// settings.gradle
dependencyResolutionManagement {
    repositoriesMode = PREFER_SETTINGS
    repositories {
        maven { url 'https://jitpack.io' }
    }
}

dependencies {
    implementation 'com.github.cryos-io:mobile:0.1.0'
}
```

### Kotlin Usage

```kotlin
// Initialize vault
val vault = KeyStoreService(context)

// Generate master key
vault.generateMasterKey()

// Initialize wallet
val wallet = WalletSDK.fromPrivateKey(privateKey)

// Send transaction
val txHash = wallet.send(
    Chain.ETHEREUM_SEPOLIA,
    toAddress,
    amountWei
)
```

## CRX Tokenomics

| Allocation | Amount | Purpose |
|------------|--------|---------|
| Ecosystem | 7.35M CRX | Network rewards, grants |
| Development | 4.2M CRX | R&D funding |
| Community | 3.15M CRX | Airdrops, bounties |
| Public Sale | 3.15M CRX | Seed/public sale |
| Team | 2.1M CRX | Core team compensation |
| Partners | 1.05M CRX | Strategic partnerships |

## Need Help?

- 💬 Discord: [Join community](#)
- 📖 Wiki: [Full docs](#)
- 🐛 Issues: [Report bugs](#)
- 📧 Email: dev@cryos.io