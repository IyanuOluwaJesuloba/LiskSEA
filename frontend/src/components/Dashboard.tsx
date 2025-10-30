import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ContractTransactionResponse, formatUnits, parseUnits } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useTokenContract } from '../hooks/useTokenContract';
import { useNftContract } from '../hooks/useNftContract';
import {
  LISK_SEPOLIA_CHAIN_ID,
  LISK_SEPOLIA_PARAMS,
  LTOKEN_ADDRESS,
  LNFT_ADDRESS,
} from '../config/contracts';

const explorerBaseUrl = LISK_SEPOLIA_PARAMS.blockExplorerUrls[0];

type MessageState = {
  type: 'success' | 'error' | 'info';
  text: string;
};

type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string | null;
};

type NftInfo = {
  name: string;
  symbol: string;
  totalSupply: string;
  owner: string | null;
};

const initialTokenInfo: TokenInfo = {
  name: '',
  symbol: '',
  decimals: 18,
  totalSupply: '0',
  owner: null,
};

const initialNftInfo: NftInfo = {
  name: '',
  symbol: '',
  totalSupply: '0',
  owner: null,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unexpected error occurred';
}

function shortenAddress(address?: string | null): string {
  if (!address) return 'Not connected';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

async function waitForTx(tx: ContractTransactionResponse | undefined) {
  if (!tx) return;
  await tx.wait();
}

export function Dashboard() {
  const { provider, account, chainId, isConnecting, switchToLisk, isCorrectNetwork, hasProvider } = useWallet();
  const tokenContract = useTokenContract();
  const nftContract = useNftContract();

  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(initialTokenInfo);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenMessage, setTokenMessage] = useState<MessageState | null>(null);

  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  // const [mintTo, setMintTo] = useState('');
  // const [mintAmount, setMintAmount] = useState('');

  const [nftInfo, setNftInfo] = useState<NftInfo>(initialNftInfo);
  const [nftOwned, setNftOwned] = useState('0');
  const [nftLoading, setNftLoading] = useState(false);
  const [nftMessage, setNftMessage] = useState<MessageState | null>(null);
  const [mintUri, setMintUri] = useState('');
  // const [safeMintTo, setSafeMintTo] = useState('');
  // const [safeMintUri, setSafeMintUri] = useState('');

  const isWalletReady = Boolean(provider && account);
  const canInteract = isWalletReady && isCorrectNetwork;

  const networkLabel = useMemo(() => {
    if (!chainId) return 'Not connected';
    if (chainId === LISK_SEPOLIA_CHAIN_ID) return 'Lisk Sepolia Testnet';
    return `Chain ID ${chainId}`;
  }, [chainId]);

  const statusIndicators = useMemo(
    () => {
      const indicators: Array<{ id: string; label: string; value: string; tone: string }> = [];

      if (!hasProvider) {
        indicators.push({
          id: 'wallet',
          label: 'Wallet',
          value: 'Browser wallet unavailable',
          tone: 'muted',
        });
      } else {
        indicators.push({
          id: 'wallet',
          label: 'Wallet',
          value: account ? shortenAddress(account) : isConnecting ? 'Connecting…' : 'Not connected',
          tone: account ? 'success' : isConnecting ? 'info' : 'warning',
        });
      }

      indicators.push({
        id: 'network',
        label: 'Network',
        value: networkLabel,
        tone: !account ? 'muted' : isCorrectNetwork ? 'success' : 'error',
      });

      indicators.push({
        id: 'status',
        label: 'Status',
        value: !hasProvider
          ? 'Install a wallet to interact'
          : canInteract
          ? 'Ready to interact'
          : account
          ? 'Switch to Lisk Sepolia'
          : 'Connect your wallet',
        tone: !hasProvider ? 'muted' : canInteract ? 'success' : account ? 'warning' : 'info',
      });

      return indicators;
    },
    [hasProvider, account, isConnecting, networkLabel, isCorrectNetwork, canInteract]
  );

  const refreshTokenData = useCallback(async () => {
    if (!tokenContract || !account || !isCorrectNetwork) {
      setTokenInfo(initialTokenInfo);
      setTokenBalance('0');
      return;
    }

    setTokenLoading(true);
    try {
      const [name, symbol, decimalsRaw, supplyRaw, ownerAddress] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        tokenContract.owner(),
      ]);
      const decimals = Number(decimalsRaw);
      const balanceRaw = await tokenContract.balanceOf(account);

      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply: formatUnits(supplyRaw, decimals),
        owner: typeof ownerAddress === 'string' ? ownerAddress.toLowerCase() : null,
      });
      setTokenBalance(formatUnits(balanceRaw, decimals));
    } catch (error) {
      setTokenMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setTokenLoading(false);
    }
  }, [tokenContract, account, isCorrectNetwork]);

  const refreshNftData = useCallback(async () => {
    if (!nftContract || !account || !isCorrectNetwork) {
      setNftInfo(initialNftInfo);
      setNftOwned('0');
      return;
    }

    setNftLoading(true);
    try {
      const [name, symbol, supplyRaw, ownerAddress, balanceRaw] = await Promise.all([
        nftContract.name(),
        nftContract.symbol(),
        nftContract.totalSupply(),
        nftContract.owner(),
        nftContract.balanceOf(account),
      ]);

      setNftInfo({
        name,
        symbol,
        totalSupply: supplyRaw.toString(),
        owner: typeof ownerAddress === 'string' ? ownerAddress.toLowerCase() : null,
      });
      setNftOwned(balanceRaw.toString());
    } catch (error) {
      setNftMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setNftLoading(false);
    }
  }, [nftContract, account, isCorrectNetwork]);

  useEffect(() => {
    setTokenMessage(null);
    void refreshTokenData();
  }, [refreshTokenData]);

  useEffect(() => {
    setNftMessage(null);
    void refreshNftData();
  }, [refreshNftData]);

  const handleTransfer = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTokenMessage({ type: 'info', text: 'Submitting transfer…' });

    if (!provider || !tokenContract || !account) {
      setTokenMessage({ type: 'error', text: 'Wallet not connected' });
      return;
    }
    if (!transferTo || !transferAmount) {
      setTokenMessage({ type: 'error', text: 'Recipient and amount are required' });
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = tokenContract.connect(signer);
      const amount = parseUnits(transferAmount, tokenInfo.decimals);
      const transfer = contractWithSigner.getFunction('transfer');
      const tx = await transfer(transferTo, amount);
      await waitForTx(tx);
      setTokenMessage({ type: 'success', text: 'Transfer confirmed' });
      setTransferAmount('');
      setTransferTo('');
      await refreshTokenData();
    } catch (error) {
      setTokenMessage({ type: 'error', text: getErrorMessage(error) });
    }
  }, [provider, tokenContract, account, transferTo, transferAmount, tokenInfo.decimals, refreshTokenData]);

  // const handleMintToken = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setTokenMessage({ type: 'info', text: 'Submitting mint…' });

  //   if (!provider || !tokenContract || !account) {
  //     setTokenMessage({ type: 'error', text: 'Wallet not connected' });
  //     return;
  //   }
  //   if (!mintAmount) {
  //     setTokenMessage({ type: 'error', text: 'Amount is required' });
  //     return;
  //   }
  //   if (tokenInfo.owner && tokenInfo.owner !== account.toLowerCase()) {
  //     setTokenMessage({ type: 'error', text: 'Only the contract owner can mint tokens' });
  //     return;
  //   }

  //   try {
  //     const recipient = mintTo || account;
  //     const signer = await provider.getSigner();
  //     const contractWithSigner = tokenContract.connect(signer);
  //     const amount = parseUnits(mintAmount, tokenInfo.decimals);
  //     const mint = contractWithSigner.getFunction('mint');
  //     const tx = await mint(recipient, amount);
  //     await waitForTx(tx);
  //     setTokenMessage({ type: 'success', text: 'Mint successful' });
  //     setMintTo('');
  //     setMintAmount('');
  //     await refreshTokenData();
  //   } catch (error) {
  //     setTokenMessage({ type: 'error', text: getErrorMessage(error) });
  //   }
  // }, [provider, tokenContract, account, mintTo, mintAmount, tokenInfo.decimals, tokenInfo.owner, refreshTokenData]);

  const handleMintNft = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNftMessage({ type: 'info', text: 'Submitting mint…' });

    if (!provider || !nftContract || !account) {
      setNftMessage({ type: 'error', text: 'Wallet not connected' });
      return;
    }
    if (!mintUri) {
      setNftMessage({ type: 'error', text: 'Metadata URI is required' });
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = nftContract.connect(signer);
      const mint = contractWithSigner.getFunction('mint');
      const tx = await mint(mintUri);
      await waitForTx(tx);
      setNftMessage({ type: 'success', text: 'NFT minted to your wallet' });
      setMintUri('');
      await refreshNftData();
    } catch (error) {
      setNftMessage({ type: 'error', text: getErrorMessage(error) });
    }
  }, [provider, nftContract, account, mintUri, refreshNftData]);

  // const handleSafeMint = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setNftMessage({ type: 'info', text: 'Submitting safe mint…' });

  //   if (!provider || !nftContract || !account) {
  //     setNftMessage({ type: 'error', text: 'Wallet not connected' });
  //     return;
  //   }
  //   if (nftInfo.owner && nftInfo.owner !== account.toLowerCase()) {
  //     setNftMessage({ type: 'error', text: 'Only the contract owner can call safeMint' });
  //     return;
  //   }
  //   if (!safeMintTo || !safeMintUri) {
  //     setNftMessage({ type: 'error', text: 'Recipient and metadata URI are required' });
  //     return;
  //   }

  //   try {
  //     const signer = await provider.getSigner();
  //     const contractWithSigner = nftContract.connect(signer);
  //     const safeMint = contractWithSigner.getFunction('safeMint');
  //     const tx = await safeMint(safeMintTo, safeMintUri);
  //     await waitForTx(tx);
  //     setNftMessage({ type: 'success', text: 'NFT minted to recipient' });
  //     setSafeMintTo('');
  //     setSafeMintUri('');
  //     await refreshNftData();
  //   } catch (error) {
  //     setNftMessage({ type: 'error', text: getErrorMessage(error) });
  //   }
  // }, [provider, nftContract, account, nftInfo.owner, safeMintTo, safeMintUri, refreshNftData]);

  return (
    <main className="app-container">
      <header className="hero-card">
        <div className="hero-card__decor" aria-hidden="true" />
        <div className="hero-card__info">
          <span className="hero-tag">L-TOKEN</span>
          <h1>Command your token &amp; NFT footprint</h1>
          <p>Monitor live metrics and manage on-chain actions with a refined workspace.</p>
          <div className="hero-card__badges">
            {statusIndicators.map((indicator) => (
              <span key={indicator.id} className={`status-pill status-pill--${indicator.tone}`}>
                <span>{indicator.label}</span>
                <strong>{indicator.value}</strong>
              </span>
            ))}
          </div>
        </div>
        <aside className="hero-card__panel">
          <div className="hero-card__panel-inner">
            <div className="hero-card__panel-title">Connection</div>
            <p className="hero-card__panel-text">
              {isCorrectNetwork
                ? 'Everything is aligned to transact on Lisk Sepolia.'
                : 'Switch to Lisk Sepolia to unlock token and NFT actions.'}
            </p>
            <div className="hero-card__panel-actions">
              {!hasProvider ? (
                <div className="status-alert">
                  <p>
                    Configure <code>VITE_WALLETCONNECT_PROJECT_ID</code> to enable Web3Modal.
                  </p>
                </div>
              ) : (
                <w3m-button balance="hide" size="md" label={isConnecting ? 'Connecting…' : undefined} />
              )}
              {account && !isCorrectNetwork && (
                <button className="button warning" onClick={() => switchToLisk()}>
                  Switch to Lisk Sepolia
                </button>
              )}
            </div>
            <div className="hero-card__panel-footer">
              <span>Explorer</span>
              <a href={explorerBaseUrl} target="_blank" rel="noreferrer">
                Open Lisk Dashboard 
              </a>
            </div>
          </div>
        </aside>
      </header>

      <section className="section section--overview">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Assets Overview</span>
            <h2>Understand your supply and holdings</h2>
          </div>
          <p className="section-description">Live token and NFT metrics streaming from your deployed contracts.</p>
        </div>
        <div className="overview-grid">
          <article className="overview-card overview-card--token">
            <header className="overview-header">
              <div className="overview-header__row">
                <span className="chip chip--token">{tokenInfo.symbol || 'LSEA'} • ERC-20</span>
                <a
                  className="chip-link"
                  href={`${explorerBaseUrl}/address/${LTOKEN_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View contract
                </a>
              </div>
              <h2>{tokenInfo.name || 'LToken'}</h2>
              <p className="card-subtitle">Fungible supply details and your wallet balance.</p>
            </header>
            <dl className="stats-grid">
              <div className="stat">
                <dt>Total Supply</dt>
                <dd>{tokenLoading ? 'Loading…' : `${tokenInfo.totalSupply} ${tokenInfo.symbol || ''}`}</dd>
              </div>
              <div className="stat">
                <dt>Your Balance</dt>
                <dd>{tokenLoading ? 'Loading…' : `${tokenBalance} ${tokenInfo.symbol || ''}`}</dd>
              </div>
              <div className="stat">
                <dt>Decimals</dt>
                <dd>{tokenInfo.decimals}</dd>
              </div>
              <div className="stat">
                <dt>Owner</dt>
                <dd>{tokenInfo.owner ? shortenAddress(tokenInfo.owner) : '—'}</dd>
              </div>
            </dl>
          </article>

          <article className="overview-card overview-card--nft">
            <header className="overview-header">
              <div className="overview-header__row">
                <span className="chip chip--nft">{nftInfo.symbol || 'LNFT'} • ERC-721</span>
                <a
                  className="chip-link"
                  href={`${explorerBaseUrl}/address/${LNFT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View contract
                </a>
              </div>
              <h2>{nftInfo.name || 'LNFT'}</h2>
              <p className="card-subtitle">Track minted collectibles and holdings tied to your wallet.</p>
            </header>
            <dl className="stats-grid">
              <div className="stat">
                <dt>Total Supply</dt>
                <dd>{nftLoading ? 'Loading…' : nftInfo.totalSupply}</dd>
              </div>
              <div className="stat">
                <dt>Your Holdings</dt>
                <dd>{nftLoading ? 'Loading…' : nftOwned}</dd>
              </div>
              <div className="stat">
                <dt>Owner</dt>
                <dd>{nftInfo.owner ? shortenAddress(nftInfo.owner) : '—'}</dd>
              </div>
              <div className="stat">
                <dt>Contract</dt>
                <dd>
                  <a href={`${explorerBaseUrl}/address/${LNFT_ADDRESS}`} target="_blank" rel="noreferrer">
                    {shortenAddress(LNFT_ADDRESS)}
                  </a>
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="section section--actions">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Actions</span>
            <h2>Execute on-chain operations</h2>
          </div>
          <p className="section-description">
            Transfer tokens or mint NFTs with contextual feedback and guardrails.
          </p>
        </div>
        <div className="action-grid">
          <article className="action-card action-card--token">
            <header className="action-header">
              <div>
                <span className="chip chip--token">Token Controls</span>
                <h3>ERC-20 Operations</h3>
              </div>
              <p className="card-subtitle">Transfer LSEA seamlessly or run owner mints when connected.</p>
            </header>
            <div className="form-grid">
              <form className="form form--accent" onSubmit={handleTransfer}>
                <h4>Transfer Tokens</h4>
                <label>
                  Recipient Address
                  <input
                    type="text"
                    value={transferTo}
                    onChange={(event) => setTransferTo(event.target.value)}
                    placeholder="0x..."
                    disabled={!canInteract}
                    required
                  />
                </label>
                <label>
                  Amount ({tokenInfo.symbol || 'LSEA'})
                  <input
                    type="text"
                    value={transferAmount}
                    onChange={(event) => setTransferAmount(event.target.value)}
                    placeholder="0.0"
                    disabled={!canInteract}
                    required
                  />
                </label>
                <button className="button primary" type="submit" disabled={!canInteract}>
                  Send Tokens
                </button>
                {!canInteract && (
                  <p className="form-hint">Connect your wallet and select Lisk Sepolia to enable this form.</p>
                )}
              </form>

              {/* <form className="form form--outline" onSubmit={handleMintToken}>
                <h4>Mint Tokens (Owner)</h4>
                <label>
                  Recipient Address
                  <input
                    type="text"
                    value={mintTo}
                    onChange={(event) => setMintTo(event.target.value)}
                    placeholder="Defaults to your wallet"
                    disabled={!canInteract}
                  />
                </label>
                <label>
                  Amount ({tokenInfo.symbol || 'LSEA'})
                  <input
                    type="text"
                    value={mintAmount}
                    onChange={(event) => setMintAmount(event.target.value)}
                    placeholder="0.0"
                    disabled={!canInteract}
                    required
                  />
                </label>
                <button className="button secondary" type="submit" disabled={!canInteract}>
                  Mint Tokens
                </button>
              </form> */}
            </div>
            {tokenMessage && <p className={`message ${tokenMessage.type}`}>{tokenMessage.text}</p>}
          </article>

          <article className="action-card action-card--nft">
            <header className="action-header">
              <div>
                <span className="chip chip--nft">NFT Controls</span>
                <h3>ERC-721 Operations</h3>
              </div>
              <p className="card-subtitle">Mint NFTs directly to your wallet with curated metadata.</p>
            </header>
            <div className="form-grid">
              <form className="form form--accent" onSubmit={handleMintNft}>
                <h4>Public Mint</h4>
                <label>
                  Metadata URI
                  <input
                    type="text"
                    value={mintUri}
                    onChange={(event) => setMintUri(event.target.value)}
                    placeholder="ipfs://..."
                    disabled={!canInteract}
                    required
                  />
                </label>
                <button className="button primary" type="submit" disabled={!canInteract}>
                  Mint to Wallet
                </button>
                {!canInteract && (
                  <p className="form-hint">Connect your wallet and select Lisk Sepolia to enable this form.</p>
                )}
              </form>

              {/* <form className="form form--outline" onSubmit={handleSafeMint}>
                <h4>Safe Mint (Owner)</h4>
                <label>
                  Recipient Address
                  <input
                    type="text"
                    value={safeMintTo}
                    onChange={(event) => setSafeMintTo(event.target.value)}
                    placeholder="0x..."
                    disabled={!canInteract}
                    required
                  />
                </label>
                <label>
                  Metadata URI
                  <input
                    type="text"
                    value={safeMintUri}
                    onChange={(event) => setSafeMintUri(event.target.value)}
                    placeholder="ipfs://..."
                    disabled={!canInteract}
                    required
                  />
                </label>
                <button className="button secondary" type="submit" disabled={!canInteract}>
                  Safe Mint NFT
                </button>
              </form> */}
            </div>
            {nftMessage && <p className={`message ${nftMessage.type}`}>{nftMessage.text}</p>}
          </article>
        </div>
      </section>
    </main>
  );
}
