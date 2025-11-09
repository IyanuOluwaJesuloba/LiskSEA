# LiskSEA - Oracle & Gasless Transaction dApp

A decentralized application built on Lisk Sepolia testnet that demonstrates:
- ✨ **RedStone Oracle Integration** for live price feeds
- 🚀 **ERC-4337 Account Abstraction** for gasless transactions
- 💰 **Paymaster-sponsored operations** using Thirdweb
- 🎨 **Modern React UI** with TypeScript and Vite

## 🌟 Features

### RedStone Oracle Integration
- Real-time price feeds for ETH, BTC, LINK, USDC, USDT
- On-chain price data with 8 decimal precision
- Batch price queries for gas optimization
- PrimaryProdDataServiceConsumerBase integration

### Gasless Transactions (ERC-4337)
- Smart wallet support via Thirdweb
- Zero gas fees for users
- Transaction sponsorship through paymaster
- User-friendly onboarding without ETH

### Interactive Features
- 📊 **Price Query Recording**: Track price data on-chain
- 🔔 **Price Alerts**: Set alerts for target prices
- ⚡ **Price-Based Actions**: Execute actions based on price thresholds
- 📈 **User Statistics**: Track interactions and gas savings

## 🏗️ Architecture

```
LiskSEA/
├── contract/              # Smart contracts (Foundry)
│   ├── src/
│   │   ├── PriceConsumer.sol          # RedStone oracle consumer
│   │   ├── GaslessInteraction.sol     # Main gasless contract
│   │   ├── Token.sol                  # ERC20 token
│   │   └── NFT.sol                    # ERC721 NFT
│   └── script/                        # Deployment scripts
│
└── frontend/              # React frontend (Vite + TypeScript)
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.tsx
    │   │   ├── PriceDataPage.tsx
    │   │   └── GaslessTransactions.tsx  # Gasless UI
    │   ├── hooks/
    │   │   ├── usePriceData.ts
    │   │   └── useGaslessTransactions.ts
    │   └── config/
    │       ├── thirdweb.ts              # Thirdweb & AA config
    │       └── contracts.ts
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Foundry
- MetaMask wallet
- Lisk Sepolia testnet ETH ([Get from faucet](https://sepolia-faucet.lisk.com/))
- Thirdweb API key ([Get from dashboard](https://thirdweb.com/dashboard))

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd LiskSEA
```

### 2. Deploy Smart Contracts

```powershell
cd contract

# Set up environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# Deploy GaslessInteraction contract
forge script script/DeployGaslessInteraction.s.sol:DeployGaslessInteraction --rpc-url https://rpc.sepolia-api.lisk.com --broadcast --verify
```

### 3. Configure Frontend

```powershell
cd ../frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with:
# - VITE_THIRDWEB_CLIENT_ID
# - VITE_GASLESS_INTERACTION_ADDRESS
# - VITE_FACTORY_ADDRESS
```

### 4. Run the Application

```powershell
npm run dev
```

Visit `http://localhost:5173`

## 📖 Usage Guide

### View Live Oracle Prices
1. Navigate to **Dashboard** or **Prices** page
2. View real-time prices for ETH, BTC, LINK
3. Prices update every 30 seconds

### Execute Gasless Transactions
1. Go to **/gasless** page
2. Connect your wallet (smart wallet will be created automatically)
3. Choose an action:
   - **Record Price Query**: Save current price on-chain (FREE)
   - **Set Price Alert**: Create a price notification (FREE)
   - **Execute Price Action**: Run price-based logic (FREE)

All transactions are sponsored by the paymaster - no ETH required!

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_THIRDWEB_CLIENT_ID=your_client_id
VITE_GASLESS_INTERACTION_ADDRESS=0x...
VITE_FACTORY_ADDRESS=0x...
```

**Contract (.env)**
```env
PRIVATE_KEY=your_private_key
LISK_SEPOLIA_RPC=https://rpc.sepolia-api.lisk.com
```

## 🧪 Testing

### Smart Contracts
```powershell
cd contract
forge test
```

### Frontend
```powershell
cd frontend
npm run lint
npm run build
```

## 📊 Smart Contracts

### GaslessInteraction.sol
Main contract for gasless operations with oracle integration.

**Key Functions:**
- `getLatestPrice(bytes32 dataFeedId)` - Get price from RedStone
- `recordPriceQuery(bytes32 dataFeedId)` - Record price query (gasless)
- `setPriceAlert(...)` - Set price alert (gasless)
- `executePriceBasedAction(...)` - Execute conditional action (gasless)

**Deployed to:** Lisk Sepolia
**Explorer:** [View on BlockScout](https://sepolia-blockscout.lisk.com/)

### PriceConsumer.sol
RedStone oracle consumer for price feeds.

**Key Functions:**
- `getPriceBySymbol(string symbol)` - Get price by asset symbol
- `getLatestPrice(bytes32 dataFeedId)` - Get raw price data

## 🌐 Network Configuration

**Lisk Sepolia Testnet**
- Chain ID: 4202
- RPC: `https://rpc.sepolia-api.lisk.com`
- Explorer: `https://sepolia-blockscout.lisk.com`
- Faucet: `https://sepolia-faucet.lisk.com/`

## 🛠️ Tech Stack

### Smart Contracts
- Solidity ^0.8.17
- Foundry
- OpenZeppelin Contracts
- RedStone Finance EVM Connector

### Frontend
- React 19
- TypeScript
- Vite
- Thirdweb SDK v5
- TailwindCSS (via App.css)
- React Router v6

### Infrastructure
- Lisk Sepolia Testnet
- RedStone Oracles
- Thirdweb Account Abstraction
- Thirdweb Paymaster

## 📝 Key Concepts

### RedStone Oracles
RedStone provides decentralized, reliable price feeds. Prices are:
- Updated frequently
- Cryptographically signed
- Gas-efficient (data passed in transaction calldata)

### ERC-4337 Account Abstraction
Enables:
- Smart contract wallets
- Gasless transactions (paymaster sponsorship)
- Better UX (no seed phrases, social recovery)
- Batch transactions

### Paymaster
Sponsors transaction gas fees, allowing users to interact without ETH.

## 🚧 Development Roadmap

- [x] RedStone oracle integration
- [x] Gasless transaction support
- [x] Basic price monitoring UI
- [ ] Enhanced price alerts with notifications
- [ ] Multi-chain support
- [ ] Advanced analytics dashboard
- [ ] Mobile app

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🔗 Links

- [Lisk Documentation](https://docs.lisk.com/)
- [RedStone Oracles](https://docs.redstone.finance/)
- [Thirdweb Docs](https://portal.thirdweb.com/)
- [ERC-4337 Spec](https://eips.ethereum.org/EIPS/eip-4337)

## 📞 Support

- GitHub Issues: [Create an issue]
- Lisk Discord: [Join community](https://discord.gg/lisk)
- Thirdweb Discord: [Get help](https://discord.gg/thirdweb)

---

Built with ❤️ on Lisk Sepolia using RedStone Oracles and Thirdweb Account Abstraction
