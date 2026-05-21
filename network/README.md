# CryOS P2P Mesh Network

## Overview

CryOS uses a peer-to-peer mesh network for communication without central servers. Built on libp2p.

## Features

- **LibP2P Transport** - Encrypted, multiplexed connections
- **Kademlia DHT** - Decentralized peer discovery  
- **GossipSub** - PubSub messaging
- **Double Ratchet** - Forward-secret E2E encryption
- **NAT Traversal** - Hole punching, UPnP, TURN fallback

## Quick Start

```javascript
import { CryMesh } from '@cryos/network';

// Create mesh node
const mesh = new CryMesh({
  bootstrapNodes: [
    '/ip4/123.45.67.89/tcp/4001/p2p/QmBootstrap...'
  ]
});

// Start node
await mesh.start();

// Get peer ID
console.log(mesh.peerId);

// Publish to topic
await mesh.publish('cryos/messages', { text: 'Hello mesh!' });

// Subscribe to messages
mesh.subscribe('cryos/messages', (msg, from) => {
  console.log(`From ${from}:`, msg);
});

// Get connected peers
const peers = mesh.getConnectedPeers();
```

## Architecture

```
┌─────────────────────────────────────────────┐
│           CryOS Mesh Network                │
├─────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │
│  │ DHT     │  │ PubSub  │  │ NAT/Firewall│  │
│  │ Peer    │  │ Message │  │ Traversal   │  │
│  │ Discovery  │  │ Delivery    │  │            │  │
│  └─────────┘  └─────────┘  └─────────────┘  │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │   Encrypted Messaging (Double        │    │
│  │   Ratchet + AES-256-GCM)            │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Topics

| Topic | Purpose |
|-------|---------|
| `cryos/network` | Heartbeat/presence |
| `cryos/discovery` | App/content discovery |
| `cryos/messages` | Direct messages |
| `cryos/offline` | Offline data sync |

## Encryption

Messages use:
1. **X25519** - Key exchange
2. **AES-256-GCM** - Symmetric encryption  
3. **Double Ratchet** - Forward secrecy

## NAT Traversal

Priority order:
1. Direct connection (port forwarding)
2. TCP hole punching
3. UPnP port mapping
4. TURN relay (fallback)

## Running a Node

```bash
# Install dependencies
npm install @cryos/network

# Start node
node my-app.js

# Or run relay node
node relay-node.js
```

## Network Parameters

- Max peers: 50
- DHT refresh: 30s
- Connection timeout: 10s
- Message TTL: 5 minutes