const BLOCKSCOUT_API_BASE = 'https://sepolia-blockscout.lisk.com/api';

export type BlockscoutListResponse<T> = {
  status: '0' | '1';
  message: string;
  result: T;
};

export type BlockscoutTokenTransfer = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  input: string;
  contractAddress: string;
  confirmations: string;
  methodId?: string;
  functionName?: string;
  logIndex?: string;
};

export type BlockscoutNftTransfer = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  input: string;
  contractAddress: string;
  confirmations: string;
  methodId?: string;
  functionName?: string;
  logIndex?: string;
};

export type BlockscoutTransaction = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  confirmations: string;
  methodId?: string;
  functionName?: string;
  isError?: string;
  txreceipt_status?: string;
};

type RequestParams = Record<string, string | number | undefined>;

type ListResult<T> = {
  items: T[];
  hasMore: boolean;
};

function buildUrl(params: RequestParams): string {
  const url = new URL(BLOCKSCOUT_API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function requestBlockscoutList<T>(params: RequestParams, pageSize: number): Promise<ListResult<T>> {
  const response = await fetch(buildUrl(params));
  if (!response.ok) {
    throw new Error(`Blockscout request failed with status ${response.status}`);
  }

  const json = (await response.json()) as BlockscoutListResponse<T[] | string>;

  if (json.status === '0') {
    if (json.message === 'No transactions found') {
      return { items: [], hasMore: false };
    }

    const resultMessage = typeof json.result === 'string' ? json.result : json.message;
    throw new Error(resultMessage || 'Blockscout API error');
  }

  const result = Array.isArray(json.result) ? json.result : [];
  return {
    items: result,
    hasMore: result.length === pageSize,
  };
}

export async function fetchTokenTransfers(contractAddress: string, page: number, pageSize: number) {
  return requestBlockscoutList<BlockscoutTokenTransfer>(
    {
      module: 'account',
      action: 'tokentx',
      contractaddress: contractAddress,
      sort: 'desc',
      page,
      offset: pageSize,
    },
    pageSize,
  );
}

export async function fetchNftTransfers(contractAddress: string, page: number, pageSize: number) {
  return requestBlockscoutList<BlockscoutNftTransfer>(
    {
      module: 'account',
      action: 'tokennfttx',
      contractaddress: contractAddress,
      sort: 'desc',
      page,
      offset: pageSize,
    },
    pageSize,
  );
}

export async function fetchTransactions(contractAddress: string, page: number, pageSize: number) {
  return requestBlockscoutList<BlockscoutTransaction>(
    {
      module: 'account',
      action: 'txlist',
      address: contractAddress,
      sort: 'desc',
      page,
      offset: pageSize,
    },
    pageSize,
  );
}
