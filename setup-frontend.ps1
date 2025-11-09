# PowerShell script to set up and run the frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LiskSEA Frontend Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location frontend

Write-Host "Step 1: Checking Node.js installation..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found! Please install Node.js v16+" -ForegroundColor Red
    Write-Host "Visit: https://nodejs.org/" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Step 2: Checking .env file..." -ForegroundColor Green
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host ".env not found. Copying from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host ""
        Write-Host "Please edit frontend\.env with your configuration:" -ForegroundColor Yellow
        Write-Host "  - VITE_THIRDWEB_CLIENT_ID (get from https://thirdweb.com/dashboard)" -ForegroundColor White
        Write-Host "  - VITE_GASLESS_INTERACTION_ADDRESS (from contract deployment)" -ForegroundColor White
        Write-Host "  - VITE_FACTORY_ADDRESS (from Thirdweb AA dashboard)" -ForegroundColor White
        Write-Host ""
        
        # Try to open .env file
        $openFile = Read-Host "Open .env file now? (y/n)"
        if ($openFile -eq "y" -or $openFile -eq "Y") {
            notepad .env
        }
        
        $continue = Read-Host "Continue with setup? (y/n)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "Setup cancelled. Please configure .env and run this script again." -ForegroundColor Yellow
            Set-Location ..
            exit 0
        }
    } else {
        Write-Host "Warning: .env and .env.example not found!" -ForegroundColor Yellow
        Write-Host "Creating a new .env file with placeholders..." -ForegroundColor Yellow
        @"
# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# Smart Contract Addresses
VITE_GASLESS_INTERACTION_ADDRESS=0x...
VITE_FACTORY_ADDRESS=0x...
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "Created .env file. Please update it with your values." -ForegroundColor Green
        notepad .env
        Set-Location ..
        exit 0
    }
} else {
    Write-Host ".env file found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: npm install failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Step 4: Running lint check..." -ForegroundColor Green
npm run lint
# Note: Continue even if lint has warnings

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$startDev = Read-Host "Start development server now? (y/n)"
if ($startDev -eq "y" -or $startDev -eq "Y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Cyan
    Write-Host "The app will be available at http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "To start the development server later, run:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Available routes:" -ForegroundColor Cyan
    Write-Host "  / - Dashboard" -ForegroundColor White
    Write-Host "  /prices - Live Price Feeds" -ForegroundColor White
    Write-Host "  /gasless - Gasless Transactions (Account Abstraction)" -ForegroundColor White
    Write-Host "  /activity - Activity Feed" -ForegroundColor White
}

# Return to root directory
Set-Location ..

Write-Host ""
Write-Host "Setup script completed." -ForegroundColor Cyan
