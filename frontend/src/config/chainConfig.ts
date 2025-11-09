export const liskSepolia = {
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
} as const;
