import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useContractActivity, type ActivityEntry, type ActivityFilter } from '../hooks/useContractActivity';
import { LISK_SEPOLIA_PARAMS } from '../config/contracts';

const explorerBaseUrl = LISK_SEPOLIA_PARAMS.blockExplorerUrls[0];
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ACTIVITY_FILTER_OPTIONS: Array<{ id: ActivityFilter; label: string; description: string; icon: string }> = [
  {
    id: 'token-transfers',
    label: 'Token transfers',
    description: 'ERC-20 transfer events',
    icon: '🪙',
  },
  {
    id: 'nft-transfers',
    label: 'NFT transfers',
    description: 'ERC-721 transfer events',
    icon: '🎨',
  },
  {
    id: 'token-transactions',
    label: 'Token contract txs',
    description: 'Raw transactions for the ERC-20 contract',
    icon: '⚙️',
  },
  {
    id: 'nft-transactions',
    label: 'NFT contract txs',
    description: 'Raw transactions for the ERC-721 contract',
    icon: '🧾',
  },
];

function isZeroAddress(value?: string | null): boolean {
  if (!value) return false;
  return value.toLowerCase() === ZERO_ADDRESS;
}

function shortenAddress(address?: string | null): string {
  if (!address) return 'Not connected';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function shortenHash(hash?: string | null): string {
  if (!hash) return '—';
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

function formatTimestamp(timestampMs: number): string {
  if (!timestampMs) return '—';
  try {
    return new Date(timestampMs).toLocaleString();
  } catch (error) {
    console.debug('Failed to format timestamp', error);
    return '—';
  }
}

function getExplorerTxUrl(hash: string): string {
  return `${explorerBaseUrl}/tx/${hash}`;
}

function getExplorerAddressUrl(address: string): string {
  return `${explorerBaseUrl}/address/${address}`;
}

function formatFunctionName(signature?: string): string | undefined {
  if (!signature) return undefined;
  const name = signature.split('(')[0] ?? signature;
  return name.trim() || signature;
}

function formatGasUsed(gas?: string): string {
  if (!gas) return '—';
  const numeric = Number(gas);
  if (!Number.isFinite(numeric)) {
    return gas;
  }
  return numeric.toLocaleString();
}

function formatEthValue(value: string): string {
  if (!value) return '0';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  return numeric.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function formatRelativeTime(timestampMs: number): string {
  if (!timestampMs) return '—';
  const now = Date.now();
  const diff = now - timestampMs;
  if (!Number.isFinite(diff)) return '—';

  const diffSeconds = Math.round(Math.abs(diff) / 1000);
  const tenseSuffix = diff >= 0 ? 'ago' : 'from now';

  if (diffSeconds < 45) {
    return diff >= 0 ? 'Just now' : 'In a few seconds';
  }
  if (diffSeconds < 90) {
    return diff >= 0 ? '1 min ago' : 'In 1 min';
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ${tenseSuffix}`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ${tenseSuffix}`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ${tenseSuffix}`;
  }

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ${tenseSuffix}`;
  }

  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ${tenseSuffix}`;
}

function renderParticipant(address?: string | null, zeroVariant?: 'mint' | 'burn'): ReactNode {
  if (!address) {
    return <span className="activity-card__muted">—</span>;
  }

  if (zeroVariant && isZeroAddress(address)) {
    const label = zeroVariant === 'mint' ? 'Mint (0x0)' : 'Burn (0x0)';
    return <span className={`activity-address activity-address--${zeroVariant}`}>{label}</span>;
  }

  return (
    <a className="activity-card__link" href={getExplorerAddressUrl(address)} target="_blank" rel="noreferrer">
      {shortenAddress(address)}
    </a>
  );
}

function renderActivityEntry(entry: ActivityEntry) {
  if (entry.kind === 'token') {
    return (
      <article className="activity-card activity-card--token" key={entry.hash}>
        <header className="activity-card__header">
          <div className="activity-card__headline">
            <span className="activity-card__icon" aria-hidden="true">
              🪙
            </span>
            <div>
              <p className="activity-card__title">Token transfer</p>
              <time className="activity-card__time" dateTime={new Date(entry.timestamp).toISOString()}>
                {formatRelativeTime(entry.timestamp)}
              </time>
            </div>
          </div>
          <div className="activity-card__meta">
            <a className="activity-card__hash" href={getExplorerTxUrl(entry.hash)} target="_blank" rel="noreferrer">
              {shortenHash(entry.hash)}
            </a>
          </div>
        </header>

        <div className="activity-card__summary">
          <span className="activity-card__amount">{`${entry.amount} ${entry.symbol}`}</span>
          <span className="activity-card__subtle">{formatTimestamp(entry.timestamp)}</span>
        </div>

        <div className="activity-card__flow">
          <div className="activity-card__entity">
            <span className="activity-card__label">From</span>
            {renderParticipant(entry.from, 'mint')}
          </div>
          <span className="activity-card__arrow" aria-hidden="true">
            →
          </span>
          <div className="activity-card__entity">
            <span className="activity-card__label">To</span>
            {renderParticipant(entry.to, 'burn')}
          </div>
        </div>

        <dl className="activity-card__details">
          <div className="activity-card__detail">
            <dt>Gas used</dt>
            <dd>{formatGasUsed(entry.gasUsed)}</dd>
          </div>
          {entry.functionName ? (
            <div className="activity-card__detail">
              <dt>Function</dt>
              <dd>{formatFunctionName(entry.functionName)}</dd>
            </div>
          ) : null}
        </dl>
      </article>
    );
  }

  if (entry.kind === 'nft') {
    return (
      <article className="activity-card activity-card--nft" key={entry.hash}>
        <header className="activity-card__header">
          <div className="activity-card__headline">
            <span className="activity-card__icon" aria-hidden="true">
              🎨
            </span>
            <div>
              <p className="activity-card__title">NFT transfer</p>
              <time className="activity-card__time" dateTime={new Date(entry.timestamp).toISOString()}>
                {formatRelativeTime(entry.timestamp)}
              </time>
            </div>
          </div>
          <div className="activity-card__meta">
            <a className="activity-card__hash" href={getExplorerTxUrl(entry.hash)} target="_blank" rel="noreferrer">
              {shortenHash(entry.hash)}
            </a>
          </div>
        </header>

        <div className="activity-card__summary">
          <span className="activity-card__amount">Token #{entry.tokenId}</span>
          <span className="activity-card__subtle">{formatTimestamp(entry.timestamp)}</span>
        </div>

        <div className="activity-card__flow">
          <div className="activity-card__entity">
            <span className="activity-card__label">From</span>
            {renderParticipant(entry.from, 'mint')}
          </div>
          <span className="activity-card__arrow" aria-hidden="true">
            →
          </span>
          <div className="activity-card__entity">
            <span className="activity-card__label">To</span>
            {renderParticipant(entry.to, 'burn')}
          </div>
        </div>

        <dl className="activity-card__details">
          <div className="activity-card__detail">
            <dt>Gas used</dt>
            <dd>{formatGasUsed(entry.gasUsed)}</dd>
          </div>
          {entry.functionName ? (
            <div className="activity-card__detail">
              <dt>Function</dt>
              <dd>{formatFunctionName(entry.functionName)}</dd>
            </div>
          ) : null}
        </dl>
      </article>
    );
  }

  return (
    <article className="activity-card activity-card--transaction" key={entry.hash}>
      <header className="activity-card__header">
        <div className="activity-card__headline">
          <span className="activity-card__icon" aria-hidden="true">
            ⚡️
          </span>
          <div>
            <p className="activity-card__title">Contract transaction</p>
            <time className="activity-card__time" dateTime={new Date(entry.timestamp).toISOString()}>
              {formatRelativeTime(entry.timestamp)}
            </time>
          </div>
        </div>
        <div className="activity-card__meta">
          <span className={`status-text status-text--${entry.status ?? 'pending'}`}>
            {entry.status ?? 'pending'}
          </span>
          <a className="activity-card__hash" href={getExplorerTxUrl(entry.hash)} target="_blank" rel="noreferrer">
            {shortenHash(entry.hash)}
          </a>
        </div>
      </header>

      <div className="activity-card__summary">
        <span className="activity-card__amount">{`${formatEthValue(entry.valueEth)} ETH`}</span>
        <span className="activity-card__subtle">{formatTimestamp(entry.timestamp)}</span>
      </div>

      <div className="activity-card__flow">
        <div className="activity-card__entity">
          <span className="activity-card__label">From</span>
          {renderParticipant(entry.from)}
        </div>
        <span className="activity-card__arrow" aria-hidden="true">
          →
        </span>
        <div className="activity-card__entity">
          <span className="activity-card__label">To</span>
          {entry.to ? renderParticipant(entry.to) : <span className="activity-card__muted">—</span>}
        </div>
      </div>

      <dl className="activity-card__details">
        <div className="activity-card__detail">
          <dt>Gas used</dt>
          <dd>{formatGasUsed(entry.gasUsed)}</dd>
        </div>
        {entry.functionName ? (
          <div className="activity-card__detail">
            <dt>Function</dt>
            <dd>{formatFunctionName(entry.functionName)}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

export function ActivityFeed() {
  const [filter, setFilter] = useState<ActivityFilter>('token-transfers');
  const [page, setPage] = useState(1);

  const { entries, loading, error, hasMore } = useContractActivity(filter, page);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const emptyState = !loading && entries.length === 0;

  const handleFilterChange = useCallback((nextFilter: ActivityFilter) => {
    if (nextFilter === filter) return;
    setFilter(nextFilter);
  }, [filter]);

  const currentFilter = useMemo(
    () => ACTIVITY_FILTER_OPTIONS.find((option) => option.id === filter) ?? ACTIVITY_FILTER_OPTIONS[0],
    [filter],
  );

  const latestEntry = useMemo(() => (entries.length > 0 ? entries[0] : undefined), [entries]);
<<<<<<< HEAD
  const resultCountLabel = `${entries.length} result${entries.length === 1 ? '' : 's'}`;
  const currentResultsLabel = loading ? 'Loading…' : emptyState ? 'No results' : resultCountLabel;
  const footerSummary = loading
    ? `Loading page ${page}…`
    : emptyState
      ? `Page ${page} • No results`
      : `Page ${page} • ${resultCountLabel}`;
=======
  const currentResultsLabel = loading
    ? 'Loading…'
    : emptyState
      ? 'No results'
      : `${entries.length} result${entries.length === 1 ? '' : 's'}`;
>>>>>>> 73b81d5f1ff6ebe5faee8d960a30e4624410631b

  return (
    <section className="section section--activity">
      <div className="section-header">
        <div>
          <span className="section-eyebrow">Contract Activity</span>
          <h2>Indexed transactions &amp; events</h2>
        </div>
        <p className="section-description">
          Track on-chain transactions and emitted events for your token and NFT contracts.
        </p>
      </div>

      <div className="activity-filter" aria-label="Activity filters">
        {ACTIVITY_FILTER_OPTIONS.map((option) => {
          const isActive = option.id === filter;
          return (
            <button
              key={option.id}
              className={`activity-filter__button${isActive ? ' activity-filter__button--active' : ''}`}
              onClick={() => handleFilterChange(option.id)}
              type="button"
              aria-pressed={isActive}
            >
              <span className="activity-filter__icon" aria-hidden="true">
                {option.icon}
              </span>
              <span className="activity-filter__text">
                <span>{option.label}</span>
                <small>{option.description}</small>
              </span>
            </button>
          );
        })}
      </div>

      {currentFilter ? (
        <p className="activity-filter__hint">Showing {currentFilter.description.toLowerCase()}.</p>
      ) : null}

      {!loading && !emptyState ? (
        <div className="activity-overview" aria-live="polite">
          <div className="activity-overview__item">
            <span className="activity-overview__label">Latest activity</span>
            <span className="activity-overview__value">
              {latestEntry ? formatRelativeTime(latestEntry.timestamp) : '—'}
            </span>
            <span className="activity-overview__sub">
              {latestEntry ? formatTimestamp(latestEntry.timestamp) : 'Awaiting data'}
            </span>
          </div>
          <div className="activity-overview__item">
            <span className="activity-overview__label">This page</span>
            <span className="activity-overview__value">{currentResultsLabel}</span>
            <span className="activity-overview__sub">Page {page}</span>
          </div>
          <div className="activity-overview__item">
            <span className="activity-overview__label">Filter</span>
            <span className="activity-overview__value">{currentFilter.label}</span>
            <span className="activity-overview__sub">{currentFilter.description}</span>
          </div>
        </div>
      ) : null}

      {error ? <p className="message error">{error}</p> : null}

      <div className="activity-grid">
        {loading ? (
          <div className="activity-loading">Loading activity…</div>
        ) : emptyState ? (
          <div className="activity-empty">No activity found for this filter.</div>
        ) : (
          entries.map((entry) => renderActivityEntry(entry))
        )}
      </div>

      <footer className="activity-footer">
        <div>
          <span className="activity-page">Page {page}</span>
<<<<<<< HEAD
          <span className="activity-count">{footerSummary}</span>
=======
          <span className="activity-count">{currentResultsLabel}</span>
>>>>>>> 73b81d5f1ff6ebe5faee8d960a30e4624410631b
        </div>
        <div className="activity-pagination">
          <button
            type="button"
            className="button secondary"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasMore || loading}
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}
