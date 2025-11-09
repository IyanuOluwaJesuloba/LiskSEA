// frontend/src/pages/PriceDataPage.tsx
import { usePriceFeed } from '../hooks/usePriceData';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  bgColor: string;
}

function PriceCard({ symbol, name, price, isLoading, error, refresh, bgColor }: PriceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-900/85 border ${bgColor} rounded-3xl p-8 shadow-xl backdrop-blur-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 opacity-40"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">{symbol}</h3>
            <p className="text-slate-100 text-2xl font-bold">{name}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all ${
              isRefreshing ? 'animate-spin' : ''
            } disabled:opacity-60`}
          >
            <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Price */}
        <div className="mb-6">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-14 bg-slate-800/60 rounded-2xl animate-pulse"></div>
              <div className="h-4 w-1/2 bg-slate-800/60 rounded-full animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-rose-200 text-sm mb-3">Failed to load price</p>
              <button onClick={handleRefresh} className="text-slate-100 text-xs underline hover:no-underline">
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="text-6xl font-black text-slate-100 mb-2 tracking-tight">
                {price !== null ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
              </div>
              <div className="flex items-center space-x-2 text-slate-300 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Live Price Feed</span>
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
          <div>
            <p className="text-slate-400 text-xs mb-1">24h Change</p>
            <p className="text-slate-100 text-lg font-bold">--</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">Market Cap</p>
            <p className="text-slate-100 text-lg font-bold">--</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PriceDataPage() {
  const navigate = useNavigate();
  const { price: ethPrice, isLoading: isLoadingEth, error: ethError, refresh: refreshEth } = usePriceFeed('ETH');
  const { price: btcPrice, isLoading: isLoadingBtc, error: btcError, refresh: refreshBtc } = usePriceFeed('BTC');
  const { price: linkPrice, isLoading: isLoadingLink, error: linkError, refresh: refreshLink } = usePriceFeed('LINK');

  return (
    <div className="page-background min-h-screen text-slate-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className='flex justify-around'>
          <button 
            onClick={() => navigate('/')}
            className="group mb-6 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800/90 hover:border-slate-500 transition-all duration-300 flex items-center space-x-2 font-medium shadow-md shadow-slate-950/20"
          >
            <svg className="w-5 h-5 transform text-slate-300 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox=" 0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/gasless')}
            className="group mb-8 px-6 py-3 bg-linear-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center font-medium border border-indigo-400/40 shadow-lg shadow-indigo-900/40"
          >
            <span className="group-hover:scale-105 transition-transform">Explore Gasless Transactions</span>
          </button>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-black text-slate-100 mb-4 tracking-tight">
              Price <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Oracle</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Real-time cryptocurrency prices powered by RedStone
            </p>
            
            {/* Live indicator */}
            <div className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-700">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-200 font-medium">Live Data • Auto-refresh every 30s</span>
            </div>
          </div>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <PriceCard
            symbol="ETH"
            name="Ethereum"
            price={ethPrice}
            isLoading={isLoadingEth}
            error={ethError}
            refresh={refreshEth}
            bgColor="border-indigo-400/40 shadow-indigo-900/40"
          />
          
          <PriceCard
            symbol="BTC"
            name="Bitcoin"
            price={btcPrice}
            isLoading={isLoadingBtc}
            error={btcError}
            refresh={refreshBtc}
            bgColor="border-amber-400/40 shadow-amber-900/40"
          />
          
          <PriceCard
            symbol="LINK"
            name="Chainlink"
            price={linkPrice}
            isLoading={isLoadingLink}
            error={linkError}
            refresh={refreshLink}
            bgColor="border-blue-400/40 shadow-blue-900/40"
          />
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Oracle Info */}
          <div className="card-surface rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-rose-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-100">RedStone Oracle</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Multi-signer validation ensures data accuracy and reliability
            </p>
          </div>

          {/* Network */}
          <div className="card-surface rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-100">Lisk Sepolia</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Connected to testnet for reliable data delivery
            </p>
          </div>

          {/* Stats */}
          <div className="card-surface rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-100">99.9% Uptime</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Production-grade reliability and performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}