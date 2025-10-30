import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { APP_METADATA, LISK_SEPOLIA_CHAIN_ID, LISK_SEPOLIA_PARAMS } from '../config/contracts';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const chains = [
  {
    chainId: LISK_SEPOLIA_CHAIN_ID,
    name: LISK_SEPOLIA_PARAMS.chainName,
    currency: LISK_SEPOLIA_PARAMS.nativeCurrency.symbol,
    rpcUrl: LISK_SEPOLIA_PARAMS.rpcUrls[0],
    explorerUrl: LISK_SEPOLIA_PARAMS.blockExplorerUrls[0],
  },
];

const ethersConfig = defaultConfig({
  metadata: APP_METADATA,
  defaultChainId: LISK_SEPOLIA_CHAIN_ID,
  rpcUrl: chains[0].rpcUrl,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
});

if (projectId) {
  createWeb3Modal({
    projectId,
    chains,
    ethersConfig,
    enableAnalytics: true,
  });
} else {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID is not set. Web3Modal will not initialize.');
}

export const isWeb3ModalConfigured = Boolean(projectId);
