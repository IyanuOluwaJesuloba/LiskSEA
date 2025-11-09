import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';

// Define Lisk Sepolia chain configuration
export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpc: 'https://rpc.sepolia-api.lisk.com',
  testnet: true,
  chain: 'lisk',
  shortName: 'lisk-sepolia',
  slug: 'lisk-sepolia',
  explorers: [{
    name: 'Lisk Sepolia Explorer',
    url: 'https://sepolia-blockscout.lisk.com',
    standard: 'EIP3091'
  }]
});

// Initialize the Thirdweb client for gasless transactions and smart wallets
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'YOUR_CLIENT_ID',
});

// Smart wallet configuration for gasless transactions (ERC-4337)
export const smartWalletConfig = {
  factoryAddress: import.meta.env.VITE_FACTORY_ADDRESS as string,
  gasless: true,
  chain: liskSepolia,
};