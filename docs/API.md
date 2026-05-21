# CryOS API Reference

Base URL: `https://api.cryos.io`

---

## Authentication

### Login
```
POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }
Response: { "token": "jwt...", "user": {...} }
```

### Register
```
POST /api/v1/auth/register
Body: { "email": "...", "password": "...", "name": "..." }
Response: { "token": "jwt...", "user": {...} }
```

### Wallet Connect
```
GET /api/v1/auth/walletconnect
Query: { "redirect_uri": "..." }
Response: { "uri": "wc:..." }
```

---

## Wallet

### Get Balance
```
GET /api/v1/wallet/balance?chain=eth&address=0x...
Headers: Authorization: Bearer <token>
Response: { "CRX": "1000", "ETH": "1.5", "USDC": "500" }
```

### Get Transactions
```
GET /api/v1/wallet/transactions?chain=eth&address=0x...
Response: { "transactions": [...] }
```

### Send Transaction
```
POST /api/v1/wallet/send
Body: { 
  "chain": "eth",
  "to": "0x...",
  "value": "0.1",
  "token": "CRX"
}
Response: { "txHash": "0x...", "status": "pending" }
```

---

## Apps

### List Apps
```
GET /api/v1/apps
Query: { "category": "finance", "sort": "popular" }
Response: { "apps": [...] }
```

### Get App
```
GET /api/v1/apps/:id
Response: { "id": "...", "name": "...", "developer": "...", "rating": 4.5 }
```

### Submit App
```
POST /api/v1/apps
Body: { "name": "...", "bundle": "...", "price": 0 }
Headers: Authorization: Bearer <token>
Response: { "id": "...", "status": "pending" }
```

---

## Store

### Purchase
```
POST /api/v1/store/purchase
Body: { "appId": "...", "method": "crypto" }
Response: { "orderId": "...", "status": "completed" }
```

---

## WebSocket

```
wss://api.cryos.io/ws
```

### Events
- `wallet.update` - Balance changed
- `tx.confirmed` - Transaction confirmed
- `price.alert` - Price threshold hit
- `notification` - New notification

```javascript
// Client
ws.onmessage = (e) => {
  const event = JSON.parse(e.data);
  if (event.type === 'wallet.update') {
    console.log('New balance:', event.data);
  }
};
```

---

## Errors

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

```json
{ "error": { "code": 400, "message": "Invalid address" } }
```

---

## Pagination

List endpoints support pagination:

```
GET /api/v1/apps?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Rate Limiting

| Tier | Requests/minute |
|------|----------------|
| Free | 60 |
| Premium | 300 |
| Enterprise | Unlimited |

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1716331200
```

---

## SDK Examples

### JavaScript SDK

```javascript
import { CryOS } from '@cryos/sdk';

// Initialize
const cryos = new CryOS({
  apiKey: 'your-api-key'
});

// Wallet
const wallet = await cryos.wallet.connect();
const balance = await wallet.getBalance();

// Transfer
const tx = await wallet.send({
  to: '0x...',
  amount: '1.0',
  token: 'CRX'
});

// Apps
const apps = await cryos.apps.list({ category: 'finance' });
const app = await cryos.apps.get('app-id');
```

### React Hook

```jsx
import { useCryOS, useWallet } from '@cryos/sdk/react';

function WalletBalance() {
  const { connect, disconnect } = useCryOS();
  const { balance, loading } = useWallet();
  
  if (loading) return <Spinner />;
  
  return (
    <div>
      <h1>{balance.CRX} CRX</h1>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### cURL Examples

```bash
# Login
curl -X POST https://api.cryos.io/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"****"}'

# Get balance
curl https://api.cryos.io/api/v1/wallet/balance?chain=eth \
  -H "Authorization: Bearer YOUR_TOKEN"

# List apps
curl "https://api.cryos.io/api/v1/apps?category=finance&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Webhook Events

Configure webhooks at `https://dashboard.cryos.io/webhooks`

| Event | Payload |
|-------|---------|
| `app.installed` | `{ "user_id": "...", "app_id": "...", "timestamp": "..." }` |
| `transaction.pending` | `{ "tx_hash": "...", "from": "...", "to": "...", "value": "..." }` |
| `transaction.confirmed` | `{ "tx_hash": "...", "block_number": 12345, "status": "confirmed" }` |
| `price.alert` | `{ "token": "CRX", "condition": "above", "price": "2.50" }` |
| `subscription.renewed` | `{ "user_id": "...", "plan": "premium", "expires": "..." }` |

---

## SDK Types

```typescript
// Wallet types
interface Wallet {
  address: string;
  chain: 'eth' | 'polygon' | 'bsc' | 'avalanche' | 'arbitrum' | 'optimism';
  balances: Record<string, string>;
  connected: boolean;
}

// Transaction types  
interface TransactionRequest {
  to: string;
  value: string;
  token: string;
  chain: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

interface TransactionReceipt {
  txHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: string;
}

// App types
interface App {
  id: string;
  name: string;
  developer: string;
  description: string;
  category: string;
  price: number;
  ratings: number;
  installs: number;
  icon: string;
}
```

---

## Sandbox Environment

For testing, use the sandbox:
```
Base URL: https://sandbox.api.cryos.io

Endpoints are identical to production.
Testnet transactions only - no real funds.
```

---

## Changelog

### v0.1.0 (May 2026)
- Initial release
- Authentication endpoints
- Wallet operations
- Apps listing

### v0.0.x (Beta)
- Alpha testing
- Limited endpoints

---

*Version: 0.1.0*