# LiskSEA Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] Foundry installed (for smart contracts)
- [ ] MetaMask wallet with Lisk Sepolia ETH
- [ ] Thirdweb account created

## Step-by-Step Setup

### 1. Get Testnet ETH (2 minutes)

```
1. Visit: https://sepolia-faucet.lisk.com/
2. Connect your wallet
3. Request testnet ETH
```

### 2. Get Thirdweb API Key (3 minutes)

```
1. Visit: https://thirdweb.com/dashboard
2. Sign up / Log in
3. Create new project
4. Copy your Client ID
5. In "Account Abstraction" section:
   - Select "Lisk Sepolia"
   - Deploy Account Factory (or use existing)
   - Copy Factory Address
```

### 3. Deploy Smart Contracts (2 minutes)

```powershell
# In project root directory
cd contract
cp .env.example .env

# Edit .env and add your PRIVATE_KEY
notepad .env

# Deploy
cd ..
.\deploy-contracts.ps1
```

**Save the contract address from the output!**

### 4. Configure Frontend (1 minute)

```powershell
# In project root directory
.\setup-frontend.ps1
```

When prompted, enter:
- **VITE_THIRDWEB_CLIENT_ID**: From step 2
- **VITE_GASLESS_INTERACTION_ADDRESS**: From step 3
- **VITE_FACTORY_ADDRESS**: From step 2

### 5. Run the App (1 minute)

```powershell
cd frontend
npm run dev
```

Visit `http://localhost:5173` and enjoy! 🎉

## Quick Test Checklist

Once the app is running:

### ✅ Test Oracle Integration
1. Go to `/prices` route
2. You should see live prices for ETH, BTC, LINK
3. Prices update automatically

### ✅ Test Gasless Transactions
1. Go to `/gasless` route
2. Connect your wallet
3. Click "Record Price (Gasless)"
4. Transaction completes **without paying gas**!
5. Check "Your Statistics" - it shows gas saved

## Troubleshooting

### "Transaction Failed"
- **Check**: Is your contract deployed?
- **Check**: Is the address in `.env` correct?
- **Check**: Is Account Abstraction enabled in Thirdweb?

### "Cannot connect wallet"
- **Check**: Is MetaMask installed?
- **Check**: Are you on Lisk Sepolia network?
- **Solution**: Click "Switch to Lisk" button

### "Price data not loading"
- **Check**: Is the PriceConsumer contract deployed?
- **Check**: Are you on the correct network?

## What You've Built

✅ **Smart Contracts**
- GaslessInteraction.sol - Main contract with AA support
- PriceConsumer.sol - RedStone oracle integration

✅ **Features**
- Live price feeds from RedStone oracles
- Gasless transactions via ERC-4337
- User-friendly interface
- No ETH needed for transactions

## Next Steps

- [ ] Add more price feeds
- [ ] Customize the UI
- [ ] Deploy to production
- [ ] Add notifications for price alerts

## Useful Links

- **Lisk Docs**: https://docs.lisk.com/
- **RedStone Docs**: https://docs.redstone.finance/
- **Thirdweb Docs**: https://portal.thirdweb.com/
- **Block Explorer**: https://sepolia-blockscout.lisk.com/

## Need Help?

- Check DEPLOYMENT_GUIDE.md for detailed instructions
- Review README.md for architecture details
- Open an issue on GitHub
- Join Lisk Discord

---

**Estimated total time**: 10-15 minutes

Happy building! 🚀
