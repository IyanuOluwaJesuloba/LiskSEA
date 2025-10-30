import { useMemo } from 'react';
import { Contract } from 'ethers';
import { LNFT_ABI, LNFT_ADDRESS } from '../config/contracts';
import { useWallet } from '../contexts/WalletContext';

export function useNftContract(): Contract | null {
  const { provider } = useWallet();

  return useMemo(() => {
    if (!provider) return null;
    return new Contract(LNFT_ADDRESS, LNFT_ABI, provider);
  }, [provider]);
}
