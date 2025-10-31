import { useEffect, useMemo, useState } from 'react';
import { formatEther, formatUnits } from 'ethers';
import {
  fetchTokenTransfers,
  fetchNftTransfers,
  fetchTransactions,
  type BlockscoutTokenTransfer,
  type BlockscoutNftTransfer,
  type BlockscoutTransaction,
} from '../lib/blockscout';
import { LNFT_ADDRESS, LTOKEN_ADDRESS } from '../config/contracts';

export type ActivityFilter = 'token-transfers' | 'nft-transfers' | 'token-transactions' | 'nft-transactions';

export type TokenActivityEntry = {
  kind: 'token';
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  tokenName: string;
  gasUsed: string;
  functionName?: string;
};

export type NftActivityEntry = {
  kind: 'nft';
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  tokenId: string;
  tokenName: string;
  symbol: string;
  gasUsed: string;
  functionName?: string;
};

export type TransactionActivityEntry = {
  kind: 'transaction';
  hash: string;
  timestamp: number;
  from: string;
  to: string | null;
  valueEth: string;
  gasUsed: string;
  methodId?: string;
  functionName?: string;
  status?: 'success' | 'failed' | 'pending';
};

export type ActivityEntry = TokenActivityEntry | NftActivityEntry | TransactionActivityEntry;

export type ActivityState = {
  entries: ActivityEntry[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
};

const PAGE_SIZE = 5;

function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unexpected error while fetching activity';
}

function toTimestampMs(timestamp: string | number): number {
  const numeric = typeof timestamp === 'number' ? timestamp : Number(timestamp);
  if (!Number.isFinite(numeric)) return 0;
  return numeric * 1000;
}

function mapTokenTransfer(entry: BlockscoutTokenTransfer): TokenActivityEntry {
  const decimals = Number(entry.tokenDecimal ?? '18');
  let amount = entry.value;
  try {
    amount = formatUnits(BigInt(entry.value ?? '0'), Number.isFinite(decimals) ? decimals : 18);
  } catch {
    amount = entry.value;
  }

  return {
    kind: 'token',
    hash: entry.hash,
    timestamp: toTimestampMs(entry.timeStamp),
    from: entry.from,
    to: entry.to,
    amount,
    symbol: entry.tokenSymbol ?? '',
    tokenName: entry.tokenName ?? '',
    gasUsed: entry.gasUsed,
    functionName: entry.functionName,
  };
}

function mapNftTransfer(entry: BlockscoutNftTransfer): NftActivityEntry {
  return {
    kind: 'nft',
    hash: entry.hash,
    timestamp: toTimestampMs(entry.timeStamp),
    from: entry.from,
    to: entry.to,
    tokenId: entry.tokenID,
    tokenName: entry.tokenName ?? '',
    symbol: entry.tokenSymbol ?? '',
    gasUsed: entry.gasUsed,
    functionName: entry.functionName,
  };
}

function mapTransaction(entry: BlockscoutTransaction): TransactionActivityEntry {
  let valueEth = entry.value;
  try {
    valueEth = formatEther(BigInt(entry.value ?? '0'));
  } catch {
    valueEth = entry.value ?? '0';
  }

  let status: TransactionActivityEntry['status'];
  if (entry.txreceipt_status === '1' && entry.isError === '0') {
    status = 'success';
  } else if (entry.txreceipt_status === '0' || entry.isError === '1') {
    status = 'failed';
  } else {
    status = 'pending';
  }

  return {
    kind: 'transaction',
    hash: entry.hash,
    timestamp: toTimestampMs(entry.timeStamp),
    from: entry.from,
    to: entry.to ?? null,
    valueEth,
    gasUsed: entry.gasUsed,
    methodId: entry.methodId,
    functionName: entry.functionName,
    status,
  };
}

export function useContractActivity(filter: ActivityFilter, page: number): ActivityState {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setEntries([]);
    setHasMore(false);
    setError(null);
  }, [filter]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchActivity() {
      setLoading(true);
      setError(null);

      try {
        if (filter === 'token-transfers') {
          const { items, hasMore: more } = await fetchTokenTransfers(LTOKEN_ADDRESS, page, PAGE_SIZE);
          if (!isCancelled) {
            setEntries(items.map(mapTokenTransfer));
            setHasMore(more);
          }
          return;
        }

        if (filter === 'nft-transfers') {
          const { items, hasMore: more } = await fetchNftTransfers(LNFT_ADDRESS, page, PAGE_SIZE);
          if (!isCancelled) {
            setEntries(items.map(mapNftTransfer));
            setHasMore(more);
          }
          return;
        }

        const address = filter === 'token-transactions' ? LTOKEN_ADDRESS : LNFT_ADDRESS;
        const { items, hasMore: more } = await fetchTransactions(address, page, PAGE_SIZE);
        if (!isCancelled) {
          setEntries(items.map(mapTransaction));
          setHasMore(more);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(parseErrorMessage(err));
          setEntries([]);
          setHasMore(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void fetchActivity();

    return () => {
      isCancelled = true;
    };
  }, [filter, page]);

  return useMemo(() => ({ entries, loading, error, hasMore }), [entries, loading, error, hasMore]);
}

export const ACTIVITY_PAGE_SIZE = PAGE_SIZE;
