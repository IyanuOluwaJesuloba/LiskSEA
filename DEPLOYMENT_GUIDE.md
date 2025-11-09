# LiskSEA Deployment Guide

Complete guide for deploying the LiskSEA dApp with RedStone Oracles and Gasless Transactions (ERC-4337 Account Abstraction) on Lisk Sepolia Testnet.

## Prerequisites

- Node.js (v16+)
- Foundry (for smart contract deployment)
- MetaMask or compatible Web3 wallet
- Lisk Sepolia testnet ETH (get from [Lisk Sepolia Faucet](https://sepolia-faucet.lisk.com/))
- Thirdweb API key (get from [Thirdweb Dashboard](https://thirdweb.com/dashboard))

## Part 1: Smart Contract Deployment

### 1. Navigate to Contract Directory

```powershell
cd contract
```

### 2. Set Up Environment Variables

Create a `.env` file in the `contract` directory:

```bash
PRIVATE_KEY=your_wallet_private_key_here
LISK_SEPOLIA_RPC=https://rpc.sepolia-api.lisk.com
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
```

### 3. Deploy GaslessInteraction Contract

```powershell
forge script script/DeployGaslessInteraction.s.sol:DeployGaslessInteraction --rpc-url $env:LISK_SEPOLIA_RPC --broadcast --verify -vvvv
```

**Save the deployed contract address!** You'll need it for the frontend configuration.

Example output:
```
GaslessInteraction deployed to: 0x1234567890123456789012345678901234567890
```

### 4. (Optional) Deploy or Verify Existing Contracts

If you need to deploy the PriceConsumer contract:

```powershell
forge script script/DeployPriceConsumer.s.sol:DeployPriceConsumer --rpc-url $env:LISK_SEPOLIA_RPC --broadcast --verify -vvvv
```

## Part 2: Thirdweb Configuration for Gasless Transactions

### 1. Create Thirdweb Account

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Sign up or log in
3. Create a new API key

### 2. Configure Smart Wallet (Account Abstraction)

1. In Thirdweb Dashboard, go to **Account Abstraction**
2. Select **Lisk Sepolia** as your network
3. Deploy an **Account Factory** contract (if you don't have one)
4. **Note the Factory Address** - you'll need this for the frontend

### 3. Set Up Paymaster (For Gasless Transactions)

**Option A: Use Thirdweb's Paymaster (Recommended for testing)**

1. In Thirdweb Dashboard, go to **Account Abstraction** → **Paymasters**
2. Enable paymaster for Lisk Sepolia
3. Thirdweb will sponsor transactions automatically for testing

**Option B: Deploy Your Own Paymaster**

If you want to deploy your own paymaster contract for production:
- Follow [Thirdweb's Paymaster documentation](https://portal.thirdweb.com/account-abstraction/paymaster)
- Deploy to Lisk Sepolia
- Fund the paymaster with ETH

## Part 3: Frontend Configuration

### 1. Navigate to Frontend Directory

```powershell
cd ..\frontend
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_from_dashboard

# Smart Contract Addresses
VITE_GASLESS_INTERACTION_ADDRESS=0x_your_deployed_gasless_interaction_address
VITE_FACTORY_ADDRESS=0x_your_account_factory_address_from_thirdweb

# Optional: Custom Paymaster (if not using Thirdweb's default)
# VITE_PAYMASTER_URL=https://your-paymaster-url.com
```

### 4. Update Contract Addresses

If needed, update the contract addresses in `frontend/src/config/contracts.ts`:

```typescript
export const CHAIN_CONFIG = {
  priceConsumerAddress: '0x_your_price_consumer_address',
  gaslessInteractionAddress: import.meta.env.VITE_GASLESS_INTERACTION_ADDRESS || '',
};
```

## Part 4: Running the Application

### 1. Start the Development Server

```powershell
npm run dev
```

The application will be available at `http://localhost:5173`

### 2. Test the Features

#### Testing RedStone Oracle Integration:

1. Navigate to **/prices** route
2. View live price feeds for ETH, BTC, and LINK
3. Prices are fetched from RedStone oracles

#### Testing Gasless Transactions:

1. Navigate to **/gasless** route
2. Connect your wallet
3. Try the following gasless operations:
   - **Record Price Query**: Query current price without gas fees
   - **Set Price Alert**: Create a price alert without paying gas
   - **Execute Price Action**: Perform price-based actions gaslessly

All transactions on the `/gasless` page are sponsored by the paymaster!

## Part 5: Production Deployment

### 1. Build the Frontend

```powershell
npm run build
```

### 2. Deploy to Hosting Platform

**Option A: Vercel**
```powershell
npm install -g vercel
vercel
```

**Option B: Netlify**
```powershell
npm install -g netlify-cli
netlify deploy --prod
```

**Option C: Traditional Web Server**
- Copy the contents of `dist/` folder to your web server
- Configure your web server to serve the index.html for all routes (SPA routing)

### 3. Set Environment Variables in Production

Make sure to set all environment variables in your hosting platform:
- `VITE_THIRDWEB_CLIENT_ID`
- `VITE_GASLESS_INTERACTION_ADDRESS`
- `VITE_FACTORY_ADDRESS`

## Troubleshooting

### Issue: Transactions Failing

**Solution:**
- Ensure your GaslessInteraction contract is properly deployed
- Verify the contract address in your `.env` file
- Check that the Thirdweb paymaster is enabled for Lisk Sepolia

### Issue: Oracle Price Data Not Loading

**Solution:**
- The PriceConsumer contract requires RedStone oracle data
- Ensure the contract is deployed correctly
- Check that you're on the Lisk Sepolia network

### Issue: Smart Wallet Not Working

**Solution:**
- Verify your Factory Address is correct
- Ensure Account Abstraction is enabled in Thirdweb Dashboard
- Check that you have the correct Thirdweb Client ID

## Cost Estimation

### Smart Contract Deployment Costs:
- **GaslessInteraction Contract**: ~0.005-0.01 ETH
- **Account Factory**: Free (using Thirdweb)
- **Paymaster Funding**: Variable (depends on usage)

### Gasless Transaction Costs:
- **User**: $0.00 (completely gasless!)
- **Paymaster**: ~$0.10-0.50 per transaction (sponsored)

## Key Features Implemented

✅ **RedStone Oracle Integration**
- Live price feeds for multiple assets
- On-chain price data with 8 decimal precision
- Batch price queries for gas efficiency

✅ **ERC-4337 Account Abstraction**
- Smart wallet support via Thirdweb
- Gasless transaction execution
- User-friendly onboarding (no ETH required)

✅ **Paymaster Integration**
- Transaction sponsorship
- Zero gas fees for users
- Configurable paymaster URL

✅ **Interactive dApp Features**
- Price query recording
- Price alert system
- Price-based action execution
- User interaction tracking

## Next Steps

1. **Add More Assets**: Extend the oracle integration to support more price feeds
2. **Enhanced Alerts**: Implement off-chain monitoring for price alerts
3. **Analytics Dashboard**: Add detailed analytics for gasless transactions
4. **Mobile Support**: Optimize the UI for mobile devices
5. **Testing**: Write comprehensive tests for smart contracts and frontend

## Resources

- [Lisk Documentation](https://docs.lisk.com/)
- [RedStone Oracles](https://docs.redstone.finance/)
- [Thirdweb Docs](https://portal.thirdweb.com/)
- [ERC-4337 Standard](https://eips.ethereum.org/EIPS/eip-4337)
- [Lisk Block Explorer](https://sepolia-blockscout.lisk.com/)

## Support

For issues or questions:
- Open an issue on GitHub
- Check the Lisk Discord
- Review Thirdweb documentation

---

**Congratulations!** You've successfully deployed a dApp with oracle integration and gasless transactions on Lisk Sepolia! 🎉
