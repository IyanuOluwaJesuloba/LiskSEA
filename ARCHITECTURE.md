# LiskSEA Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Dashboard   │  │ PriceDataPage│  │ GaslessTransactions│   │
│  │              │  │              │  │    (NEW)           │   │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘   │
│         │                  │                    │               │
└─────────┼──────────────────┼────────────────────┼───────────────┘
          │                  │                    │
          ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     React Hooks Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ useWallet    │  │usePriceData  │  │useGaslessTransactions│  │
│  │              │  │              │  │     (NEW)          │   │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘   │
└─────────┼──────────────────┼────────────────────┼───────────────┘
          │                  │                    │
          │                  │                    ▼
          │                  │          ┌─────────────────┐
          │                  │          │  Thirdweb SDK   │
          │                  │          │  (Account       │
          │                  │          │   Abstraction)  │
          │                  │          └────────┬────────┘
          │                  │                   │
          ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain Layer                              │
│                    (Lisk Sepolia Testnet)                        │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ PriceConsumer  │  │GaslessInteraction│ │  Smart Wallets   │  │
│  │   Contract     │  │   Contract (NEW) │ │  (ERC-4337)      │  │
│  │                │  │                  │ │                  │  │
│  │  - RedStone    │  │  - Price Query   │ │  - User Accounts │  │
│  │    Oracle      │  │  - Price Alerts  │ │  - Gasless Txs   │  │
│  │    Consumer    │  │  - Actions       │ │                  │  │
│  └────────┬───────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                   │                      │            │
└───────────┼───────────────────┼──────────────────────┼────────────┘
            │                   │                      │
            ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ RedStone       │  │   Thirdweb     │  │  Lisk Sepolia    │  │
│  │ Price Oracles  │  │   Paymaster    │  │  RPC & Explorer  │  │
│  │                │  │                │  │                  │  │
│  │ - Live Prices  │  │ - Tx Sponsor   │  │ - Network RPC    │  │
│  │ - Signed Data  │  │ - Gas Payment  │  │ - BlockScout     │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Price Query Flow (Oracle Integration)

```
User Action                Frontend                Contract                Oracle
    │                         │                       │                      │
    │  Click "View Prices"    │                       │                      │
    ├────────────────────────>│                       │                      │
    │                         │                       │                      │
    │                         │  getPriceBySymbol()   │                      │
    │                         ├──────────────────────>│                      │
    │                         │                       │                      │
    │                         │                       │  Fetch signed data   │
    │                         │                       ├─────────────────────>│
    │                         │                       │                      │
    │                         │                       │  Return price data   │
    │                         │                       │<─────────────────────┤
    │                         │                       │                      │
    │                         │    uint256 price      │                      │
    │                         │<──────────────────────┤                      │
    │                         │                       │                      │
    │   Display Price         │                       │                      │
    │<────────────────────────┤                       │                      │
    │                         │                       │                      │
```

### 2. Gasless Transaction Flow (Account Abstraction)

```
User                   Frontend              Thirdweb            Smart Wallet        GaslessInteraction
 │                        │                      │                    │                      │
 │  Click "Record Price"  │                      │                    │                      │
 ├───────────────────────>│                      │                    │                      │
 │                        │                      │                    │                      │
 │                        │  prepareCall()       │                    │                      │
 │                        ├─────────────────────>│                    │                      │
 │                        │                      │                    │                      │
 │                        │  Sign UserOp         │                    │                      │
 │                        │<─────────────────────┤                    │                      │
 │                        │                      │                    │                      │
 │  Sign in Wallet        │                      │  Submit UserOp     │                      │
 │<───────────────────────┤                      │  to Bundler        │                      │
 │                        │                      ├───────────────────>│                      │
 │                        │                      │                    │                      │
 │                        │                      │  Paymaster         │                      │
 │                        │                      │  Validates & Signs │                      │
 │                        │                      │<───────────────────┤                      │
 │                        │                      │                    │                      │
 │                        │                      │                    │  Execute Tx          │
 │                        │                      │                    │  (Gas Sponsored)     │
 │                        │                      │                    ├─────────────────────>│
 │                        │                      │                    │                      │
 │                        │                      │                    │   Emit Events        │
 │                        │                      │                    │<─────────────────────┤
 │                        │                      │                    │                      │
 │                        │  Tx Receipt          │                    │                      │
 │                        │<─────────────────────┤                    │                      │
 │                        │                      │                    │                      │
 │  Success Message       │                      │                    │                      │
 │  (No Gas Paid!)        │                      │                    │                      │
 │<───────────────────────┤                      │                    │                      │
 │                        │                      │                    │                      │
```

---

## Smart Contract Architecture

### GaslessInteraction Contract

```
┌─────────────────────────────────────────────────────────────┐
│                   GaslessInteraction.sol                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Inheritance:                                                 │
│  ├─ PrimaryProdDataServiceConsumerBase (RedStone)           │
│  ├─ Ownable (OpenZeppelin)                                   │
│  └─ ReentrancyGuard (OpenZeppelin)                          │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  State Variables:                                             │
│  ├─ mapping(address => PriceAlert[]) userAlerts             │
│  ├─ mapping(address => UserAction[]) userActions            │
│  └─ mapping(address => uint256) userInteractionCount        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  View Functions (Free):                                       │
│  ├─ getLatestPrice(bytes32)                                  │
│  ├─ getPriceBySymbol(string)                                 │
│  ├─ getMultiplePrices(bytes32[])                            │
│  ├─ getUserAlerts(address)                                   │
│  ├─ getUserActions(address)                                  │
│  └─ getUserInteractionCount(address)                         │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Gasless Functions (Paymaster Sponsored):                    │
│  ├─ recordPriceQuery(bytes32)                               │
│  ├─ setPriceAlert(bytes32, uint256, bool)                   │
│  ├─ executePriceBasedAction(bytes32, uint256)               │
│  ├─ batchRecordPrices(bytes32[])                            │
│  └─ cancelAlert(uint256)                                     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Events:                                                      │
│  ├─ PriceQueried(address, bytes32, uint256, uint256)        │
│  ├─ PriceAlertSet(address, bytes32, uint256, bool)          │
│  └─ ActionExecuted(address, string, uint256)                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Component Tree

```
App (main.tsx)
│
├─ WalletProvider (contexts/WalletContext.tsx)
│  │
│  └─ Routes
│     │
│     ├─ Dashboard (/)
│     │  ├─ WalletConnect
│     │  ├─ TokenStats
│     │  ├─ NFTStats
│     │  └─ QuickActions
│     │
│     ├─ PriceDataPage (/prices)
│     │  ├─ usePriceFeed('ETH')
│     │  ├─ usePriceFeed('BTC')
│     │  ├─ usePriceFeed('LINK')
│     │  └─ PriceCards
│     │     ├─ ETH Card
│     │     ├─ BTC Card
│     │     └─ LINK Card
│     │
│     ├─ GaslessTransactions (/gasless) [NEW]
│     │  ├─ useGaslessTransactions()
│     │  ├─ useActiveAccount()
│     │  ├─ ConnectButton
│     │  └─ Action Cards
│     │     ├─ Record Price Query
│     │     ├─ Set Price Alert
│     │     ├─ Execute Price Action
│     │     └─ User Statistics
│     │
│     └─ ActivityFeed (/activity)
│        ├─ useContractActivity()
│        └─ ActivityList
│
└─ Theme & Global Styles
```

---

## Configuration Architecture

### Environment Variables Flow

```
Development:
.env file → Vite → import.meta.env → Application Code

Production:
Hosting Platform Env Vars → Build Process → Bundled App
```

### Required Environment Variables

**Frontend:**
```
VITE_THIRDWEB_CLIENT_ID
VITE_GASLESS_INTERACTION_ADDRESS
VITE_FACTORY_ADDRESS
```

**Smart Contracts:**
```
PRIVATE_KEY
LISK_SEPOLIA_RPC
ETHERSCAN_API_KEY (optional, for verification)
```

---

## Technology Stack Details

### Smart Contracts Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Language | Solidity 0.8.17 | Smart contract development |
| Framework | Foundry | Testing & deployment |
| Oracle | RedStone Finance | Price feed data |
| Security | OpenZeppelin | Battle-tested contracts |
| Standard | ERC-4337 | Account Abstraction |

### Frontend Layer

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19.1.1 | UI framework |
| Language | TypeScript | 5.9.3 | Type safety |
| Build Tool | Vite | 7.1.7 | Fast builds |
| Web3 SDK | Thirdweb | 5.111.0 | AA & gasless |
| Wallet | Web3Modal | 3.5.3 | Multi-wallet support |
| Routing | React Router | 6.30.1 | SPA routing |
| Styling | CSS | Custom | Modern UI |

### Infrastructure Layer

| Service | Provider | Purpose |
|---------|----------|---------|
| Blockchain | Lisk Sepolia | L2 testnet |
| RPC | Lisk | Network access |
| Explorer | BlockScout | Transaction viewing |
| Oracles | RedStone | Price data |
| AA Infrastructure | Thirdweb | Paymaster & bundler |
| Smart Wallets | Thirdweb | ERC-4337 wallets |

---

## Security Architecture

### Smart Contract Security

```
┌────────────────────────────────────────┐
│         Security Layers                 │
├────────────────────────────────────────┤
│                                         │
│  1. Access Control                      │
│     ├─ Ownable (admin functions)       │
│     └─ User validation                  │
│                                         │
│  2. Reentrancy Protection               │
│     └─ ReentrancyGuard on all mutating │
│        functions                        │
│                                         │
│  3. Input Validation                    │
│     ├─ Array bounds checking            │
│     ├─ Address validation               │
│     └─ Price sanity checks             │
│                                         │
│  4. Safe Math                           │
│     └─ Solidity 0.8+ overflow protection│
│                                         │
│  5. Oracle Security                     │
│     ├─ Signed price data                │
│     ├─ Timestamp validation             │
│     └─ Trusted signers                  │
│                                         │
└────────────────────────────────────────┘
```

### Frontend Security

- Environment variables never exposed to client
- Private keys never in frontend code
- HTTPS enforced in production
- CSP headers recommended
- Input sanitization on all forms

---

## Performance Optimizations

### Gas Optimization Techniques

1. **Batch Operations**
   - `batchRecordPrices()` - Multiple queries in one tx

2. **Storage Optimization**
   - Packed structs
   - uint256 for counters (cheaper than smaller types)
   - Events for historical data (not storage)

3. **View Functions**
   - No gas cost for read operations
   - Can be called off-chain

### Frontend Optimizations

1. **Code Splitting**
   - Route-based lazy loading
   - Component lazy loading

2. **State Management**
   - React hooks for local state
   - Context for global state

3. **API Calls**
   - Price data cached for 30 seconds
   - Debounced user inputs

---

## Deployment Pipeline

```
┌──────────────┐
│  Developer   │
│  Workstation │
└──────┬───────┘
       │
       │ 1. Deploy Contracts
       ▼
┌──────────────────┐
│  deploy-         │
│  contracts.ps1   │
└──────┬───────────┘
       │
       │ 2. Foundry Build
       ▼
┌──────────────────┐
│  Lisk Sepolia    │
│  Testnet         │
└──────┬───────────┘
       │
       │ 3. Get Contract Address
       ▼
┌──────────────────┐
│  Configure       │
│  Frontend .env   │
└──────┬───────────┘
       │
       │ 4. Build Frontend
       ▼
┌──────────────────┐
│  setup-          │
│  frontend.ps1    │
└──────┬───────────┘
       │
       │ 5. npm run build
       ▼
┌──────────────────┐
│  Production      │
│  Hosting         │
│  (Vercel/etc)    │
└──────────────────┘
```

---

## Monitoring & Analytics

### On-Chain Metrics

- Total gasless transactions executed
- Unique users interacting
- Price queries per asset
- Active alerts set
- Gas fees sponsored (in USD)

### Frontend Metrics

- Page views per route
- Wallet connection rate
- Transaction success rate
- Average session duration
- User retention

---

## Extension Points

### Easy to Add

1. **New Price Feeds**
   - Add symbol to frontend array
   - RedStone supports 1000+ assets

2. **New Gasless Functions**
   - Add function to GaslessInteraction.sol
   - Add hook in frontend
   - Automatic paymaster support

3. **New UI Routes**
   - Add route in App.tsx
   - Create component
   - Link from navigation

### Moderate Complexity

1. **Multi-Chain Support**
   - Deploy to other chains
   - Add chain switcher UI
   - Update contract addresses per chain

2. **Custom Paymaster Rules**
   - Deploy own paymaster
   - Set spending limits
   - Whitelist users

3. **Historical Data**
   - Add price history tracking
   - Chart integration
   - Database for off-chain storage

---

## Scalability Considerations

### Smart Contract Scalability

- **Gas Efficient**: Optimized for low gas costs
- **Batch Operations**: Multiple actions in one tx
- **Off-Chain Indexing**: Use events for history

### Frontend Scalability

- **Static Site**: Can be deployed to CDN
- **No Backend**: Serverless architecture
- **Caching**: Browser caching for assets

### Infrastructure Scalability

- **Lisk L2**: Fast and cheap transactions
- **Thirdweb**: Enterprise-grade AA infrastructure
- **RedStone**: Handles high query volume

---

## Conclusion

This architecture provides:

✅ **Modularity** - Easy to extend and modify
✅ **Security** - Multiple security layers
✅ **Performance** - Optimized for speed and cost
✅ **Scalability** - Ready for production use
✅ **User Experience** - Gasless and seamless

The combination of RedStone oracles and ERC-4337 Account Abstraction creates a powerful, user-friendly dApp that showcases modern Web3 capabilities.

---

*Architecture Version: 1.0*
*Last Updated: November 2024*
