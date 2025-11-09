# LiskSEA Deployment Checklist

Use this checklist to ensure successful deployment of your dApp.

## Pre-Deployment Checklist

### ✅ Prerequisites

- [ ] Node.js v16+ installed
  - Check: `node --version`
  - Install: https://nodejs.org/

- [ ] Foundry installed
  - Check: `forge --version`
  - Install: https://book.getfoundry.sh/

- [ ] MetaMask or compatible wallet installed
  - Download: https://metamask.io/

- [ ] Wallet has Lisk Sepolia ETH (minimum 0.01 ETH)
  - Get from: https://sepolia-faucet.lisk.com/

- [ ] Thirdweb account created
  - Sign up: https://thirdweb.com/dashboard

---

## Phase 1: Thirdweb Setup

### ✅ Create Thirdweb Project

- [ ] Log into Thirdweb Dashboard
- [ ] Create new project
- [ ] Copy Client ID
  - Save it: `VITE_THIRDWEB_CLIENT_ID=_______________`

### ✅ Configure Account Abstraction

- [ ] Navigate to "Account Abstraction" section
- [ ] Select network: **Lisk Sepolia**
- [ ] Deploy Account Factory (or use existing)
- [ ] Copy Factory Address
  - Save it: `VITE_FACTORY_ADDRESS=0x_______________`

### ✅ Enable Paymaster

- [ ] Go to "Paymasters" section
- [ ] Enable paymaster for Lisk Sepolia
- [ ] Confirm sponsorship is active
- [ ] (Optional) Configure sponsorship rules

**Thirdweb Setup Complete? ✅**

---

## Phase 2: Smart Contract Deployment

### ✅ Prepare Contract Environment

- [ ] Navigate to `contract/` directory
- [ ] Create `.env` file
  ```bash
  cp .env.example .env
  ```
- [ ] Add your private key to `.env`:
  ```
  PRIVATE_KEY=your_private_key_here
  LISK_SEPOLIA_RPC=https://rpc.sepolia-api.lisk.com
  ```
- [ ] ⚠️ **SECURITY**: Never commit `.env` to git!

### ✅ Build Contracts

- [ ] Run: `forge build`
- [ ] Verify: Build completes without errors
- [ ] Check: `out/` directory created

### ✅ Deploy GaslessInteraction Contract

**Option A: Automated (Recommended)**
- [ ] Run: `.\deploy-contracts.ps1` (from root directory)
- [ ] Wait for deployment confirmation
- [ ] Copy contract address from output
  - Save it: `VITE_GASLESS_INTERACTION_ADDRESS=0x_______________`

**Option B: Manual**
- [ ] Run deployment command:
  ```powershell
  forge script script/DeployGaslessInteraction.s.sol:DeployGaslessInteraction \
    --rpc-url https://rpc.sepolia-api.lisk.com \
    --broadcast \
    --verify \
    -vvvv
  ```
- [ ] Copy contract address from output
  - Save it: `VITE_GASLESS_INTERACTION_ADDRESS=0x_______________`

### ✅ Verify Deployment

- [ ] Check deployment on BlockScout:
  - URL: `https://sepolia-blockscout.lisk.com/address/YOUR_ADDRESS`
- [ ] Confirm contract is verified (green checkmark)
- [ ] Verify contract code is readable on explorer

**Smart Contracts Deployed? ✅**

---

## Phase 3: Frontend Configuration

### ✅ Prepare Frontend Environment

- [ ] Navigate to `frontend/` directory
- [ ] Create `.env` file
  ```bash
  cp .env.example .env
  ```

### ✅ Configure Environment Variables

Edit `frontend/.env` with your values:

- [ ] Set Thirdweb Client ID:
  ```
  VITE_THIRDWEB_CLIENT_ID=your_client_id_from_phase_1
  ```

- [ ] Set Gasless Contract Address:
  ```
  VITE_GASLESS_INTERACTION_ADDRESS=0x_from_phase_2
  ```

- [ ] Set Factory Address:
  ```
  VITE_FACTORY_ADDRESS=0x_from_phase_1
  ```

### ✅ Install Dependencies

- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] Verify: `node_modules/` directory created
- [ ] Check: No critical errors in output

### ✅ Build Check

- [ ] Run: `npm run build`
- [ ] Verify: Build completes successfully
- [ ] Check: `dist/` directory created

**Frontend Configured? ✅**

---

## Phase 4: Testing

### ✅ Start Development Server

- [ ] Run: `npm run dev`
- [ ] Verify: Server starts on port 5173
- [ ] Open: http://localhost:5173

### ✅ Test Wallet Connection

- [ ] Click "Connect Wallet" button
- [ ] Connect MetaMask
- [ ] Switch to Lisk Sepolia if prompted
- [ ] Verify: Wallet address displayed

### ✅ Test Oracle Integration

- [ ] Navigate to `/prices` route
- [ ] Verify: Prices displayed for ETH, BTC, LINK
- [ ] Check: Prices look reasonable (match market rates)
- [ ] Wait 30 seconds
- [ ] Verify: Prices update automatically

### ✅ Test Gasless Transactions

- [ ] Navigate to `/gasless` route
- [ ] Verify: Page loads without errors
- [ ] Check: Contract address displayed correctly
- [ ] Select "ETH" from dropdown
- [ ] Click "Record Price (Gasless)" button
- [ ] **CRITICAL**: Check MetaMask
  - Should show transaction
  - **Gas fee should be $0.00 or sponsored**
- [ ] Approve transaction
- [ ] Verify: Success message displayed
- [ ] Check: "Gasless Interactions" counter incremented
- [ ] Verify: "Gas Saved" amount updated

### ✅ Test All Features

**Record Price Query:**
- [ ] Select different asset
- [ ] Click "Record Price"
- [ ] Transaction completes without gas

**Set Price Alert:**
- [ ] Enter target price
- [ ] Select "Above" or "Below"
- [ ] Click "Set Alert"
- [ ] Transaction completes without gas

**Execute Price Action:**
- [ ] Enter threshold price
- [ ] Click "Execute Action"
- [ ] Transaction completes without gas

### ✅ Verify On-Chain

- [ ] Go to BlockScout
- [ ] Search for your wallet address
- [ ] Verify: Transactions appear in history
- [ ] Check: Transactions show as "sponsored" or $0 gas
- [ ] Click transaction
- [ ] Verify: Interacts with GaslessInteraction contract

**All Tests Passing? ✅**

---

## Phase 5: Production Deployment (Optional)

### ✅ Prepare for Production

- [ ] Run full build: `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Verify: All features work in build

### ✅ Deploy Frontend

**Option A: Vercel**
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run: `vercel`
- [ ] Follow prompts
- [ ] Set environment variables in Vercel dashboard

**Option B: Netlify**
- [ ] Install Netlify CLI: `npm i -g netlify-cli`
- [ ] Run: `netlify deploy --prod`
- [ ] Set environment variables in Netlify dashboard

**Option C: Custom Server**
- [ ] Upload `dist/` contents to server
- [ ] Configure web server for SPA routing
- [ ] Set environment variables on server

### ✅ Post-Deploy Verification

- [ ] Visit production URL
- [ ] Test wallet connection
- [ ] Test all features
- [ ] Verify transactions work
- [ ] Check mobile responsiveness

**Production Deployed? ✅**

---

## Phase 6: Documentation & Maintenance

### ✅ Document Your Deployment

- [ ] Save all contract addresses
- [ ] Document environment variables
- [ ] Take screenshots of successful transactions
- [ ] Note any issues encountered

### ✅ Share Your dApp

- [ ] Create GitHub README with your contract addresses
- [ ] Share on social media
- [ ] Submit to Lisk ecosystem showcase
- [ ] Join Lisk Discord and share

### ✅ Monitor & Maintain

- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Monitor paymaster balance (if using custom)
- [ ] Track user feedback
- [ ] Plan feature updates

**All Done? ✅**

---

## Troubleshooting

### Common Issues

#### "Transaction Failed"
- [ ] Check: Is paymaster enabled?
- [ ] Check: Is factory address correct?
- [ ] Check: Are you on Lisk Sepolia?
- [ ] Try: Reconnect wallet

#### "Cannot Read Price Data"
- [ ] Check: Is PriceConsumer deployed?
- [ ] Check: Is contract address correct?
- [ ] Try: Refresh page

#### "Wallet Won't Connect"
- [ ] Check: Is MetaMask installed?
- [ ] Check: Is Lisk Sepolia added to MetaMask?
- [ ] Try: Reset MetaMask connection

#### "Build Fails"
- [ ] Check: Node version (v16+)
- [ ] Try: Delete `node_modules` and reinstall
- [ ] Check: All environment variables set

---

## Support Resources

- 📖 **DEPLOYMENT_GUIDE.md** - Detailed instructions
- 🚀 **QUICK_START.md** - Fast setup guide
- 📋 **IMPLEMENTATION_SUMMARY.md** - Technical details
- 💬 **Lisk Discord** - Community support
- 🔧 **Thirdweb Docs** - Technical documentation

---

## Success Metrics

Your deployment is successful when:

✅ All checkboxes above are completed
✅ Gasless transactions work without MetaMask gas prompts
✅ Price data loads and updates correctly
✅ No console errors in browser
✅ Contract is verified on BlockScout
✅ You can demo all features to someone else

---

## Next Steps After Deployment

1. **Test Thoroughly** - Try all features multiple times
2. **Get Feedback** - Share with friends, get their input
3. **Plan Features** - Think about what to add next
4. **Monitor Usage** - Track how users interact
5. **Iterate** - Improve based on feedback

---

## 🎉 Congratulations!

If you've checked all boxes above, you've successfully deployed a production-ready dApp with:
- ✅ Live oracle price feeds
- ✅ Gasless transactions via Account Abstraction
- ✅ Modern, professional UI
- ✅ Automated deployment scripts

**Share your success with the Lisk community!** 🚀

---

*Created: November 2024*
*Version: 1.0*
