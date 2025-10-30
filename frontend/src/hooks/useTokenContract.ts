import { useMemo } from 'react';
import { Contract } from 'ethers';
import { LTOKEN_ABI, LTOKEN_ADDRESS } from '../config/contracts';
import { useWallet } from '../contexts/WalletContext';

export function useTokenContract(): Contract | null {
  const { provider } = useWallet();

  return useMemo(() => {
    if (!provider) return null;
    return new Contract(LTOKEN_ADDRESS, LTOKEN_ABI, provider);
  }, [provider]);
}
