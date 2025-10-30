/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BrowserProvider, type Eip1193Provider } from 'ethers';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { isWeb3ModalConfigured } from '../lib/web3modal';
import { LISK_SEPOLIA_CHAIN_ID, LISK_SEPOLIA_PARAMS } from '../config/contracts';

type WalletContextValue = {
  provider: BrowserProvider | null;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  switchToLisk: () => Promise<void>;
  isCorrectNetwork: boolean;
  hasProvider: boolean;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const FALLBACK_CONTEXT: WalletContextValue = {
  provider: null,
  account: null,
  chainId: null,
  isConnecting: false,
  connect: async () => {
    throw new Error('Web3Modal is not configured. Set VITE_WALLETCONNECT_PROJECT_ID.');
  },
  switchToLisk: async () => {
    throw new Error('Web3Modal is not configured. Set VITE_WALLETCONNECT_PROJECT_ID.');
  },
  isCorrectNetwork: false,
  hasProvider: false,
};

function WalletProviderWithWeb3Modal({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [eip1193Provider, setEip1193Provider] = useState<Eip1193Provider | null>(null);
  const hasRequestedMetaMaskPermissionsRef = useRef(false);

  const { open } = useWeb3Modal();
  const { address, isConnected, chainId: connectedChainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    if (walletProvider) {
      setEip1193Provider(walletProvider as unknown as Eip1193Provider);
    } else {
      setEip1193Provider(null);
    }
  }, [walletProvider]);

  useEffect(() => {
    if (!walletProvider) {
      hasRequestedMetaMaskPermissionsRef.current = false;
    }
  }, [walletProvider]);

  useEffect(() => {
    if (!eip1193Provider) {
      setProvider(null);
      setAccount(null);
      return;
    }

    let isMounted = true;

    const browserProvider = new BrowserProvider(eip1193Provider, 'any');
    setProvider(browserProvider);

    browserProvider.getNetwork().then((network) => {
      if (isMounted) {
        setChainId(Number(network.chainId));
      }
    }).catch(() => {
      if (isMounted) {
        setChainId(null);
      }
    });

    const handleAccountsChanged = (accounts: unknown): void => {
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAccount(accounts[0] as string);
      } else {
        setAccount(null);
      }
    };

    const handleChainChanged = (nextChainId: unknown): void => {
      if (typeof nextChainId === 'string') {
        setChainId(Number(BigInt(nextChainId)));
      } else if (typeof nextChainId === 'bigint') {
        setChainId(Number(nextChainId));
      } else if (typeof nextChainId === 'number') {
        setChainId(nextChainId);
      } else {
        setChainId(null);
      }
    };

    (eip1193Provider as unknown as { on?: (event: string, handler: (arg: unknown) => void) => void }).on?.('accountsChanged', handleAccountsChanged);
    (eip1193Provider as unknown as { on?: (event: string, handler: (arg: unknown) => void) => void }).on?.('chainChanged', handleChainChanged);

    return () => {
      isMounted = false;
      (eip1193Provider as unknown as { removeListener?: (event: string, handler: (arg: unknown) => void) => void }).removeListener?.('accountsChanged', handleAccountsChanged);
      (eip1193Provider as unknown as { removeListener?: (event: string, handler: (arg: unknown) => void) => void }).removeListener?.('chainChanged', handleChainChanged);
    };
  }, [eip1193Provider]);

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
    } else if (!isConnected) {
      setAccount(null);
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (typeof connectedChainId === 'number') {
      setChainId(connectedChainId);
    }
  }, [connectedChainId]);

  useEffect(() => {
    if (!isConnected || !walletProvider || hasRequestedMetaMaskPermissionsRef.current) {
      return;
    }

    const maybeProvider = walletProvider as unknown as {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
      providers?: Array<{
        isMetaMask?: boolean;
        request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      }>;
    };

    const injectedProviders = Array.isArray(maybeProvider.providers) ? maybeProvider.providers : [];
    const metaMaskCandidate = injectedProviders.find((providerItem) => providerItem?.isMetaMask);
    const targetProvider = metaMaskCandidate ?? (maybeProvider.isMetaMask ? maybeProvider : null);

    if (!targetProvider || typeof targetProvider.request !== 'function') {
      return;
    }

    hasRequestedMetaMaskPermissionsRef.current = true;

    void targetProvider
      .request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
      .catch((error) => {
        console.debug('MetaMask permission prompt skipped or failed', error);
      });
  }, [isConnected, walletProvider]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await open?.({ view: 'Connect' });
    } finally {
      setIsConnecting(false);
    }
  }, [open]);

  const switchToLisk = useCallback(async () => {
    const providerInstance = eip1193Provider;

    if (!providerInstance) {
      await open?.({ view: 'Networks' });
      return;
    }

    try {
      await providerInstance.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LISK_SEPOLIA_PARAMS.chainId }],
      });
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err?.code === 4902) {
        await providerInstance.request?.({
          method: 'wallet_addEthereumChain',
          params: [LISK_SEPOLIA_PARAMS],
        });
      } else {
        throw error;
      }
    }
  }, [eip1193Provider, open]);

  const value = useMemo<WalletContextValue>(() => ({
    provider,
    account,
    chainId,
    isConnecting,
    connect,
    switchToLisk,
    isCorrectNetwork: chainId === LISK_SEPOLIA_CHAIN_ID,
    hasProvider: true,
  }), [provider, account, chainId, isConnecting, connect, switchToLisk]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  if (!isWeb3ModalConfigured) {
    return <WalletContext.Provider value={FALLBACK_CONTEXT}>{children}</WalletContext.Provider>;
  }

  return <WalletProviderWithWeb3Modal>{children}</WalletProviderWithWeb3Modal>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
