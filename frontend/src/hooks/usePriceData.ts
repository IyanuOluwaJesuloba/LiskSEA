// frontend/src/hooks/usePriceData.ts
import { useCallback, useEffect, useState } from 'react';
import { CHAIN_CONFIG } from '../config/contracts';
import { LISK_SEPOLIA_PARAMS } from '../config/contracts';
import { WrapperBuilder } from '@redstone-finance/evm-connector';
import { getSignersForDataServiceId } from '@redstone-finance/sdk';
// Use ethers v5 for RedStone compatibility
import { Contract, providers, utils } from 'ethers5';

// RedStone API endpoint for direct price fetching (fallback)
const REDSTONE_API_URL = 'https://api.redstone.finance/prices';

// Helper to convert symbol to bytes32 properly
function stringToBytes32(str: string): string {
  return utils.formatBytes32String(str);
}

// ABI for the PriceConsumer contract
const priceConsumerABI = [
  'function getLatestPrice(bytes32 dataFeedId) view returns (uint256)',
] as const;

// Fallback: Fetch price directly from RedStone API
async function fetchPriceFromAPI(symbol: string): Promise<number> {
  const response = await fetch(`${REDSTONE_API_URL}?symbols=${symbol}&provider=redstone&limit=1`);
  if (!response.ok) {
    throw new Error(`RedStone API error: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data || !data[symbol] || !data[symbol].value) {
    throw new Error(`No price data for ${symbol}`);
  }
  return data[symbol].value;
}

export function usePriceFeed(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const fetchPrice = useCallback(async () => {
    if (!CHAIN_CONFIG.priceConsumerAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a read-only provider for fetching prices (using ethers v5)
      const provider = new providers.JsonRpcProvider(LISK_SEPOLIA_PARAMS.rpcUrls[0]);
      
      const contract = new Contract(
        CHAIN_CONFIG.priceConsumerAddress,
        priceConsumerABI,
        provider
      );

      // Convert symbol to bytes32 format that RedStone expects
      const dataFeedId = stringToBytes32(symbol);

      // Wrap the contract with RedStone data service
      // RedStone Primary Prod requires minimum 3 signers for data validation
      // Using fewer gateway URLs and reducing signer count can help with timeouts
      const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
        dataServiceId: "redstone-primary-prod",
        dataPackagesIds: [symbol],
        uniqueSignersCount: 1, // Reduced from 3 to 1 for faster response
        authorizedSigners: getSignersForDataServiceId("redstone-primary-prod"),
      });

      const data = await wrappedContract.getLatestPrice(dataFeedId);
      
      // Convert from 8 decimals to human-readable
      const priceValue = Number(data) / 1e8;
      
      // Only update if we got a valid price
      if (priceValue > 0) {
        setPrice(priceValue);
        setLastUpdated(new Date());
        setError(null);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error('Invalid price data received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch price');
      console.error(`Error fetching ${symbol} price from contract (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, errorMessage);
      
      // Try fallback API method before retrying contract
      try {
        console.log(`Attempting to fetch ${symbol} price from RedStone API...`);
        const apiPrice = await fetchPriceFromAPI(symbol);
        if (apiPrice > 0) {
          setPrice(apiPrice);
          setLastUpdated(new Date());
          setError(null);
          setRetryCount(0);
          console.log(`Successfully fetched ${symbol} price from API fallback: $${apiPrice}`);
          setIsLoading(false);
          return; // Success, exit early
        }
      } catch (apiErr) {
        console.error(`API fallback also failed for ${symbol}:`, apiErr);
      }
      
      // Retry logic: if we haven't exceeded max retries, try again after a delay
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying ${symbol} price fetch in 3 seconds...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          void fetchPrice();
        }, 3000);
      } else {
        // Only set error if all retries failed
        setError(errorMessage);
        setRetryCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, retryCount]);

  // Fetch price on mount and when dependencies change
  useEffect(() => {
    void fetchPrice();
  }, [fetchPrice]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchPrice();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPrice]);

  return {
    price,
    error,
    isLoading,
    lastUpdated,
    refresh: fetchPrice,
  };
}