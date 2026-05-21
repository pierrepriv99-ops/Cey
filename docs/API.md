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

*Version: 0.1.0*