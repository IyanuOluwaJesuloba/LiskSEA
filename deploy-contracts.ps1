# PowerShell script to deploy smart contracts to Lisk Sepolia

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LiskSEA Contract Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envPath = "contract\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "Error: .env file not found in contract directory!" -ForegroundColor Red
    Write-Host "Please create contract\.env with your PRIVATE_KEY" -ForegroundColor Yellow
    exit 1
}

# Navigate to contract directory
Set-Location contract

Write-Host "Step 1: Checking Foundry installation..." -ForegroundColor Green
try {
    $forgeVersion = forge --version
    Write-Host "Foundry is installed: $forgeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Foundry not found! Please install Foundry first." -ForegroundColor Red
    Write-Host "Visit: https://book.getfoundry.sh/getting-started/installation" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Step 2: Building contracts..." -ForegroundColor Green
forge build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Contract build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Step 3: Deploying GaslessInteraction contract..." -ForegroundColor Green
Write-Host "Network: Lisk Sepolia" -ForegroundColor Yellow
Write-Host ""

$deployOutput = forge script script/DeployGaslessInteraction.s.sol:DeployGaslessInteraction `
    --rpc-url https://rpc.sepolia-api.lisk.com `
    --broadcast `
    --verify `
    -vvvv 2>&1

Write-Host $deployOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Try to extract contract address from output
    $addressMatch = $deployOutput | Select-String -Pattern "GaslessInteraction deployed to: (0x[a-fA-F0-9]{40})"
    if ($addressMatch) {
        $contractAddress = $addressMatch.Matches[0].Groups[1].Value
        Write-Host "Contract Address: $contractAddress" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Copy the contract address above" -ForegroundColor White
        Write-Host "2. Update frontend\.env:" -ForegroundColor White
        Write-Host "   VITE_GASLESS_INTERACTION_ADDRESS=$contractAddress" -ForegroundColor Gray
        Write-Host "3. Get your Thirdweb Client ID from https://thirdweb.com/dashboard" -ForegroundColor White
        Write-Host "4. Configure Account Abstraction in Thirdweb Dashboard" -ForegroundColor White
        Write-Host "5. Run: npm install && npm run dev in frontend directory" -ForegroundColor White
        Write-Host ""
        Write-Host "View on BlockScout:" -ForegroundColor White
        Write-Host "https://sepolia-blockscout.lisk.com/address/$contractAddress" -ForegroundColor Blue
    } else {
        Write-Host "Note: Could not automatically extract contract address." -ForegroundColor Yellow
        Write-Host "Please check the deployment output above for the contract address." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Insufficient funds - Get ETH from https://sepolia-faucet.lisk.com/" -ForegroundColor White
    Write-Host "2. Invalid private key in .env file" -ForegroundColor White
    Write-Host "3. Network connectivity issues" -ForegroundColor White
}

# Return to root directory
Set-Location ..

Write-Host ""
Write-Host "Script completed." -ForegroundColor Cyan
