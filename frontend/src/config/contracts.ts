export const LISK_SEPOLIA_CHAIN_ID = 4202;

export const LISK_SEPOLIA_PARAMS = {
  chainId: '0x106a',
  chainName: 'Lisk Sepolia Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
  blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
} as const;

export const LTOKEN_ADDRESS = '0xFD25E23c2AAc3917e9e777D488Dd62724AFeE536';
export const LNFT_ADDRESS = '0x83f279d1FC6804a42835e5Ad152477425323e49A';

export const APP_METADATA = {
  name: 'LiskSEA dApp',
  description: 'Interact with the LSEA token and LNFT collection on Lisk Sepolia.',
  url: 'https://lisksea.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886?s=200&v=4'],
} as const;

export const LTOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function owner() view returns (address)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount)'
] as const;

export const LNFT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function owner() view returns (address)',
  'function mint(string uri)',
  'function safeMint(address to, string uri)'
] as const;
