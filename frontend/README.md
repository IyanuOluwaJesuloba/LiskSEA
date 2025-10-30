# LiskSEA Frontend

React + TypeScript dashboard for managing the **LiskSEA Token (LSEA)** and **LiskSEA NFT (LNFT)** smart contracts deployed on the Lisk Sepolia testnet.

## Features

- MetaMask wallet connection with automatic Lisk Sepolia network switching/addition
- Live account, network, token, and NFT state refreshed from on-chain data
- ERC20 panel
  - View contract address, total supply, and connected balance
  - Transfer LSEA tokens
  - Owner-only minting to any address
- ERC721 panel
  - View contract address, total supply, and wallet holdings
  - Public mint using metadata URI
  - Owner-only `safeMint` to any recipient

## Prerequisites

- Node.js 18+
- npm 9+
- MetaMask browser extension (or any wallet exposing `window.ethereum`)

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Open the printed URL (default: `http://localhost:5173`) in a browser with MetaMask installed.

## Environment

Contract addresses are hard-coded for convenience:

- LToken (ERC20): `0xFD25E23c2AAc3917e9e777D488Dd62724AFeE536`
- LNFT (ERC721): `0x83f279d1FC6804a42835e5Ad152477425323e49A`

Both contracts live on chain ID **4202** (Lisk Sepolia). The app prompts the wallet to switch or add this network if necessary.

## Build & Preview

```bash
npm run build
npm run preview
```

## Notes

- ABI fragments are defined in `src/config/contracts.ts`.
- Wallet state is handled globally through `WalletContext`.
- Interaction components live under `src/components` and `src/hooks` for reuse.
