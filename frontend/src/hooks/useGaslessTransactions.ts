// frontend/src/hooks/useGaslessTransactions.ts
import { useState, useCallback } from 'react';
import { prepareContractCall } from 'thirdweb';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { client, liskSepolia } from '../config/thirdweb';

const GASLESS_INTERACTION_ADDRESS = import.meta.env.VITE_GASLESS_INTERACTION_ADDRESS || '';

// Helper function to convert string to bytes32 (browser-compatible)
function stringToBytes32(str: string): `0x${string}` {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .padEnd(64, '0');
  return `0x${hex}`;
}

const gaslessInteractionABI = [
  {
    type: 'function',
    name: 'recordPriceQuery',
    inputs: [{ name: 'dataFeedId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPriceAlert',
    inputs: [
      { name: 'dataFeedId', type: 'bytes32' },
      { name: 'targetPrice', type: 'uint256' },
      { name: 'isAbove', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executePriceBasedAction',
    inputs: [
      { name: 'dataFeedId', type: 'bytes32' },
      { name: 'thresholdPrice', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getLatestPrice',
    inputs: [{ name: 'dataFeedId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPriceBySymbol',
    inputs: [{ name: 'symbol', type: 'string' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserInteractionCount',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserAlerts',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'dataFeedId', type: 'bytes32' },
          { name: 'targetPrice', type: 'uint256' },
          { name: 'isAbove', type: 'bool' },
          { name: 'isActive', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'batchRecordPrices',
    inputs: [{ name: 'dataFeedIds', type: 'bytes32[]' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export function useGaslessTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  const contract = getContract({
    client,
    chain: liskSepolia,
    address: GASLESS_INTERACTION_ADDRESS,
    abi: gaslessInteractionABI,
  });

  const recordPriceQuery = useCallback(
    async (symbol: string) => {
      if (!account) {
        throw new Error('No active account');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Convert symbol to bytes32
        const dataFeedId = stringToBytes32(symbol);

        const transaction = prepareContractCall({
          contract,
          method: 'recordPriceQuery',
          params: [dataFeedId],
        });

        const result = await sendTx(transaction);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [account, contract, sendTx]
  );

  const setPriceAlert = useCallback(
    async (symbol: string, targetPrice: number, isAbove: boolean) => {
      if (!account) {
        throw new Error('No active account');
      }

      setIsLoading(true);
      setError(null);

      try {
        const dataFeedId = stringToBytes32(symbol);
        const priceInWei = BigInt(Math.floor(targetPrice * 1e8)); // 8 decimals

        const transaction = prepareContractCall({
          contract,
          method: 'setPriceAlert',
          params: [dataFeedId, priceInWei, isAbove],
        });

        const result = await sendTx(transaction);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [account, contract, sendTx]
  );

  const executePriceAction = useCallback(
    async (symbol: string, thresholdPrice: number) => {
      if (!account) {
        throw new Error('No active account');
      }

      setIsLoading(true);
      setError(null);

      try {
        const dataFeedId = stringToBytes32(symbol);
        const priceInWei = BigInt(Math.floor(thresholdPrice * 1e8));

        const transaction = prepareContractCall({
          contract,
          method: 'executePriceBasedAction',
          params: [dataFeedId, priceInWei],
        });

        const result = await sendTx(transaction);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [account, contract, sendTx]
  );

  return {
    recordPriceQuery,
    setPriceAlert,
    executePriceAction,
    isLoading,
    error,
    contractAddress: GASLESS_INTERACTION_ADDRESS,
  };
}
