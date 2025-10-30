/// <reference types="vite/client" />

import type { ComponentType, DetailedHTMLProps, HTMLAttributes } from 'react';

declare module '@web3modal/ethers/react' {
  export type Web3ModalChain = {
    chainId: number;
    name: string;
    currency: string;
    rpcUrl: string;
    explorerUrl?: string;
  };

  export type Web3ModalOptions = {
    projectId: string;
    chains: Web3ModalChain[];
    ethersConfig: unknown;
    enableAnalytics?: boolean;
  };

  export function createWeb3Modal(options: Web3ModalOptions): void;

  export function defaultConfig(config: Record<string, unknown>): unknown;

  export function useWeb3Modal(): {
    open?: (options?: { view?: 'Connect' | 'Networks' | string }) => Promise<void>;
  };

  export function useWeb3ModalAccount(): {
    address?: string;
    chainId?: number;
    isConnected: boolean;
  };

  export function useWeb3ModalProvider(): {
    walletProvider?: unknown;
  };

  export const W3mButton: ComponentType<{ label?: string; balance?: 'show' | 'hide'; size?: 'sm' | 'md' | 'lg' }>;
}

export {};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        balance?: 'show' | 'hide';
        size?: 'sm' | 'md' | 'lg';
        label?: string;
      };
    }
  }
}
