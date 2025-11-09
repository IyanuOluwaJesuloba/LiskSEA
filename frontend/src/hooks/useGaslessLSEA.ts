// frontend/src/hooks/useGaslessLSEA.ts
import { useState, useCallback } from 'react';
import { prepareContractCall } from 'thirdweb';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { client, liskSepolia } from '../config/thirdweb';
import { LTOKEN_ADDRESS, LNFT_ADDRESS } from '../config/contracts';
import { parseUnits } from 'ethers';

const tokenABI = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

const nftABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [{ name: 'uri', type: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export function useGaslessLSEA() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  const tokenContract = getContract({
    client,
    chain: liskSepolia,
    address: LTOKEN_ADDRESS,
    abi: tokenABI,
  });

  const nftContract = getContract({
    client,
    chain: liskSepolia,
    address: LNFT_ADDRESS,
    abi: nftABI,
  });

  const transferLSEA = useCallback(
    async (recipientAddress: string, amount: string) => {
      if (!account) {
        throw new Error('No active account');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Convert amount to wei (18 decimals for LSEA)
        const amountInWei = parseUnits(amount, 18);

        const transaction = prepareContractCall({
          contract: tokenContract,
          method: 'transfer',
          params: [recipientAddress as `0x${string}`, BigInt(amountInWei.toString())],
        });

        const result = await sendTx(transaction);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transfer failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [account, tokenContract, sendTx]
  );

  const mintNFT = useCallback(
    async (tokenURI: string) => {
      if (!account) {
        throw new Error('No active account');
      }

      setIsLoading(true);
      setError(null);

      try {
        const transaction = prepareContractCall({
          contract: nftContract,
          method: 'mint',
          params: [tokenURI],
        });

        const result = await sendTx(transaction);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Minting failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [account, nftContract, sendTx]
  );

  return {
    transferLSEA,
    mintNFT,
    isLoading,
    error,
    tokenAddress: LTOKEN_ADDRESS,
    nftAddress: LNFT_ADDRESS,
  };
}
