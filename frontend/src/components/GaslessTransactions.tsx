// frontend/src/components/GaslessTransactions.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGaslessLSEA } from '../hooks/useGaslessLSEA';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { client, liskSepolia } from '../config/thirdweb';
import {
  ArrowLeft,
  Send,
  Image,
  Zap,
  BarChart3,
  Sparkles,
  ExternalLink,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Info,
  DollarSign,
  Clock,
  Coins,
} from 'lucide-react';

export default function GaslessTransactions() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const { transferLSEA, mintNFT, isLoading, error, tokenAddress, nftAddress } = useGaslessLSEA();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [nftTokenURI, setNftTokenURI] = useState('');
  const [txStatus, setTxStatus] = useState<string>('');
  const [interactionCount, setInteractionCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Price-related state (re-enable when price features are active)
  // const symbols = ['ETH', 'BTC', 'USDT', 'AVAX', 'LINK'];
  // const [selectedSymbol, setSelectedSymbol] = useState('ETH');
  // const [alertPrice, setAlertPrice] = useState('');
  // const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  // const [thresholdPrice, setThresholdPrice] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleTransferLSEA = async () => {
    if (!recipientAddress || !transferAmount) {
      setTxStatus('Please enter recipient address and amount');
      return;
    }

    try {
      setTxStatus('Transferring LSEA tokens... (Gasless Transaction)');
      await transferLSEA(recipientAddress, transferAmount);
      setTxStatus('✅ LSEA tokens transferred successfully without gas fees!');
      setRecipientAddress('');
      setTransferAmount('');
      setInteractionCount((prev) => prev + 1);
      setTimeout(() => setTxStatus(''), 3000);
    } catch (err) {
      setTxStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTimeout(() => setTxStatus(''), 5000);
    }
  };

  // const handleRecordPrice = async () => {
  //   if (!selectedSymbol) {
  //     setTxStatus('Please select an asset');
  //     return;
  //   }
  //
  //   try {
  //     setTxStatus(`Recording price for ${selectedSymbol}... (Gasless Transaction)`);
  //     // TODO: Implement price recording logic with your contract
  //     // await recordPrice(selectedSymbol);
  //     setTxStatus(`✅ Price for ${selectedSymbol} recorded successfully without gas fees!`);
  //     setInteractionCount((prev) => prev + 1);
  //     setTimeout(() => setTxStatus(''), 3000);
  //   } catch (err) {
  //     setTxStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  //     setTimeout(() => setTxStatus(''), 5000);
  //   }
  // };

  // const handleSetAlert = async () => {
  //   if (!selectedSymbol || !alertPrice) {
  //     setTxStatus('Please select an asset and enter a target price');
  //     return;
  //   }

  //   try {
  //     setTxStatus(`Setting price alert for ${selectedSymbol}... (Gasless Transaction)`);
  //     // TODO: Implement price alert logic with your contract
  //     // await setPriceAlert(selectedSymbol, alertPrice, alertType);
  //     setTxStatus(`✅ Price alert set for ${selectedSymbol} at $${alertPrice} (${alertType}) without gas fees!`);
  //     setAlertPrice('');
  //     setInteractionCount((prev) => prev + 1);
  //     setTimeout(() => setTxStatus(''), 3000);
  //   } catch (err) {
  //     setTxStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  //     setTimeout(() => setTxStatus(''), 5000);
  //   }
  // };

  // const handlePriceAction = async () => {
  //   if (!selectedSymbol || !thresholdPrice) {
  //     setTxStatus('Please select an asset and enter a threshold price');
  //     return;
  //   }

  //   try {
  //     setTxStatus(`Executing price action for ${selectedSymbol}... (Gasless Transaction)`);
  //     // TODO: Implement price action logic with your contract
  //     // await executePriceAction(selectedSymbol, thresholdPrice);
  //     setTxStatus(`✅ Price action executed for ${selectedSymbol} with threshold $${thresholdPrice} without gas fees!`);
  //     setThresholdPrice('');
  //     setInteractionCount((prev) => prev + 1);
  //     setTimeout(() => setTxStatus(''), 3000);
  //   } catch (err) {
  //     setTxStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  //     setTimeout(() => setTxStatus(''), 5000);
  //   }
  // };

  return (
    <div className="page-background min-h-screen text-slate-100 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className={`flex justify-between items-center mb-8 transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800/90 hover:border-slate-500 transition-all duration-300 shadow-md shadow-slate-950/20"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 backdrop-blur-sm p-1">
            <ConnectButton client={client} chain={liskSepolia} />
            
          </div>
        </div>

        <div className={`text-center mb-10 transition-all duration-700 delay-100 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
         
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Gasless Transactions
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Interact with smart contracts without paying gas fees using ERC-4337 Account Abstraction
          </p>
        </div>

        {/* Info Banner */}
        <div className={`relative overflow-hidden bg-linear-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white p-8 rounded-2xl shadow-2xl mb-10 transition-all border-2 border-slate-700 duration-700 delay-200 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              
              <h2 className="text-2xl font-bold">Account Abstraction Powered</h2>
            </div>
            <p className="mb-5 text-blue-50 leading-relaxed">
              Transfer LSEA tokens and mint NFTs without paying gas fees! All transactions are sponsored by a paymaster using ERC-4337 Account Abstraction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">LSEA Token</p>
                    <a
                      href={`https://sepolia-blockscout.lisk.com/address/${tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-black font-mono bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 transition-colors group"
                    >
                      <span className="truncate">{tokenAddress}</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-black" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">NFT Contract</p>
                    <a
                      href={`https://sepolia-blockscout.lisk.com/address/${nftAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-black font-mono bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 transition-colors group"
                    >
                      <span className="truncate">{nftAddress}</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-black" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!account ? (
          <div className={`bg-slate-900/90 backdrop-blur-md p-12 rounded-2xl shadow-2xl text-center border border-slate-700 transition-all duration-700 delay-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-slate-100">Connect Your Wallet</h3>
            <p className="text-slate-300 mb-8 text-lg max-w-md mx-auto">
              Connect your wallet to start using gasless transactions and experience the future of Web3
            </p>
            <ConnectButton client={client} chain={liskSepolia} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Record Price Query Card */}
            {/* <div className={`group bg-white/80 backdrop-blur-sm p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '300ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Record Price Query</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Query and record the current price of an asset without paying gas fees
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Select Asset</label>
                <div className="relative">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-300 cursor-pointer appearance-none pr-10 font-medium"
                  >
                    {symbols.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                  <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleRecordPrice}
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Record Price (Gasless)
                  </>
                )}
              </button>
            </div> */}

            {/* Set Price Alert Card */}
            {/* <div className={`group bg-white/80 backdrop-blur-sm p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '350ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Set Price Alert</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Create a price alert to monitor when an asset reaches your target price
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Asset</label>
                <div className="relative">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white hover:border-gray-300 cursor-pointer appearance-none pr-10 font-medium"
                  >
                    {symbols.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                  <Bell className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Target Price (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    placeholder="e.g., 2500.00"
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300 font-medium"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Alert Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    alertType === 'above'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      value="above"
                      checked={alertType === 'above'}
                      onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
                      className="sr-only"
                    />
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Above</span>
                  </label>
                  <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    alertType === 'below'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      value="below"
                      checked={alertType === 'below'}
                      onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
                      className="sr-only"
                    />
                    <TrendingUp className="w-4 h-4 rotate-180" />
                    <span className="font-medium">Below</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSetAlert}
                disabled={isLoading || !alertPrice}
                className="group w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3.5 px-4 rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Set Alert (Gasless)
                  </>
                )}
              </button>
            </div> */}

            {/* Execute Price Action Card */}
            {/* <div className={`group bg-white/80 backdrop-blur-sm p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 transform hover:-translate-y-1 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Execute Price Action</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Execute an action based on current price vs. your threshold
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Asset</label>
                <div className="relative">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300 cursor-pointer appearance-none pr-10 font-medium"
                  >
                    {symbols.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                  <Zap className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Threshold Price (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={thresholdPrice}
                    onChange={(e) => setThresholdPrice(e.target.value)}
                    placeholder="e.g., 3000.00"
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handlePriceAction}
                disabled={isLoading || !thresholdPrice}
                className="group w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 px-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Execute Action (Gasless)
                  </>
                )}
              </button>
            </div> */}

            {/* Transfer LSEA Card */}
            <div className={`group bg-slate-900/85 backdrop-blur-lg p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-800 hover:border-indigo-400/60 transform hover:-translate-y-1 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '450ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg group-hover:shadow-indigo-500/50 transition-shadow">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Transfer LSEA</h3>
              </div>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                Send LSEA tokens to any address without paying gas fees
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-200 mb-2.5">Recipient Address</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-slate-700 rounded-xl bg-slate-950/60 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-slate-500 font-mono text-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-200 mb-2.5">Amount (LSEA)</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="e.g., 100"
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-slate-700 rounded-xl bg-slate-950/60 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-slate-500 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={handleTransferLSEA}
                disabled={isLoading || !recipientAddress || !transferAmount}
                className="group w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3.5 px-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Transfer (Gasless)
                  </>
                )}
              </button>
            </div>

            {/* Mint NFT Card */}
            <div className={`group bg-slate-900/85 backdrop-blur-lg p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-800 hover:border-pink-400/60 transform hover:-translate-y-1 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '500ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-pink-500/50 transition-shadow">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Mint NFT</h3>
              </div>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                Mint a new NFT with custom metadata without paying gas fees
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-200 mb-2.5">Token URI</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={nftTokenURI}
                    onChange={(e) => setNftTokenURI(e.target.value)}
                    placeholder="ipfs://... or https://..."
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-slate-700 rounded-xl bg-slate-950/60 text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all hover:border-slate-500 font-mono text-sm placeholder:text-slate-400"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Enter the URI pointing to your NFT metadata (IPFS or HTTP URL)
                </p>
              </div>

              <button
                onClick={async () => {
                  if (!nftTokenURI) {
                    setTxStatus('Please enter a token URI for the NFT');
                    return;
                  }

                  try {
                    setTxStatus('Minting NFT... (Gasless Transaction)');
                    await mintNFT(nftTokenURI);
                    setTxStatus('✅ NFT minted successfully without gas fees!');
                    setNftTokenURI('');
                    setInteractionCount((prev) => prev + 1);
                    setTimeout(() => setTxStatus(''), 3000);
                  } catch (err) {
                    setTxStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    setTimeout(() => setTxStatus(''), 5000);
                  }
                }}
                disabled={isLoading || !nftTokenURI}
                className="group w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3.5 px-4 rounded-xl hover:from-pink-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Mint NFT (Gasless)
                  </>
                )}
              </button>
            </div>

            {/* Statistics Card */}
            <div className={`group bg-slate-900/85 backdrop-blur-lg p-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-800 hover:border-indigo-400/60 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '550ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Your Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="relative overflow-hidden p-4 bg-gradient-to-br from-indigo-600/20 via-indigo-500/10 to-slate-900 rounded-xl border border-indigo-400/40 transition-all hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-indigo-200 mb-1">Gasless Interactions</p>
                      <p className="text-3xl font-bold text-white">{interactionCount}</p>
                    </div>
                    <div className="p-3 bg-indigo-500 rounded-xl text-white">
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden p-4 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-slate-900 rounded-xl border border-emerald-400/40 transition-all hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-emerald-200 mb-1">Gas Saved</p>
                      <p className="text-3xl font-bold text-white">
                        ~${(interactionCount * 0.5).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-500 rounded-xl text-white">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-slate-900 rounded-xl border border-purple-400/40">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-200 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-200 leading-relaxed">
                      All your transactions are sponsored by the paymaster, saving you gas fees on every interaction!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {txStatus && (
          <div
            className={`mt-8 p-5 rounded-2xl shadow-xl backdrop-blur-sm border animate-in slide-in-from-top-5 duration-300 ${
              txStatus.includes('✅')
                ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-100'
                : txStatus.includes('❌')
                ? 'bg-rose-500/15 border-rose-400/50 text-rose-100'
                : 'bg-indigo-500/15 border-indigo-400/50 text-indigo-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {txStatus.includes('✅') ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-200 flex-shrink-0" />
              ) : txStatus.includes('❌') ? (
                <AlertCircle className="w-6 h-6 text-rose-200 flex-shrink-0" />
              ) : (
                <Clock className="w-6 h-6 text-indigo-200 flex-shrink-0 animate-spin" />
              )}
              <p className="font-semibold">{txStatus}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-5 bg-rose-500/15 border border-rose-400/50 text-rose-100 rounded-2xl shadow-xl backdrop-blur-sm animate-in slide-in-from-top-5 duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-200 flex-shrink-0" />
              <p className="font-semibold">Error: {error.message}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-10 bg-slate-900/85 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg text-white">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100">How It Works</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 bg-gradient-to-br from-indigo-500/15 via-indigo-500/10 to-slate-900 rounded-xl border border-indigo-400/40 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 text-white rounded-lg font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-slate-100">Connect Wallet</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect your wallet to create or access your smart wallet
              </p>
            </div>
            <div className="group p-6 bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-slate-900 rounded-xl border border-purple-400/40 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-lg font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-slate-100">Perform Actions</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Execute transactions that interact with RedStone oracle price feeds
              </p>
            </div>
            <div className="group p-6 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-slate-900 rounded-xl border border-emerald-400/40 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 text-white rounded-lg font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-slate-100">Zero Gas Fees</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                All transactions are sponsored - no ETH needed for gas!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
