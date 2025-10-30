import type { ContractTransactionResponse, Signer } from 'ethers';

export type LTokenContract = {
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  totalSupply(): Promise<bigint>;
  balanceOf(owner: string): Promise<bigint>;
  owner(): Promise<string>;
  connect(signer: Signer): LTokenContract;
  transfer(to: string, amount: bigint): Promise<ContractTransactionResponse>;
  mint(to: string, amount: bigint): Promise<ContractTransactionResponse>;
};

export type LNFTContract = {
  name(): Promise<string>;
  symbol(): Promise<string>;
  totalSupply(): Promise<bigint>;
  balanceOf(owner: string): Promise<bigint>;
  owner(): Promise<string>;
  tokenURI(tokenId: bigint): Promise<string>;
  connect(signer: Signer): LNFTContract;
  mint(uri: string): Promise<ContractTransactionResponse>;
  safeMint(to: string, uri: string): Promise<ContractTransactionResponse>;
};
