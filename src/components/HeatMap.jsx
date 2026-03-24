import React, { useState } from 'react'
import { fmtPct } from '../lib/dataService'

const SECTORS = [
  {
    name: 'Technology', abbr: 'XLK', tickers: [
      { s: 'AAPL', n: 'Apple' }, { s: 'MSFT', n: 'Microsoft' }, { s: 'NVDA', n: 'Nvidia' },
      { s: 'AVGO', n: 'Broadcom' }, { s: 'ORCL', n: 'Oracle' }, { s: 'CRM', n: 'Salesforce' },
    ]
  },
  {
    name: 'Financials', abbr: 'XLF', tickers: [
      { s: 'JPM', n: 'JPMorgan' }, { s: 'BAC', n: 'BofA' }, { s: 'WFC', n: 'Wells Fargo' },
      { s: 'GS', n: 'Goldman' }, { s: 'MS', n: 'Morgan Stanley' }, { s: 'BLK', n: 'BlackRock' },
    ]
  },
  {
    name: 'Consumer', abbr: 'XLY', tickers: [
      { s: 'AMZN', n: 'Amazon' }, { s: 'TSLA', n: 'Tesla' }, { s: 'MCD', n: 'McDonald\'s' },
      { s: 'NKE', n: 'Nike' }, { s: 'SBUX', n: 'Starbucks' }, { s: 'TGT', n: 'Target' },
    ]
  },
  {
    name: 'Healthcare', abbr: 'XLV', tickers: [
      { s: 'UNH', n: 'UnitedHealth' }, { s: 'JNJ', n: 'J&J' }, { s: 'LLY', n: 'Eli Lilly' },
      { s: 'ABBV', n: 'AbbVie' }, { s: 'MRK', n: 'Merck' }, { s: 'PFE', n: 'Pfizer' },
    ]
  },
  {
    name: 'Energy', abbr: 'XLE', tickers: [
      { s: 'XOM', n: 'Exxon' }, { s: 'CVX', n: 'Chevron' }, { s: 'COP', n: 'ConocoPhillips' },
      { s: 'SLB', n: 'Schlumberger' }, { s: 'EOG', n: 'EOG Res.' }, { s: 'OXY', n: 'Occidental' },
    ]
  },
  {
    name: 'Comm. Svcs', abbr: 'XLC', tickers: [
      { s: 'META', n: 'Meta' }, { s: 'GOOGL', n: 'Alphabet' }, { s: 'NFLX', n: 'Netflix' },
      { s: 'DIS', n: 'Disney' }, { s: 'T', n: 'AT&T' }, { s: 'VZ', n: 'Verizon' },
    ]
  },
  {
    name: 'Industrials', abbr: 'XLI', tickers: [
      { s: 'CAT', n: 'Caterpillar' }, { s: 'HON', n: 'Honeywell' }, { s: 'UPS', n: 'UPS' },
      { s: 'RTX', n: 'Raytheon' }, { s: 'BA', n: 'Boeing' }, { s: 'GE', n: 'GE' },
    ]
  },
  {
    name: 'Utilities', abbr: 'XLU', tickers: [
      { s: 'NEE', n: 'NextEra' }, { s: 'DUK', n: 'Duke' }, { s: 'SO', n: 'Southern Co.' },
      { s: 'D', n: 'Dominion' }, { s: 'AEP', n: 'Am. Elec.' }, { s: 'EXC', n: 'Exelon' },
    ]
  },
]

function colorForChange(pct) {
  if (pct == null) return 'var(--bg-card)'
  const abs = Math.min(Math.abs(pct), 5)
  const intensity = abs / 5
  if (pct > 0) {
    const g = Math.round(100 + intensity * 100)
    const r = Math.round(10 - intensity * 10)
    return `rgba(${r},${g},${Math.round(80 * (1 - intensity))},${0.2 + intensity * 0.5})`
  } else {
    const r = Math.round(150 + intensity * 105)
    const g = Math.round(20 - intensity * 20)
    return `rgba(${r},${g},${Math.round(40 * (1 - intensity))},${0.2 + intensity * 0.5})`
  }
}

function textColorForChange(pct) {
  if (pct == null) return 'var(--text-muted)'
  return pct >= 0 ? 'var(--green)' : 'var(--red)'
}

export default function HeatMap({ watchlistData, onSelectFocus }) {
  const [view, setView] = useState('sectors') // sectors | flat

  // Build a lookup from watchlist data
  const lookup = {}
  watchlistData.forEach(q => { lookup[q.symbol] = q })

  const sectorSummary = SECTORS.map(sec => {
    const changes = sec.tickers.map(t => lookup[t.s]?.changePct).filter(v => v != null)
    const avg = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : null
    return { ...sec, avg }
  })

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <span className="panel-label">Market Heatmap</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {['sectors', 'flat'].map(v => (
            <button key={v}
              onClick={() => setView(v)}
              style={{
                fontSize: 9, fontWeight: 700, padding: '2px 8px',
                borderRadius: 2, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: view === v ? 'var(--accent-orange)' : 'var(--text-muted)',
                background: view === v ? 'rgba(245,166,35,0.1)' : 'transparent',
                border: view === v ? '1px solid var(--accent-orange-dim)' : '1px solid transparent',
              }}
            >{v}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: 8, overflowY: 'auto', flex: 1 }}>
        {view === 'sectors' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sectorSummary.map(sec => (
              <div key={sec.abbr}>
                {/* Sector header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{sec.name}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{sec.abbr}</span>
                  </div>
                  {sec.avg != null && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: textColorForChange(sec.avg) }}>
                      {fmtPct(sec.avg)} avg
                    </span>
                  )}
                </div>

                {/* Ticker tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
                  {sec.tickers.map(t => {
                    const q = lookup[t.s]
                    const pct = q?.changePct
                    return (
                      <div key={t.s}
                        onClick={() => onSelectFocus(t.s)}
                        style={{
                          padding: '5px 4px',
                          background: colorForChange(pct),
                          border: '1px solid var(--border-dim)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all var(--transition)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-dim)'}
                      >
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-bright)' }}>{t.s}</div>
                        <div style={{ fontSize: 9, color: textColorForChange(pct), fontWeight: 600 }}>
                          {pct != null ? fmtPct(pct) : '--'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat view — all watchlist stocks as tiles
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 4 }}>
            {watchlistData.map(q => (
              <div key={q.symbol}
                onClick={() => onSelectFocus(q.symbol)}
                style={{
                  padding: '8px 6px',
                  background: colorForChange(q.changePct),
                  border: '1px solid var(--border-dim)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-dim)'}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>{q.symbol}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: textColorForChange(q.changePct) }}>
                  {fmtPct(q.changePct)}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>
                  {q.price ? Number(q.price).toFixed(0) : '--'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
